import { NextResponse } from "next/server";
import { getOkxStats, resetOkxParticipant, resetOkxStores } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResetBody = {
  participantId?: string;
};

export async function POST(request: Request) {
  if (request.headers.get("x-okx-supervisor") !== "sv") {
    return NextResponse.json({ ok: false, error: "Supervisor only." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as ResetBody;
  const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
  if (participantId) {
    return NextResponse.json({ ok: true, stats: resetOkxParticipant(participantId) });
  }

  resetOkxStores();
  return NextResponse.json({ ok: true, stats: getOkxStats() });
}
