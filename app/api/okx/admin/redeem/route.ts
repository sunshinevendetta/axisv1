import { NextResponse } from "next/server";
import { redeemClaim } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RedeemBody = {
  claimId?: string;
  url?: string;
};

function parseScan(body: RedeemBody) {
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      const parts = url.pathname.split("/").filter(Boolean);
      const redeemIndex = parts.findIndex((part) => part === "redeem");
      const claimId = redeemIndex >= 0 ? parts[redeemIndex + 1] : "";
      return {
        claimId: claimId ? decodeURIComponent(claimId) : "",
      };
    } catch {
      return { claimId: rawUrl };
    }
  }

  return {
    claimId: typeof body.claimId === "string" ? body.claimId.trim() : "",
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RedeemBody;
  const { claimId } = parseScan(body);

  if (!claimId) {
    return NextResponse.json({ ok: false, status: "missing-claim" }, { status: 400 });
  }

  const result = redeemClaim(claimId);
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
