import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { buildCard, setAssignmentStatus, withState, type AssignmentStatus } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: AssignmentStatus[] = ["queued", "preparing", "ready", "served", "void"];

export async function PATCH(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const { assignmentId } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown };
  const status = STATUSES.find((item) => item === body.status);
  if (!status) return NextResponse.json({ ok: false, error: "Unknown status." }, { status: 400 });

  const result = await withState((state) => setAssignmentStatus(state, assignmentId, status));
  if (!result.ok) return NextResponse.json(result, { status: 409 });
  return NextResponse.json({ ok: true, assignment: buildCard(result.assignment) });
}
