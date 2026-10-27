import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { EXCLUSION_OPTIONS } from "@/src/lib/velvique-catalog";
import { isAnswerSet, profileCode, sensoryTarget } from "@/src/lib/velvique-questions";
import { findGuestAssignment, withState, type Guest } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileBody = { guestId?: unknown; tag?: unknown; answers?: unknown; restrictions?: unknown; displayName?: unknown };

const ALLOWED_RESTRICTIONS = new Set(EXCLUSION_OPTIONS.map((item) => item.id));

/* Printed on the card: letters in any script, spaces and simple punctuation, 24 characters at most. */
function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/[^\p{L}\p{M}\p{N} .'\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return name || null;
}

function cleanId(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{4,80}$/.test(value) ? value : null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ProfileBody;
  if (!isAnswerSet(body.answers)) {
    return NextResponse.json({ ok: false, error: "Five answers (A-D) are required." }, { status: 400 });
  }
  const answers = body.answers;
  const restrictions = Array.isArray(body.restrictions)
    ? [...new Set(body.restrictions.filter((item): item is string => typeof item === "string" && ALLOWED_RESTRICTIONS.has(item)))]
    : [];
  /* NFC/QR tags give a stable guest ID; otherwise the client's stored ID or a new one. */
  const tag = cleanId(body.tag);
  const guestId = tag ? `tag-${tag}` : cleanId(body.guestId) ?? randomUUID();

  const result = await withState((state) => {
    if (findGuestAssignment(state, guestId)) return { guest: state.guests[guestId], locked: true };
    const guest: Guest = {
      guestId,
      answerIds: answers,
      restrictions,
      displayName: cleanName(body.displayName),
      profileCode: profileCode(answers),
      sensoryTarget: sensoryTarget(answers),
      createdAt: state.guests[guestId]?.createdAt ?? new Date().toISOString(),
    };
    state.guests[guestId] = guest;
    return { guest, locked: false };
  });

  return NextResponse.json({ ok: true, locked: result.locked, guest: result.guest });
}
