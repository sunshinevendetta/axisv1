import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Tesseract from "tesseract.js";
import {
  allocateDrinkId,
  getClaimStore,
  getParticipantMissionStore,
  type StoredClaim,
} from "@/src/lib/okx-store";

export const runtime = "nodejs";

type ClaimBody = {
  missionId?: string;
  participantId?: string;
  proofName?: string;
  hasProofImage?: boolean;
  proofImageDataUrl?: string;
  lang?: string;
};

type ParsedImage = {
  buffer: Buffer;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
};

type ImageDimensions = {
  width: number;
  height: number;
};

type OcrRectangle = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type OcrResult = {
  text: string;
  uidText: string;
  provider: string;
  confidence?: number;
};

type UidValidation = OcrResult & {
  ok: boolean;
};

type ProofEmailDelivery = {
  method: "brevo-api" | "brevo-smtp";
  to: string[];
  cc: string[];
  subject: string;
  attachmentName: string;
  accepted: boolean;
  providerMessageId?: string;
  apiFallbackError?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const claimErrors: Record<string, { required: string; invalid: string; unreadable: string; tooLarge: string }> = {
  es: {
    required: "Sube screenshot de pantalla completa de OKX donde se vea tu UID.",
    invalid: "No encontramos UID en ese screenshot. Sube una captura donde se vea el texto UID o tu numero UID.",
    unreadable: "No pudimos leer el screenshot. Sube una imagen mas clara donde se vea tu UID.",
    tooLarge: "El screenshot pesa demasiado. Sube una captura mas ligera donde se vea tu UID.",
  },
  en: {
    required: "Upload a full-screen OKX screenshot where your UID is visible.",
    invalid: "We could not find UID in that screenshot. Upload a screenshot where the UID label or your UID number is visible.",
    unreadable: "We could not read the screenshot. Upload a clearer image where your UID is visible.",
    tooLarge: "The screenshot is too large. Upload a lighter screenshot where your UID is visible.",
  },
};

const NVIDIA_OCR_ENDPOINT = "https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v1";
const TESSERACT_TIMEOUT_MS = 25000;
const REQUIRED_PROOF_CC = [
  "rubi@orbitarstudio.com",
  "anthony.chavez@okx.com",
  "Karina.caudillo@okx.com",
  "infoaxishow@gmail.com",
];

function getClaimErrors(lang?: string) {
  return claimErrors[lang || ""] || claimErrors.en;
}

function parseImageDataUrl(dataUrl: unknown) {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  if (match[2].length > 7_500_000) return "too-large";
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 8_000) return null;
  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  return { buffer, mimeType: mimeType as ParsedImage["mimeType"] };
}

function normalizeOcrText(text: string) {
  return text
    .toUpperCase()
    .replace(/[|]/g, "I")
    .replace(/[^A-Z0-9\s:.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUidCandidate(value: string) {
  return value
    .toUpperCase()
    .replace(/[OQ]/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/\D/g, "")
    .slice(0, 32);
}

function findLikelyUidNumber(text: string) {
  const candidates = Array.from(text.matchAll(/[0-9OQIL][0-9OQIL\s:.-]{4,40}[0-9OQIL]/g))
    .map((match) => cleanUidCandidate(match[0]))
    .filter((candidate) => candidate.length >= 6);

  const preferred = candidates
    .filter((candidate) => candidate.length >= 12 && candidate.length <= 22)
    .sort((a, b) => b.length - a.length)[0];

  return preferred || candidates.sort((a, b) => b.length - a.length)[0] || "";
}

function extractUidText(text: string) {
  const normalized = normalizeOcrText(text);
  const uidLabel = /\bU\s*(?:I|1|L)?\s*D\b/.exec(normalized);

  if (uidLabel?.index !== undefined) {
    const nearUid = normalized.slice(uidLabel.index, uidLabel.index + 180);
    const cleaned = findLikelyUidNumber(nearUid);
    if (cleaned.length >= 6) return cleaned;
  }

  const cleaned = findLikelyUidNumber(normalized);
  return cleaned.length >= 6 ? cleaned : "";
}

function hasUidEvidence(text: string, uidText: string) {
  const normalized = normalizeOcrText(text);
  const hasUidLabel = /\bU\s*(?:I|1|L)?\s*D\b/.test(normalized);
  return hasUidLabel || uidText.length >= 6;
}

function validateUidScreenshotText(text: string, provider: string, confidence?: number): UidValidation {
  const uidText = extractUidText(text);
  return {
    ok: hasUidEvidence(text, uidText),
    text: normalizeOcrText(text).slice(0, 1200),
    uidText,
    provider,
    confidence,
  };
}

function getNvidiaApiKey() {
  return (
    process.env.NVIDIA_API_KEY?.trim() ||
    process.env.NVIDIA_BUILD_API_KEY?.trim() ||
    process.env.NVAPI_KEY?.trim() ||
    ""
  );
}

function getNvidiaOcrEndpoint() {
  return process.env.NVIDIA_OCR_ENDPOINT?.trim() || NVIDIA_OCR_ENDPOINT;
}

function dataUrlForOcr(image: ParsedImage) {
  return `data:${image.mimeType};base64,${image.buffer.toString("base64")}`;
}

function getImageDimensions(image: ParsedImage): ImageDimensions | null {
  const { buffer, mimeType } = image;
  if (mimeType === "image/png" && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (mimeType === "image/jpeg") {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) return null;

      if (
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf
      ) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + length;
    }
  }

  return null;
}

function rectangleFromRatios(dimensions: ImageDimensions, left: number, top: number, width: number, height: number) {
  return {
    left: Math.max(0, Math.round(dimensions.width * left)),
    top: Math.max(0, Math.round(dimensions.height * top)),
    width: Math.max(1, Math.round(dimensions.width * width)),
    height: Math.max(1, Math.round(dimensions.height * height)),
  };
}

function okxUidRectangles(image: ParsedImage) {
  const dimensions = getImageDimensions(image);
  if (!dimensions) return [];

  return [
    {
      label: "uid-number-row-tight",
      digitsOnly: true,
      rectangle: rectangleFromRatios(dimensions, 0.06, 0.525, 0.72, 0.055),
    },
    {
      label: "uid-number-row-wide",
      digitsOnly: true,
      rectangle: rectangleFromRatios(dimensions, 0.04, 0.50, 0.86, 0.09),
    },
    {
      label: "uid-label-and-number",
      digitsOnly: false,
      rectangle: rectangleFromRatios(dimensions, 0.04, 0.485, 0.9, 0.13),
    },
    {
      label: "uid-account-card-top",
      digitsOnly: false,
      rectangle: rectangleFromRatios(dimensions, 0.035, 0.47, 0.86, 0.16),
    },
    {
      label: "account-information-card",
      digitsOnly: false,
      rectangle: rectangleFromRatios(dimensions, 0.02, 0.43, 0.94, 0.27),
    },
  ];
}

function collectOcrPayloadText(value: unknown, texts: string[], confidences: number[], key = "") {
  if (typeof value === "string") {
    const normalizedKey = key.toLowerCase();
    if (
      ["text", "content", "raw_text", "recognized_text", "markdown", "transcript"].includes(normalizedKey) ||
      normalizedKey.endsWith("_text")
    ) {
      const trimmed = value.trim();
      if (trimmed) texts.push(trimmed);
    }
    return;
  }

  if (typeof value === "number" && key.toLowerCase().includes("confidence") && Number.isFinite(value)) {
    confidences.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectOcrPayloadText(item, texts, confidences, key);
    return;
  }

  if (!value || typeof value !== "object") return;
  for (const [childKey, childValue] of Object.entries(value)) {
    collectOcrPayloadText(childValue, texts, confidences, childKey);
  }
}

function parseNvidiaOcrPayload(payload: unknown): { text: string; confidence?: number } {
  const texts: string[] = [];
  const confidences: number[] = [];
  collectOcrPayloadText(payload, texts, confidences);

  return {
    text: Array.from(new Set(texts)).join("\n"),
    confidence: confidences.length
      ? confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
      : undefined,
  };
}

async function readScreenshotWithNvidia(image: ParsedImage): Promise<OcrResult> {
  const apiKey = getNvidiaApiKey();
  if (!apiKey) throw new Error("Missing NVIDIA_API_KEY");
  if (image.mimeType === "image/webp") {
    throw new Error("NVIDIA OCR supports PNG/JPEG inputs; falling back for WebP");
  }

  const response = await fetch(getNvidiaOcrEndpoint(), {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(Number(process.env.NVIDIA_OCR_TIMEOUT_MS) || 12000),
    body: JSON.stringify({
      input: [{ type: "image_url", url: dataUrlForOcr(image) }],
      merge_levels: ["word"],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = JSON.stringify(payload).slice(0, 500);
    throw new Error(`NVIDIA OCR failed with ${response.status}: ${detail}`);
  }

  const parsed = parseNvidiaOcrPayload(payload);
  if (!parsed.text.trim()) throw new Error("NVIDIA OCR returned no text");

  const validation = validateUidScreenshotText(parsed.text, "nvidia-nemotron-ocr", parsed.confidence);
  return {
    text: validation.text,
    uidText: validation.uidText,
    provider: validation.provider,
    confidence: validation.confidence,
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeout: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function readScreenshotWithTesseract(image: ParsedImage): Promise<OcrResult> {
  const run = async () => {
    const worker = await Tesseract.createWorker("eng");
    const texts: string[] = [];
    const rectangles = okxUidRectangles(image);

    try {
      await worker.setParameters({
        preserve_interword_spaces: "1",
      });

      for (const pass of rectangles) {
        if (pass.digitsOnly) {
          await worker.setParameters({
            tessedit_char_whitelist: "0123456789",
            preserve_interword_spaces: "1",
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
          });
        } else {
          await worker.setParameters({
            tessedit_char_whitelist: "",
            preserve_interword_spaces: "1",
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          });
        }

        const result = await worker.recognize(image.buffer, { rectangle: pass.rectangle as OcrRectangle });
        const text = result.data.text?.trim();
        if (text) texts.push(`${pass.label}\n${text}`);

        const validation = validateUidScreenshotText(text || "", "tesseract-okx-uid");
        if (validation.uidText.length >= 12) {
          return validation;
        }
      }

      await worker.setParameters({
        tessedit_char_whitelist: "",
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });
      const fullResult = await worker.recognize(image.buffer);
      if (fullResult.data.text?.trim()) texts.push(`full-image\n${fullResult.data.text.trim()}`);

      return validateUidScreenshotText(texts.join("\n"), "tesseract-okx-uid");
    } finally {
      await worker.terminate();
    }
  };

  const validation = await withTimeout(run(), TESSERACT_TIMEOUT_MS, "Tesseract UID OCR");
  return {
    text: validation.text,
    uidText: validation.uidText,
    provider: validation.provider,
    confidence: validation.confidence,
  };
}

async function readScreenshotOcr(image: ParsedImage): Promise<OcrResult> {
  if (getNvidiaApiKey()) {
    try {
      const nvidia = await readScreenshotWithNvidia(image);
      if (hasUidEvidence(nvidia.text, nvidia.uidText)) return nvidia;

      console.warn("[okx/claim] NVIDIA OCR found text but no UID number, trying targeted Tesseract");
      const tesseract = await readScreenshotWithTesseract(image);
      return {
        text: [nvidia.text, tesseract.text].filter(Boolean).join("\n"),
        uidText: tesseract.uidText || nvidia.uidText,
        provider: `${nvidia.provider}+${tesseract.provider}`,
        confidence: nvidia.confidence,
      };
    } catch (error) {
      console.error("[okx/claim] NVIDIA OCR failed, falling back to Tesseract", error);
    }
  }

  return readScreenshotWithTesseract(image);
}

async function validateUidScreenshot(image: ParsedImage): Promise<UidValidation> {
  const ocr = await readScreenshotOcr(image);
  return {
    ...ocr,
    ok: hasUidEvidence(ocr.text, ocr.uidText),
  };
}

function makeTransporter() {
  const smtpUser = process.env.BREVO_SMTP_USER || "a2dee5001@smtp-brevo.com";
  if (!process.env.BREVO_SMTP_PASS) {
    throw new Error("Missing BREVO_SMTP_PASS");
  }

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: process.env.BREVO_SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function getBrevoApiKey() {
  return process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || "";
}

function imageExtensionFromMime(mimeType: ParsedImage["mimeType"]) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function imageContentType(extension: string) {
  return `image/${extension === "jpg" ? "jpeg" : extension}`;
}

function proofAttachmentName(claim: StoredClaim, extension: string) {
  return `okx-${claim.participantId}-${claim.missionId}-${claim.claimId}.${extension}`;
}

function uniqueEmails(emails: string[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const email of emails) {
    const normalized = email.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    unique.push(normalized);
  }
  return unique;
}

function emailList(value: string | undefined) {
  return value?.split(",").map((email) => email.trim()).filter(Boolean) || [];
}

function getProofEmailRecipients() {
  const fromEnv = uniqueEmails(emailList(process.env.OKX_PROOF_TO));
  if (fromEnv.length) return fromEnv;

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail && !REQUIRED_PROOF_CC.some((email) => email.toLowerCase() === adminEmail.toLowerCase())) {
    return [adminEmail];
  }

  return ["hello@axis.show"];
}

function getProofEmailCopy(recipients: string[]) {
  const recipientSet = new Set(recipients.map((email) => email.toLowerCase()));
  return uniqueEmails([...emailList(process.env.OKX_PROOF_CC), ...REQUIRED_PROOF_CC])
    .filter((email) => !recipientSet.has(email.toLowerCase()));
}

function getProofSender() {
  return {
    name: process.env.OKX_PROOF_SENDER_NAME || "AXIS OKX",
    email: process.env.OKX_PROOF_SENDER_EMAIL || process.env.CUSTOM_FROM || "rsvp@axis.show",
  };
}

function getProofReplyTo() {
  return process.env.OKX_PROOF_REPLY_TO || "infoaxishow@gmail.com";
}

function makeRedeemUrl(origin: string, claim: Pick<StoredClaim, "claimId" | "participantId" | "missionId" | "drinkId" | "uidText">) {
  const url = new URL(`/api/okx/redeem/${encodeURIComponent(claim.claimId)}`, origin);
  url.searchParams.set("p", claim.participantId);
  url.searchParams.set("m", claim.missionId);
  url.searchParams.set("d", String(claim.drinkId));
  if (claim.uidText) url.searchParams.set("u", claim.uidText);
  return url.toString();
}

function makeQrUrl(redeemUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(redeemUrl)}`;
}

function makeProofEmailContent({
  claim,
  redeemUrl,
  ocrText,
}: {
  claim: StoredClaim;
  redeemUrl: string;
  ocrText: string;
}) {
  const safeMission = escapeHtml(claim.missionId);
  const safeClaim = escapeHtml(claim.claimId);
  const safeParticipant = escapeHtml(claim.participantId);
  const safeDrinkId = escapeHtml(String(claim.drinkId));
  const safeProvider = escapeHtml(claim.ocrProvider || "none");
  const safeProof = escapeHtml(claim.proofName || "screenshot");
  const safeRedeem = escapeHtml(redeemUrl);
  const safeOcr = escapeHtml(ocrText || "No OCR text extracted");

  return {
    subject: `OKX proof ${claim.participantId} / drink #${claim.drinkId} / ${claim.claimId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;background:#050505;color:#fff;">
        <h2 style="margin:0 0 14px;">OKX mission proof received</h2>
        <p><strong>Participant:</strong> ${safeParticipant}</p>
        <p><strong>Mission:</strong> ${safeMission}</p>
        <p><strong>Drink ID:</strong> ${safeDrinkId}</p>
        <p><strong>QR claim code:</strong> ${safeClaim}</p>
        <p><strong>OCR provider:</strong> ${safeProvider}</p>
        <p><strong>Proof file:</strong> ${safeProof}</p>
        <p><strong>Redeem URL:</strong> <a href="${safeRedeem}" style="color:#c9ff4a;">${safeRedeem}</a></p>
        <h3 style="margin-top:20px;">OCR text</h3>
        <pre style="white-space:pre-wrap;background:#111;padding:12px;border-radius:12px;color:#ddd;">${safeOcr}</pre>
      </div>
    `,
    text: [
      "OKX mission proof received",
      `Participant: ${claim.participantId}`,
      `Mission: ${claim.missionId}`,
      `Drink ID: ${claim.drinkId}`,
      `QR claim code: ${claim.claimId}`,
      `OCR provider: ${claim.ocrProvider || "none"}`,
      `Proof file: ${claim.proofName || "screenshot"}`,
      `Redeem URL: ${redeemUrl}`,
      "",
      "OCR text:",
      ocrText || "No OCR text extracted",
    ].join("\n"),
  };
}

async function sendProofEmailWithBrevoApi({
  claim,
  redeemUrl,
  image,
  imageMimeType,
  ocrText,
  recipients,
}: {
  claim: StoredClaim;
  redeemUrl: string;
  image: Buffer;
  imageMimeType: ParsedImage["mimeType"];
  ocrText: string;
  recipients: string[];
}): Promise<ProofEmailDelivery> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) throw new Error("Missing BREVO_API_KEY");

  const email = makeProofEmailContent({ claim, redeemUrl, ocrText });
  const sender = getProofSender();
  const cc = getProofEmailCopy(recipients);
  const replyTo = getProofReplyTo();
  const extension = imageExtensionFromMime(imageMimeType);
  const attachmentName = proofAttachmentName(claim, extension);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    signal: (AbortSignal as typeof AbortSignal & { timeout?: (ms: number) => AbortSignal }).timeout?.(20000),
    body: JSON.stringify({
      sender: {
        name: sender.name,
        email: sender.email,
      },
      to: recipients.map((emailAddress) => ({ email: emailAddress })),
      cc: cc.map((emailAddress) => ({ email: emailAddress })),
      replyTo: replyTo ? { email: replyTo, name: "AXIS" } : undefined,
      subject: email.subject,
      htmlContent: email.html,
      textContent: email.text,
      attachment: [
        {
          name: attachmentName,
          content: image.toString("base64"),
        },
      ],
    }),
  });

  const responseText = await response.text().catch(() => "");
  if (!response.ok) {
    const detail = responseText;
    throw new Error(`Brevo API failed with ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload: { messageId?: string } = responseText
    ? await Promise.resolve().then(() => JSON.parse(responseText) as { messageId?: string }).catch(() => ({}))
    : {};
  return {
    method: "brevo-api",
    to: recipients,
    cc,
    subject: email.subject,
    attachmentName,
    accepted: true,
    providerMessageId: payload.messageId,
  };
}

async function sendProofEmail({
  claim,
  redeemUrl,
  image,
  imageMimeType,
  ocrText,
}: {
  claim: StoredClaim;
  redeemUrl: string;
  image: Buffer;
  imageMimeType: ParsedImage["mimeType"];
  ocrText: string;
}): Promise<ProofEmailDelivery> {
  const recipients = getProofEmailRecipients();
  let apiFallbackError = "";

  if (getBrevoApiKey()) {
    try {
      return await sendProofEmailWithBrevoApi({ claim, redeemUrl, image, imageMimeType, ocrText, recipients });
    } catch (error) {
      apiFallbackError = error instanceof Error ? error.message : String(error);
      console.error("[okx/claim] Brevo API proof email failed, falling back to SMTP", error);
      if (!process.env.BREVO_SMTP_PASS) throw error;
    }
  }

  const transporter = makeTransporter();
  const email = makeProofEmailContent({ claim, redeemUrl, ocrText });
  const sender = getProofSender();
  const extension = imageExtensionFromMime(imageMimeType);
  const attachmentName = proofAttachmentName(claim, extension);
  const cc = getProofEmailCopy(recipients);
  const result = await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: recipients,
    cc,
    replyTo: getProofReplyTo(),
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: attachmentName,
        content: image,
        contentType: imageContentType(extension),
      },
    ],
  });

  return {
    method: "brevo-smtp",
    to: recipients,
    cc,
    subject: email.subject,
    attachmentName,
    accepted: Boolean(result.accepted?.length),
    providerMessageId: result.messageId,
    apiFallbackError: apiFallbackError || undefined,
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const debugEnabled = new URL(request.url).searchParams.get("debug") === "1";
  const debugEvents: Array<{ at: string; message: string; extra?: unknown }> = [];
  const log = (message: string, extra?: unknown) => {
    const elapsed = `${Date.now() - startedAt}ms`;
    debugEvents.push({ at: elapsed, message, extra });
    if (extra !== undefined) {
      console.log(`[okx/claim ${elapsed}] ${message}`, extra);
    } else {
      console.log(`[okx/claim ${elapsed}] ${message}`);
    }
  };
  const debugMeta = (extra: Record<string, unknown> = {}) => (
    debugEnabled ? { debug: { events: debugEvents, ...extra } } : {}
  );

  log("request received", {
    contentType: request.headers.get("content-type"),
    brevoApiKeyPresent: Boolean(getBrevoApiKey()),
    brevoSmtpUserPresent: Boolean(process.env.BREVO_SMTP_USER),
    brevoSmtpPassPresent: Boolean(process.env.BREVO_SMTP_PASS),
    nvidiaOcrKeyPresent: Boolean(getNvidiaApiKey()),
  });

  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const errors = getClaimErrors(body.lang);
  const missionId = typeof body.missionId === "string" ? body.missionId : "";
  const participantId =
    typeof body.participantId === "string" ? body.participantId.trim().slice(0, 80) : "";
  const proofName = typeof body.proofName === "string" ? body.proofName.slice(0, 160) : "";
  const hasProofImage = Boolean(body.hasProofImage);
  const image = parseImageDataUrl(body.proofImageDataUrl);

  log("payload parsed", {
    missionId,
    participantId,
    proofName,
    hasProofImage,
    imageBytes: image && image !== "too-large" ? image.buffer.length : image,
  });

  if (!missionId || !participantId || !hasProofImage || !image) {
    log("validation failed: missing proof fields");
    return NextResponse.json({ error: errors.required, ...debugMeta() }, { status: 400 });
  }

  if (image === "too-large") {
    log("validation failed: image too large");
    return NextResponse.json({ error: errors.tooLarge, ...debugMeta() }, { status: 400 });
  }

  const participantMissionKey = `${participantId}::${missionId}`;
  const participantStore = getParticipantMissionStore();
  const existingClaimId = participantStore.get(participantMissionKey);
  const existingClaim = existingClaimId ? getClaimStore().get(existingClaimId) : null;
  if (existingClaim) {
    log("duplicate claim returned", { claimId: existingClaim.claimId, missionId, participantId });
    const origin = new URL(request.url).origin;
    const redeemUrl = makeRedeemUrl(origin, existingClaim);
    const qrUrl = makeQrUrl(redeemUrl);
    let emailSent = false;
    let emailError = "";
    let emailDelivery: ProofEmailDelivery | null = null;

    try {
      const emailClaim = { ...existingClaim, proofName: proofName || existingClaim.proofName };
      log("duplicate proof email resend", { method: getBrevoApiKey() ? "brevo-api" : "brevo-smtp" });
      emailDelivery = await sendProofEmail({
        claim: emailClaim,
        redeemUrl,
        image: image.buffer,
        imageMimeType: image.mimeType,
        ocrText: existingClaim.uidText || "Duplicate claim email resend; OCR text is not stored for this claim.",
      });
      emailSent = true;
      existingClaim.emailedAt = new Date().toISOString();
      existingClaim.proofName = emailClaim.proofName;
      getClaimStore().set(existingClaim.claimId, existingClaim);
      log("duplicate proof email sent", emailDelivery);
    } catch (error) {
      emailError = error instanceof Error ? error.message : String(error);
      console.error("[okx/claim] duplicate proof email resend failed", error);
    }

    return NextResponse.json({
      claimId: existingClaim.claimId,
      missionId,
      participantId,
      drinkId: existingClaim.drinkId,
      redeemUrl,
      qrUrl,
      duplicate: true,
      emailSent,
      emailError: emailSent ? undefined : emailError.slice(0, 300),
      uidText: existingClaim.uidText,
      ...debugMeta({ emailDelivery }),
    });
  }

  let uidText = "";
  let ocrText = "";
  let ocrProvider = "none";
  if (missionId === "verify") {
    try {
      log("ocr validation started");
      const validation = await validateUidScreenshot(image);
      if (!validation.ok) {
        log("ocr validation rejected", { ocrProvider: validation.provider, ocrText: validation.text });
        return NextResponse.json({ error: errors.invalid, ...debugMeta({ ocr: validation }) }, { status: 422 });
      }
      uidText = validation.uidText;
      ocrText = validation.text;
      ocrProvider = validation.provider;
      log("ocr validation passed", {
        uidText,
        ocrProvider,
        ocrConfidence: validation.confidence,
        ocrLength: ocrText.length,
      });
    } catch (error) {
      log("ocr validation unreadable", error instanceof Error ? error.message : String(error));
      return NextResponse.json({ error: errors.unreadable, ...debugMeta() }, { status: 422 });
    }
  } else {
    log("ocr skipped for non-UID mission", { missionId });
  }

  const claimId = `OKX-${missionId.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const origin = new URL(request.url).origin;
  const drinkId = allocateDrinkId();

  const claim: StoredClaim = {
    claimId,
    missionId,
    participantId,
    uid: uidText,
    proofName,
    hasProofImage,
    uidText,
    ocrProvider,
    drinkId,
    emailedAt: "",
    createdAt: new Date().toISOString(),
    usedAt: null,
  };
  const redeemUrl = makeRedeemUrl(origin, claim);
  const qrUrl = makeQrUrl(redeemUrl);

  let emailSent = false;
  let emailError = "";
  let emailDelivery: ProofEmailDelivery | null = null;
  try {
    log("proof email sending", { method: getBrevoApiKey() ? "brevo-api" : "brevo-smtp" });
    emailDelivery = await sendProofEmail({ claim, redeemUrl, image: image.buffer, imageMimeType: image.mimeType, ocrText });
    emailSent = true;
    log("proof email sent", emailDelivery);
  } catch (error) {
    emailError = error instanceof Error ? error.message : String(error);
    console.error("[okx/claim] proof email failed; claim will still be created", error);
  }

  claim.emailedAt = emailSent ? new Date().toISOString() : "";
  getClaimStore().set(claimId, claim);
  participantStore.set(participantMissionKey, claimId);

  log("claim created", { claimId, missionId, participantId, uidText, emailSent, emailError });
  return NextResponse.json({
    claimId,
    missionId,
    participantId,
    drinkId,
    redeemUrl,
    qrUrl,
    emailSent,
    emailError: emailSent ? undefined : emailError.slice(0, 300),
    uidText,
    ocrProvider,
    ...debugMeta({ emailDelivery, ocr: { uidText, ocrProvider, ocrText } }),
  });
}
