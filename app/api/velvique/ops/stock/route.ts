import { NextResponse } from "next/server";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { procurementReport, stockReport, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const report = await withState((state) => ({ stock: stockReport(state), procurement: procurementReport(state), ledger: state.ledger.slice(-40).reverse() }), false);
  return NextResponse.json({ ok: true, ...report });
}
