import { NextResponse } from "next/server";
import { publicSlots, readRsvpStore } from "@/src/lib/rsvp-store";

export const runtime = "nodejs";

export async function GET() {
  const data = await readRsvpStore();
  return NextResponse.json({ slots: publicSlots(data.slots) });
}
