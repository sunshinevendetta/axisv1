import { NextResponse } from "next/server";
import { buildCard, findGuestAssignment, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ guestId: string }> }) {
  const { guestId } = await params;
  const assignment = await withState((state) => findGuestAssignment(state, guestId) ?? null, false);
  if (!assignment) return NextResponse.json({ ok: false, error: "No assignment yet." }, { status: 404 });
  return NextResponse.json({ ok: true, assignment: buildCard(assignment) });
}
