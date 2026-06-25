import { NextResponse } from "next/server";
import { redeemClaim, saveClaim, type StoredClaim } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RedeemBody = {
  url?: string;
};

function parseScan(body: RedeemBody) {
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) return { claimId: "", scanned: false };

  try {
    const url = new URL(rawUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const redeemIndex = parts.findIndex((part) => part === "redeem");
    const claimId = redeemIndex >= 0 ? parts[redeemIndex + 1] : "";
    return {
      claimId: claimId ? decodeURIComponent(claimId) : "",
      scanned: Boolean(claimId && parts[0] === "api" && parts[1] === "okx" && parts[2] === "redeem"),
      participantId: url.searchParams.get("p") || "",
      missionId: url.searchParams.get("m") || "",
      drinkId: Number(url.searchParams.get("d")),
      uidText: url.searchParams.get("u") || "",
    };
  } catch {
    return { claimId: "", scanned: false };
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RedeemBody;
  const { claimId, scanned, participantId, missionId, drinkId, uidText } = parseScan(body);

  if (!claimId || !scanned) {
    return NextResponse.json({ ok: false, status: "scan-required" }, { status: 400 });
  }

  let result = redeemClaim(claimId);
  if (result.status === "not-found" && participantId && missionId && Number.isFinite(drinkId)) {
    const fallbackClaim: StoredClaim = {
      claimId,
      missionId,
      participantId,
      uid: uidText || "",
      proofName: "qr-scan",
      hasProofImage: true,
      uidText: uidText || "",
      ocrProvider: "qr-metadata",
      drinkId,
      emailedAt: "",
      createdAt: new Date().toISOString(),
      usedAt: null,
    };
    saveClaim(fallbackClaim);
    result = redeemClaim(claimId);
  }
  const statusCode =
    result.ok ? 200 :
    result.status === "not-found" ? 404 :
    409;

  return NextResponse.json({
    ok: result.ok,
    status: result.status,
    claim: result.claim ? {
      claimId: result.claim.claimId,
      missionId: result.claim.missionId,
      participantId: result.claim.participantId,
      drinkId: result.claim.drinkId,
      usedAt: result.claim.usedAt,
      uidText: result.claim.uidText,
    } : undefined,
  }, { status: statusCode });
}
