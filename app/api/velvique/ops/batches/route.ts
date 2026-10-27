import { NextResponse } from "next/server";
import { getIngredient } from "@/src/lib/velvique-catalog";
import { requireBarAccess } from "@/src/lib/velvique-auth";
import { addBatch, stockReport, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireBarAccess(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { ingredientId?: unknown; batchId?: unknown; quantityMl?: unknown };
  const ingredient = typeof body.ingredientId === "string" ? getIngredient(body.ingredientId) : undefined;
  const quantityMl = typeof body.quantityMl === "number" ? body.quantityMl : NaN;
  const batchId = typeof body.batchId === "string" && body.batchId.trim() ? body.batchId.trim().slice(0, 60) : "";
  if (!ingredient || !batchId || !Number.isFinite(quantityMl) || quantityMl === 0) {
    return NextResponse.json({ ok: false, error: "ingredientId, batchId and a non-zero quantityMl are required." }, { status: 400 });
  }
  const stock = await withState((state) => {
    addBatch(state, ingredient.id, batchId, quantityMl);
    return stockReport(state);
  });
  return NextResponse.json({ ok: true, stock });
}
