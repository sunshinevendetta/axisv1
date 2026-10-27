import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { buildCard, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const queue = await withState((state) => state.assignments.map(buildCard), false);
  return NextResponse.json({ ok: true, queue });
}
