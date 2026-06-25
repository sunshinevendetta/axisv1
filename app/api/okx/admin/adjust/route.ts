import { NextResponse } from "next/server";
import { adjustManualDelivered, setManualDelivered } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdjustBody = {
  delta?: number;
  delivered?: number;
};

export async function POST(request: Request) {
  if (request.headers.get("x-okx-supervisor") !== "sv") {
    return NextResponse.json({ ok: false, error: "Supervisor only." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as AdjustBody;

  if (typeof body.delivered === "number" && Number.isFinite(body.delivered)) {
    return NextResponse.json({ ok: true, stats: setManualDelivered(Math.round(body.delivered)) });
  }

  if (typeof body.delta === "number" && Number.isFinite(body.delta)) {
    return NextResponse.json({ ok: true, stats: adjustManualDelivered(Math.round(body.delta)) });
  }

  return NextResponse.json({ ok: false, error: "Missing adjustment." }, { status: 400 });
}
