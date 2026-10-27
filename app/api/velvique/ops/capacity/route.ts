import { NextResponse } from "next/server";
import { ATTENDEES } from "@/src/lib/velvique-catalog";
import { getCandidates } from "@/src/lib/velvique-engine";
import { readRegistry, registryConfigured } from "@/src/lib/velvique-registry";
import { pairwiseCapacity } from "@/src/lib/velvique-validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const minted = registryConfigured() ? (await readRegistry()).cards.length : null;
  return NextResponse.json({ ok: true, attendees: ATTENDEES, minted, candidates: getCandidates().length, pairwisePool: pairwiseCapacity() });
}
