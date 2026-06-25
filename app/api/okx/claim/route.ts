import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

type ClaimBody = {
  missionId?: string;
  participantId?: string;
  proofName?: string;
  hasProofImage?: boolean;
  proofImageDataUrl?: string;
  lang?: string;
};

type StoredClaim = {
  claimId: string;
  missionId: string;
  participantId: string;
  uid: string;
  proofName: string;
  hasProofImage: boolean;
  uidText: string;
  ocrProvider: string;
  emailedAt: string;
  createdAt: string;
  usedAt: string | null;
};

type ParsedImage = {
  buffer: Buffer;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
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

declare global {
  var okxClaims: Map<string, StoredClaim> | undefined;
  var okxParticipantMissionClaims: Map<string, string> | undefined;
}

function getClaimStore() {
  if (!globalThis.okxClaims) globalThis.okxClaims = new Map<string, StoredClaim>();
  return globalThis.okxClaims;
}

function getParticipantMissionStore() {
  if (!globalThis.okxParticipantMissionClaims) globalThis.okxParticipantMissionClaims = new Map<string, string>();
  return globalThis.okxParticipantMissionClaims;
}

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
const TESSERACT_TIMEOUT_MS = 15000;

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
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUidText(text: string) {
  const normalized = normalizeOcrText(text);
  const uidNearLabel = normalized.match(/\bU\s*(?:I\s*)?D\b\s+([0-9\s]{6,32})/);
  const candidate =
    uidNearLabel?.[1]?.replace(/\s+/g, "") ||
    normalized.match(/\b\d[\d\s]{5,31}\d\b/)?.[0]?.replace(/\s+/g, "") ||
    "";
  return candidate.slice(0, 32);
}

function hasUidEvidence(text: string, uidText: string) {
  const normalized = normalizeOcrText(text);
  const hasUidLabel = /\bU\s*(?:I\s*)?D\b/.test(normalized);
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

function parseNvidiaOcrPayload(payload: unknown): { text: string; confidence?: number } {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return { text: "" };
  }

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return { text: "" };

  const texts: string[] = [];
  const confidences: number[] = [];

  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const detections = (item as { text_detections?: unknown }).text_detections;
    if (!Array.isArray(detections)) continue;

    for (const detection of detections) {
      if (!detection || typeof detection !== "object") continue;
      const prediction = (detection as { text_prediction?: unknown }).text_prediction;
      if (!prediction || typeof prediction !== "object") continue;
      const text = (prediction as { text?: unknown }).text;
      const confidence = (prediction as { confidence?: unknown }).confidence;
      if (typeof text === "string" && text.trim()) texts.push(text.trim());
      if (typeof confidence === "number" && Number.isFinite(confidence)) confidences.push(confidence);
    }
  }

  return {
    text: texts.join("\n"),
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
  const result = await withTimeout(Tesseract.recognize(image.buffer, "eng"), TESSERACT_TIMEOUT_MS, "Tesseract OCR");
  const validation = validateUidScreenshotText(result.data.text || "", "tesseract");
  return {
    text: validation.text,
    uidText: validation.uidText,
    provider: validation.provider,
  };
}

async function readScreenshotOcr(image: ParsedImage): Promise<OcrResult> {
  if (getNvidiaApiKey()) {
    try {
      return await readScreenshotWithNvidia(image);
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

function imageExtension(proofName: string) {
  const match = proofName.toLowerCase().match(/\.(png|jpe?g|webp)$/);
  if (!match) return "jpg";
  return match[1] === "jpeg" ? "jpg" : match[1];
}

function getProofEmailRecipients() {
  const fromEnv = process.env.OKX_PROOF_TO?.split(",").map((email) => email.trim()).filter(Boolean);
  return fromEnv?.length
    ? fromEnv
    : [process.env.ADMIN_EMAIL || "hello@axis.show"];
}

function getProofEmailCopy() {
  const fromEnv = process.env.OKX_PROOF_CC?.split(",").map((email) => email.trim()).filter(Boolean);
  const cc = fromEnv?.length
    ? fromEnv
    : ["rubi@orbitarstudio.com", "anthony.chavez@okx.com", "Karina.caudillo@okx.com", "infoaxishow@gmail.com"];
  return cc;
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
  const safeUid = escapeHtml(claim.uidText || "Not extracted");
  const safeProvider = escapeHtml(claim.ocrProvider || "none");
  const safeProof = escapeHtml(claim.proofName || "screenshot");
  const safeRedeem = escapeHtml(redeemUrl);
  const safeOcr = escapeHtml(ocrText || "No OCR text extracted");

  return {
    subject: `OKX mission proof: ${claim.missionId} / ${claim.claimId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;background:#050505;color:#fff;">
        <h2 style="margin:0 0 14px;">OKX mission proof received</h2>
        <p><strong>Participant:</strong> ${safeParticipant}</p>
        <p><strong>Mission:</strong> ${safeMission}</p>
        <p><strong>QR claim code:</strong> ${safeClaim}</p>
        <p><strong>Extracted UID:</strong> ${safeUid}</p>
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
      `QR claim code: ${claim.claimId}`,
      `Extracted UID: ${claim.uidText || "Not extracted"}`,
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
  ocrText,
  recipients,
}: {
  claim: StoredClaim;
  redeemUrl: string;
  image: Buffer;
  ocrText: string;
  recipients: string[];
}) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) throw new Error("Missing BREVO_API_KEY");

  const email = makeProofEmailContent({ claim, redeemUrl, ocrText });
  const sender = getProofSender();
  const cc = getProofEmailCopy();
  const replyTo = getProofReplyTo();
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
          name: `okx-${claim.participantId}-${claim.missionId}-${claim.claimId}.${imageExtension(claim.proofName)}`,
          content: image.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo API failed with ${response.status}: ${detail.slice(0, 500)}`);
  }
}

async function sendProofEmail({
  claim,
  redeemUrl,
  image,
  ocrText,
}: {
  claim: StoredClaim;
  redeemUrl: string;
  image: Buffer;
  ocrText: string;
}) {
  const recipients = getProofEmailRecipients();

  if (getBrevoApiKey()) {
    await sendProofEmailWithBrevoApi({ claim, redeemUrl, image, ocrText, recipients });
    return;
  }

  const transporter = makeTransporter();
  const email = makeProofEmailContent({ claim, redeemUrl, ocrText });
  const sender = getProofSender();
  await transporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: recipients,
    cc: getProofEmailCopy(),
    replyTo: getProofReplyTo(),
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: `okx-${claim.participantId}-${claim.missionId}-${claim.claimId}.${imageExtension(claim.proofName)}`,
        content: image,
      },
    ],
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const log = (message: string, extra?: unknown) => {
    const elapsed = `${Date.now() - startedAt}ms`;
    if (extra !== undefined) {
      console.log(`[okx/claim ${elapsed}] ${message}`, extra);
    } else {
      console.log(`[okx/claim ${elapsed}] ${message}`);
    }
  };

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
    return NextResponse.json({ error: errors.required }, { status: 400 });
  }

  if (image === "too-large") {
    log("validation failed: image too large");
    return NextResponse.json({ error: errors.tooLarge }, { status: 400 });
  }

  const participantMissionKey = `${participantId}::${missionId}`;
  const participantStore = getParticipantMissionStore();
  const existingClaimId = participantStore.get(participantMissionKey);
  const existingClaim = existingClaimId ? getClaimStore().get(existingClaimId) : null;
  if (existingClaim) {
    log("duplicate claim returned", { claimId: existingClaim.claimId, missionId, participantId });
    const origin = new URL(request.url).origin;
    const redeemUrl = `${origin}/api/okx/redeem/${encodeURIComponent(existingClaim.claimId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(redeemUrl)}`;
    return NextResponse.json({
      claimId: existingClaim.claimId,
      missionId,
      participantId,
      redeemUrl,
      qrUrl,
      duplicate: true,
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
        return NextResponse.json({ error: errors.invalid }, { status: 422 });
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
      return NextResponse.json({ error: errors.unreadable }, { status: 422 });
    }
  } else {
    log("ocr skipped for non-UID mission", { missionId });
  }

  const claimId = `OKX-${missionId.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const origin = new URL(request.url).origin;
  const redeemUrl = `${origin}/api/okx/redeem/${encodeURIComponent(claimId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(redeemUrl)}`;

  const claim: StoredClaim = {
    claimId,
    missionId,
    participantId,
    uid: "",
    proofName,
    hasProofImage,
    uidText,
    ocrProvider,
    emailedAt: "",
    createdAt: new Date().toISOString(),
    usedAt: null,
  };

  let emailSent = false;
  let emailError = "";
  try {
    log("proof email sending", { method: getBrevoApiKey() ? "brevo-api" : "brevo-smtp" });
    await sendProofEmail({ claim, redeemUrl, image: image.buffer, ocrText });
    emailSent = true;
    log("proof email sent");
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
    redeemUrl,
    qrUrl,
    emailSent,
    emailError: emailSent ? undefined : emailError.slice(0, 300),
  });
}
