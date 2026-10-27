import { NextResponse } from "next/server";
import { generateNarrative, isNarrativeLanguage } from "@/src/lib/velvique-ai";
import { VelviqueCapacityError, assignRecipe, buildCard, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type AssignBody = { guestId?: unknown; idempotencyKey?: unknown; lang?: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssignBody;
  const guestId = typeof body.guestId === "string" ? body.guestId : "";
  const idempotencyKey = typeof body.idempotencyKey === "string" && body.idempotencyKey.length <= 120 ? body.idempotencyKey : `guest-${guestId}`;

  let committed;
  try {
    committed = await withState((state) => {
      const guest = state.guests[guestId];
      if (!guest) return null;
      return { guest, ...assignRecipe(state, guest, idempotencyKey) };
    });
  } catch (error) {
    if (error instanceof VelviqueCapacityError) {
      console.error("Velvique capacity exhausted", error.message);
      return NextResponse.json({ ok: false, error: "No unique recipe is available right now. The bar team has been alerted.", operatorError: error.message }, { status: 409 });
    }
    throw error;
  }
  if (!committed) return NextResponse.json({ ok: false, error: "Answer the five questions first." }, { status: 404 });

  /* Narrative runs after commit, so it can never change the formulation. */
  if (!committed.assignment.narrative) {
    const narrative = await generateNarrative(committed.guest, committed.assignment, isNarrativeLanguage(body.lang) ? body.lang : "en");
    const assignmentId = committed.assignment.assignmentId;
    await withState((state) => {
      const stored = state.assignments.find((item) => item.assignmentId === assignmentId);
      if (stored && !stored.narrative) stored.narrative = narrative;
    });
    committed.assignment.narrative ??= narrative;
  }

  return NextResponse.json({ ok: true, created: committed.created, assignment: buildCard(committed.assignment) });
}
