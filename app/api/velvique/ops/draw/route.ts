import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { VELVIQUE_CARDS_ABI, VELVIQUE_CHAIN_ID, getCardsAddress } from "@/src/lib/velvique-chain";
import { fetchMetadata, readRegistry, registryConfigured } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Free-bottle draw. Every card minted on Base is an entry; there is no stored
   result, so the bar announces the winner shown and only redraws on purpose. */
export async function GET() {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });
  const { cards } = await readRegistry();
  return NextResponse.json({ ok: true, entrants: cards.length });
}

export async function POST(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { exclude?: unknown };
  const exclude = new Set(Array.isArray(body.exclude) ? body.exclude.filter((id): id is number => typeof id === "number") : []);

  const { cards } = await readRegistry();
  const pool = cards.filter((card) => !exclude.has(card.tokenId));
  if (pool.length === 0) return NextResponse.json({ ok: true, entrants: cards.length, winner: null });
  const winner = pool[randomInt(pool.length)];

  const rpc = process.env.VELVIQUE_RPC_URL?.trim() || process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  const client = createPublicClient({ chain: VELVIQUE_CHAIN_ID === 84532 ? baseSepolia : base, transport: http(rpc || undefined) });
  const uri = await client.readContract({ address: getCardsAddress()!, abi: VELVIQUE_CARDS_ABI, functionName: "tokenURI", args: [BigInt(winner.tokenId)] }).catch(() => "");
  const metadata = uri ? await fetchMetadata(uri) : null;

  return NextResponse.json({
    ok: true,
    entrants: cards.length,
    winner: { tokenId: winner.tokenId, guestName: metadata?.properties.guest_name ?? null, passEnding: winner.owner.slice(-4) },
  });
}
