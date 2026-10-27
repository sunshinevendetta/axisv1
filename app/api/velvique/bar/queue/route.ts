import { NextResponse } from "next/server";
import { getGarnish, getIngredient } from "@/src/lib/velvique-catalog";
import { fetchMetadata, readRegistry, registryConfigured } from "@/src/lib/velvique-registry";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { VELVIQUE_CARDS_ABI, VELVIQUE_CHAIN_ID, getCardsAddress } from "@/src/lib/velvique-chain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Build cards in mint order, straight from Base (recipe) and Grove (name, garnish). */
export async function GET() {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });

  const { cards } = await readRegistry();
  const address = getCardsAddress()!;
  const rpc = process.env.VELVIQUE_RPC_URL?.trim() || process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  const client = createPublicClient({ chain: VELVIQUE_CHAIN_ID === 84532 ? baseSepolia : base, transport: http(rpc || undefined) });

  const queue = await Promise.all(
    cards.map(async (card) => {
      const uri = await client.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "tokenURI", args: [BigInt(card.tokenId)] }).catch(() => "");
      const metadata = uri ? await fetchMetadata(uri) : null;
      const garnish = metadata?.properties.garnish_id ? getGarnish(metadata.properties.garnish_id) : null;
      return {
        tokenId: card.tokenId,
        name: metadata?.name ?? null,
        guestName: metadata?.properties.guest_name ?? null,
        signatureHash: metadata?.properties.recipe_signature ?? card.recipeCode,
        build: card.components.map((c) => ({ ...c, name: getIngredient(c.ingredientId)?.name ?? c.ingredientId })),
        garnish: garnish ? { name: garnish.name, instruction: garnish.preparationInstruction } : null,
        mintedAt: metadata?.properties.created_at ?? null,
      };
    }),
  );
  return NextResponse.json({ ok: true, queue });
}
