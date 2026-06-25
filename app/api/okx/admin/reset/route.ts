import { NextResponse } from "next/server";
import { getOkxStats, resetOkxStores } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  resetOkxStores();
  return NextResponse.json({ ok: true, stats: getOkxStats() });
}
