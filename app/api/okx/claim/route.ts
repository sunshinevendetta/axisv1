import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

type ClaimBody = {
  missionId?: string;
  proofName?: string;
  hasProofImage?: boolean;
  proofImageDataUrl?: string;
  lang?: string;
};

type StoredClaim = {
  claimId: string;
  missionId: string;
  uid: string;
  proofName: string;
  hasProofImage: boolean;
  createdAt: string;
  usedAt: string | null;
};

declare global {
  var okxClaims: Map<string, StoredClaim> | undefined;
}

function getClaimStore() {
  if (!globalThis.okxClaims) globalThis.okxClaims = new Map<string, StoredClaim>();
  return globalThis.okxClaims;
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
  };
}

async function validateUidScreenshot(image: Buffer) {
  const result = await Tesseract.recognize(image, "eng");
  return validateUidScreenshotText(result.data.text || "");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const errors = getClaimErrors(body.lang);
  const missionId = typeof body.missionId === "string" ? body.missionId : "";
  const proofName = typeof body.proofName === "string" ? body.proofName.slice(0, 160) : "";
  const hasProofImage = Boolean(body.hasProofImage);
  const image = parseImageDataUrl(body.proofImageDataUrl);

  if (!missionId || !hasProofImage || !image) {
    return NextResponse.json({ error: errors.required }, { status: 400 });
  }

  if (image === "too-large") {
    return NextResponse.json({ error: errors.tooLarge }, { status: 400 });
  }

  if (missionId === "verify") {
    try {
      const validation = await validateUidScreenshot(image);
      if (!validation.ok) {
        return NextResponse.json({ error: errors.invalid }, { status: 422 });
      }
    } catch {
      return NextResponse.json({ error: errors.unreadable }, { status: 422 });
    }
  }

  const claimId = `OKX-${missionId.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const origin = new URL(request.url).origin;
  const redeemUrl = `${origin}/api/okx/redeem/${encodeURIComponent(claimId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(redeemUrl)}`;

  getClaimStore().set(claimId, {
    claimId,
    missionId,
    uid: "",
    proofName,
    hasProofImage,
    createdAt: new Date().toISOString(),
    usedAt: null,
  });

  return NextResponse.json({ claimId, missionId, redeemUrl, qrUrl });
}
