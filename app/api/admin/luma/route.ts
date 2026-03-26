import { NextRequest, NextResponse } from "next/server";
import { resolveLumaEvent } from "@/src/lib/luma";
import { hasOwnerSession } from "@/src/lib/owner-session";

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const reference = String(body.reference ?? "");

  try {
    const event = await resolveLumaEvent(reference);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resolve Luma event." },
      { status: 500 },
    );
  }
}
