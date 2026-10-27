import { NextResponse } from "next/server";

/* Bar and ops routes require VELVIQUE_BAR_KEY in the x-velvique-bar header.
   Without the env var they stay open only outside production. */
export function requireBarAccess(request: Request) {
  const key = process.env.VELVIQUE_BAR_KEY?.trim();
  if (!key) {
    if (process.env.NODE_ENV !== "production") return null;
    return NextResponse.json({ ok: false, error: "VELVIQUE_BAR_KEY is not configured." }, { status: 503 });
  }
  if (request.headers.get("x-velvique-bar") !== key) {
    return NextResponse.json({ ok: false, error: "Bar access only." }, { status: 403 });
  }
  return null;
}
