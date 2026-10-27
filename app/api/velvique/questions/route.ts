import { NextResponse } from "next/server";
import { EXCLUSION_OPTIONS, VELVIQUE_CATALOG_VERSION } from "@/src/lib/velvique-catalog";
import { publicQuestions } from "@/src/lib/velvique-questions";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, catalogVersion: VELVIQUE_CATALOG_VERSION, questions: publicQuestions(), exclusions: EXCLUSION_OPTIONS });
}
