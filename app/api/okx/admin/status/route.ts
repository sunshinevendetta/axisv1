import { NextResponse } from "next/server";
import { getOkxStats } from "@/src/lib/okx-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getOkxStats());
}
