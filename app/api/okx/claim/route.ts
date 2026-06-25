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
  emailedAt: string;
  createdAt: string;
  usedAt: string | null;
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
    invalid: "No pudimos validar ese screenshot. Debe ser la pantalla User Center > Profile de OKX, con Profile, Security, Preferences, Account information, UID e Identity verification visibles.",
    unreadable: "No pudimos leer el screenshot. Sube una imagen mas clara donde se vea tu UID.",
    tooLarge: "El screenshot pesa demasiado. Sube una captura mas ligera donde se vea tu UID.",
  },
  en: {
    required: "Upload a full-screen OKX screenshot where your UID is visible.",
    invalid: "We could not validate that screenshot. It must be the OKX User Center > Profile screen with Profile, Security, Preferences, Account information, UID, and Identity verification visible.",
    unreadable: "We could not read the screenshot. Upload a clearer image where your UID is visible.",
    tooLarge: "The screenshot is too large. Upload a lighter screenshot where your UID is visible.",
  },
};

function getClaimErrors(lang?: string) {
  return claimErrors[lang || ""] || claimErrors.en;
}

function parseImageDataUrl(dataUrl: unknown) {
  if (typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:image\/(?:png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  if (match[1].length > 7_500_000) return "too-large";
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length < 8_000) return null;
  return buffer;
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
  const candidate = uidNearLabel?.[1]?.replace(/\s+/g, "") || normalized.match(/\b\d{6,24}\b/)?.[0] || "";
  return candidate.slice(0, 32);
}

function validateUidScreenshotText(text: string) {
  const normalized = normalizeOcrText(text);
  const hasUidLabel = /\bU\s*(?:I\s*)?D\b/.test(normalized);
  const hasIdentityVerification = /\bIDENTITY\b/.test(normalized) && /\bVERIFICATION\b/.test(normalized);
  const hasAccountInformation = /\bACCOUNT\b/.test(normalized) && /\bINFORMATION\b/.test(normalized);
  const hasUserCenter = /\bUSER\s+CENTER\b/.test(normalized);
  const hasProfileTab = /\bPROFILE\b/.test(normalized);
  const hasSecurityTab = /\bSECURITY\b/.test(normalized);
  const hasPreferencesTab = /\bPREFERENCES\b/.test(normalized);

  return {
    ok:
      hasUidLabel &&
      hasIdentityVerification &&
      hasAccountInformation &&
      hasUserCenter &&
      hasProfileTab &&
      hasSecurityTab &&
      hasPreferencesTab,
    text: normalized.slice(0, 1200),
    uidText: extractUidText(text),
  };
}

async function validateUidScreenshot(image: Buffer) {
  const result = await Tesseract.recognize(image, "eng");
  return validateUidScreenshotText(result.data.text || "");
}

async function readScreenshotOcr(image: Buffer) {
  const result = await Tesseract.recognize(image, "eng");
  const text = result.data.text || "";
  return {
    text: normalizeOcrText(text).slice(0, 1200),
    uidText: extractUidText(text),
  };
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

function imageExtension(proofName: string) {
  const match = proofName.toLowerCase().match(/\.(png|jpe?g|webp)$/);
  if (!match) return "jpg";
  return match[1] === "jpeg" ? "jpg" : match[1];
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
  const recipients = ["anthony.chavez@okx.com", "Karina.caudillo@okx.com", "rubi@orbitarstudio.com"];
  const safeMission = escapeHtml(claim.missionId);
  const safeClaim = escapeHtml(claim.claimId);
  const safeParticipant = escapeHtml(claim.participantId);
  const safeUid = escapeHtml(claim.uidText || "Not extracted");
  const safeProof = escapeHtml(claim.proofName || "screenshot");
  const safeRedeem = escapeHtml(redeemUrl);
  const safeOcr = escapeHtml(ocrText || "No OCR text extracted");

  const transporter = makeTransporter();
  await transporter.sendMail({
    from: `"AXIS OKX" <${process.env.CUSTOM_FROM || "rsvp@axis.show"}>`,
    to: recipients,
    subject: `OKX mission proof: ${claim.missionId} / ${claim.claimId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;background:#050505;color:#fff;">
        <h2 style="margin:0 0 14px;">OKX mission proof received</h2>
        <p><strong>Participant:</strong> ${safeParticipant}</p>
        <p><strong>Mission:</strong> ${safeMission}</p>
        <p><strong>QR claim code:</strong> ${safeClaim}</p>
        <p><strong>Extracted UID:</strong> ${safeUid}</p>
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
      `Proof file: ${claim.proofName || "screenshot"}`,
      `Redeem URL: ${redeemUrl}`,
      "",
      "OCR text:",
      ocrText || "No OCR text extracted",
    ].join("\n"),
    attachments: [
      {
        filename: `okx-${claim.participantId}-${claim.missionId}-${claim.claimId}.${imageExtension(claim.proofName)}`,
        content: image,
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const errors = getClaimErrors(body.lang);
  const missionId = typeof body.missionId === "string" ? body.missionId : "";
  const participantId =
    typeof body.participantId === "string" ? body.participantId.trim().slice(0, 80) : "";
  const proofName = typeof body.proofName === "string" ? body.proofName.slice(0, 160) : "";
  const hasProofImage = Boolean(body.hasProofImage);
  const image = parseImageDataUrl(body.proofImageDataUrl);

  if (!missionId || !participantId || !hasProofImage || !image) {
    return NextResponse.json({ error: errors.required }, { status: 400 });
  }

  if (image === "too-large") {
    return NextResponse.json({ error: errors.tooLarge }, { status: 400 });
  }

  const participantMissionKey = `${participantId}::${missionId}`;
  const participantStore = getParticipantMissionStore();
  const existingClaimId = participantStore.get(participantMissionKey);
  const existingClaim = existingClaimId ? getClaimStore().get(existingClaimId) : null;
  if (existingClaim) {
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
  if (missionId === "verify") {
    try {
      const validation = await validateUidScreenshot(image);
      if (!validation.ok) {
        return NextResponse.json({ error: errors.invalid }, { status: 422 });
      }
      uidText = validation.uidText;
      ocrText = validation.text;
    } catch {
      return NextResponse.json({ error: errors.unreadable }, { status: 422 });
    }
  } else {
    try {
      const ocr = await readScreenshotOcr(image);
      uidText = ocr.uidText;
      ocrText = ocr.text;
    } catch {
      uidText = "";
      ocrText = "";
    }
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
    emailedAt: "",
    createdAt: new Date().toISOString(),
    usedAt: null,
  };

  try {
    await sendProofEmail({ claim, redeemUrl, image, ocrText });
  } catch (error) {
    console.error("[okx/claim] proof email failed", error);
    return NextResponse.json({ error: "Could not send proof email. Try again with staff." }, { status: 502 });
  }

  claim.emailedAt = new Date().toISOString();
  getClaimStore().set(claimId, claim);
  participantStore.set(participantMissionKey, claimId);

  return NextResponse.json({ claimId, missionId, participantId, redeemUrl, qrUrl });
}
