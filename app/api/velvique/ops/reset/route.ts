import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { createInitialState, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Clears test runs before the event: guests, assignments, ledger, draw and
   card numbering all start over. Requires { confirm: "RESET" }. */
export async function POST(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { confirm?: unknown };
  if (body.confirm !== "RESET") {
    return NextResponse.json({ ok: false, error: 'Send { "confirm": "RESET" } to clear all Velvique data.' }, { status: 400 });
  }
  await withState((state) => {
    Object.assign(state, createInitialState());
  });
  return NextResponse.json({ ok: true });
}
