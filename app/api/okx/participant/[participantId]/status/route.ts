import { NextResponse } from "next/server";
import { getParticipantReset } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ participantId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { participantId } = await context.params;
  const resetAt = participantId ? getParticipantReset(participantId) : null;

  return NextResponse.json({
    participantId,
    resetAt,
  });
}
