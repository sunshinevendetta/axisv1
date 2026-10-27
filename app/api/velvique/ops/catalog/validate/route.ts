import { NextResponse } from "next/server";
import { runReleaseChecks } from "@/src/lib/velvique-validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  return NextResponse.json({ ok: true, ...runReleaseChecks() });
}
