import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { drawEntrants, runDraw, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicWinner(winner: { queueNumber: number; guestName: string | null; collectible: { walletAddress: string } | null } | null) {
  return winner && { queueNumber: winner.queueNumber, guestName: winner.guestName, passEnding: winner.collectible?.walletAddress.slice(-4) ?? null };
}

/* Free-bottle draw: every guest who saved their card to a pass is entered. */
export async function GET(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const result = await withState((state) => {
    const winner = state.draw ? state.assignments.find((item) => item.assignmentId === state.draw?.assignmentId) ?? null : null;
    return { entrants: drawEntrants(state).length, winner: publicWinner(winner), drawnAt: state.draw?.drawnAt ?? null };
  }, false);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { redraw?: unknown };
  const result = await withState((state) => runDraw(state, body.redraw === true));
  return NextResponse.json({ ok: true, entrants: result.entrants, winner: publicWinner(result.winner), drawnAt: result.drawnAt });
}
