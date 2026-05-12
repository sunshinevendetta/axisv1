import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import { readRsvpStore, setSlotStatus } from "@/src/lib/rsvp-store";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await readRsvpStore();
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    time?: string;
    status?: "open" | "locked";
    community?: string | null;
    rsvpId?: string | null;
  };

  if (!body.time) {
    return NextResponse.json({ error: "Slot time required." }, { status: 400 });
  }

  try {
    const data = await setSlotStatus(body.time, {
      status: body.status,
      community: body.community,
      rsvpId: body.rsvpId,
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update slot" },
      { status: 400 },
    );
  }
}
