import { NextResponse } from "next/server";
import { ATTENDEES, INGREDIENTS, INGREDIENT_BUDGET_MXN, PURCHASE_RESERVE, SHOT_VOLUME_ML } from "@/src/lib/velvique-catalog";
import { readRegistry, registryConfigured, usedMl } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Stock and procurement derived from the recipes given out:
   use_ml = sum of given recipes, order_ml = 1.15 * use_ml, packages rounded up. */
export async function GET() {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });

  const { cards } = await readRegistry();
  const used = usedMl(cards);
  const rows = INGREDIENTS.map((item) => {
    const useMl = used[item.id] ?? 0;
    const orderMl = Math.round((1 + PURCHASE_RESERVE) * useMl * 100) / 100;
    return {
      id: item.id,
      name: item.name,
      stockMl: item.initialStockMl,
      usedMl: useMl,
      availableMl: item.initialStockMl - useMl,
      orderMl,
      packages: item.confirmedPackageMl ? Math.ceil(orderMl / item.confirmedPackageMl) : null,
    };
  });
  return NextResponse.json({
    ok: true,
    minted: cards.length,
    baselineMl: ATTENDEES * SHOT_VOLUME_ML,
    reserveBaselineMl: ATTENDEES * SHOT_VOLUME_ML * (1 + PURCHASE_RESERVE),
    ingredientBudgetMxn: INGREDIENT_BUDGET_MXN,
    rows,
  });
}
