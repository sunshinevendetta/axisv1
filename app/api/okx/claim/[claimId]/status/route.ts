import { NextResponse } from "next/server";
import { getClaimStore } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ claimId: string }> },
) {
  const { claimId } = await context.params;
  const claim = getClaimStore().get(claimId);

  if (!claim) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  return NextResponse.json({
    claimId: claim.claimId,
    missionId: claim.missionId,
    participantId: claim.participantId,
    drinkId: claim.drinkId,
    usedAt: claim.usedAt,
  });
}
