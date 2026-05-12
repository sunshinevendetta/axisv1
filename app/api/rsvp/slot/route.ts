import { NextRequest, NextResponse } from "next/server";
import { buildSlotCard, readRsvpStore } from "@/src/lib/rsvp-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const time = req.nextUrl.searchParams.get("time");
  if (!time) {
    return NextResponse.json({ error: "time query param required" }, { status: 400 });
  }
  const data = await readRsvpStore();
  const slot = data.slots.find((s) => s.time === time);
  if (!slot || slot.status !== "locked") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const entry = slot.rsvpId ? data.rsvps.find((r) => r.id === slot.rsvpId) : undefined;
  const card = buildSlotCard(slot, entry);
  return NextResponse.json({ card });
}
