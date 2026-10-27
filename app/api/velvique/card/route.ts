import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { cardOfWallet, fetchMetadata, registryConfigured } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* A guest's card, read straight from Base and Grove. */
export async function GET(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });
  const wallet = new URL(request.url).searchParams.get("wallet") ?? "";
  if (!isAddress(wallet)) return NextResponse.json({ ok: false, error: "A Base address is required." }, { status: 400 });
  const card = await cardOfWallet(wallet);
  if (!card) return NextResponse.json({ ok: false, error: "No card yet." }, { status: 404 });
  return NextResponse.json({ ok: true, tokenId: card.tokenId, metadata: await fetchMetadata(card.uri) });
}
