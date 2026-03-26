import { NextRequest, NextResponse } from "next/server";
import { hasOwnerSession } from "@/src/lib/owner-session";
import {
  getOwnerAccessServerStatus,
  runOwnerAccessServerAction,
  type OwnerAccessServerAction,
} from "@/src/lib/owner-access-admin";

export async function GET() {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getOwnerAccessServerStatus());
}

export async function POST(request: NextRequest) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as OwnerAccessServerAction;
    const result = await runOwnerAccessServerAction(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server signer action failed." },
      { status: 400 },
    );
  }
}
