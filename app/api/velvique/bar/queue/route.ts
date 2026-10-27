import { NextResponse } from "next/server";
import { getGarnish, getIngredient } from "@/src/lib/velvique-catalog";
import { fetchMetadata, readRegistry, registryConfigured } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Cards in the order they were made: the recipe from the guest list, the
   name and garnish from the card's Grove metadata. No contact details. */
export async function GET() {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Velvique is not configured yet." }, { status: 503 });

  const { cards } = await readRegistry();
  const queue = await Promise.all(
    cards.map(async (card) => {
      const metadata = card.cardUrl ? await fetchMetadata(card.cardUrl) : null;
      const garnish = metadata?.properties.garnish_id ? getGarnish(metadata.properties.garnish_id) : null;
      return {
        tokenId: card.number,
        name: metadata?.name ?? null,
        guestName: metadata?.properties.guest_name ?? (card.guestName || null),
        signatureHash: metadata?.properties.recipe_signature ?? card.recipeCode,
        build: card.components.map((c) => ({ ...c, name: getIngredient(c.ingredientId)?.name ?? c.ingredientId })),
        garnish: garnish ? { name: garnish.name, instruction: garnish.preparationInstruction } : null,
        mintedAt: metadata?.properties.created_at ?? null,
      };
    }),
  );
  return NextResponse.json({ ok: true, queue });
}
