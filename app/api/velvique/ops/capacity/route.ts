import { NextResponse } from "next/server";
import { ATTENDEES } from "@/src/lib/velvique-catalog";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { getCandidates } from "@/src/lib/velvique-engine";
import { activeAssignments, withState } from "@/src/lib/velvique-store";
import { pairwiseCapacity } from "@/src/lib/velvique-validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const assigned = await withState((state) => activeAssignments(state).length, false);
  return NextResponse.json({ ok: true, attendees: ATTENDEES, assigned, remaining: ATTENDEES - assigned, candidates: getCandidates().length, pairwisePool: pairwiseCapacity() });
}
