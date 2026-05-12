import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { findAttendee, updateAttendeeMainTicket } from "@/src/lib/rsvp-store";
import { submitRsvPizzaGuest } from "@/src/lib/rsv-pizza";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    slot?: string;
    email?: string;
  };
  const slot = body.slot?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!slot || !email) {
    return NextResponse.json({ error: "slot and email required" }, { status: 400 });
  }
  const attendee = await findAttendee(slot, email);
  if (!attendee) {
    return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
  }
  const outcome = await submitRsvPizzaGuest({
    name: attendee.name,
    email: attendee.email,
  });
  await updateAttendeeMainTicket(slot, email, {
    status: outcome.ok ? "sent" : "failed",
    reason: outcome.ok ? undefined : outcome.reason,
  });
  return NextResponse.json({
    mainTicket: outcome.ok ? "sent" : "failed",
    reason: outcome.ok ? undefined : outcome.reason,
  });
}
