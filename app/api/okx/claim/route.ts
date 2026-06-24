import { NextResponse } from "next/server";

type ClaimBody = {
  missionId?: string;
  uid?: string;
  proofName?: string;
  hasProofImage?: boolean;
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const missionId = typeof body.missionId === "string" ? body.missionId : "";
  const uid = typeof body.uid === "string" ? body.uid.trim().slice(0, 80) : "";
  const proofName = typeof body.proofName === "string" ? body.proofName.slice(0, 160) : "";
  const hasProofImage = Boolean(body.hasProofImage);

  if (!missionId || (!uid && !hasProofImage)) {
    return NextResponse.json({ error: "UID or proof image is required." }, { status: 400 });
  }

  const claimId = `OKX-${missionId.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const origin = new URL(request.url).origin;
  const redeemUrl = `${origin}/api/okx/redeem/${encodeURIComponent(claimId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(redeemUrl)}`;

  getClaimStore().set(claimId, {
    claimId,
    missionId,
    uid,
    proofName,
    hasProofImage,
    createdAt: new Date().toISOString(),
    usedAt: null,
  });

  return NextResponse.json({ claimId, missionId, redeemUrl, qrUrl });
}
