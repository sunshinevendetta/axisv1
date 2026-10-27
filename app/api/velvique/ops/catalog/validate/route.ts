import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { runReleaseChecks } from "@/src/lib/velvique-validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, ...runReleaseChecks() });
}
