import { NextResponse } from "next/server";
import { createPublicClient, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { VELVIQUE_CARDS_ABI, VELVIQUE_CHAIN_ID, getCardsAddress } from "@/src/lib/velvique-chain";
import { openQuote, publishCard, signMintVoucher } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const VOUCHER_TTL_S = 20 * 60;

/* Step 2 of a card: upload the rendered card and its metadata to Grove, then
   sign the voucher the guest's Base Account presents to mint(). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; image?: unknown };
  const quote = typeof body.token === "string" ? openQuote(body.token) : null;
  if (!quote) return NextResponse.json({ ok: false, error: "This card request expired. Create it again." }, { status: 400 });
  if (typeof body.image !== "string") return NextResponse.json({ ok: false, error: "The card image is missing." }, { status: 400 });

  const image = Buffer.from(body.image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) return NextResponse.json({ ok: false, error: "The card image is too large." }, { status: 400 });

  /* The recipe may have been taken since the quote; the contract would reject it anyway. */
  const address = getCardsAddress()!;
  const chain = VELVIQUE_CHAIN_ID === 84532 ? baseSepolia : base;
  const rpc = process.env.VELVIQUE_RPC_URL?.trim() || process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  const taken = await createPublicClient({ chain, transport: http(rpc || undefined) }).readContract({
    address,
    abi: VELVIQUE_CARDS_ABI,
    functionName: "tokenOfRecipe",
    args: [quote.recipeCode],
  });
  if (taken > 0n) return NextResponse.json({ ok: false, taken: true, error: "That recipe was just taken." }, { status: 409 });

  const { imageUrl, metadataUrl } = await publishCard(quote, new Uint8Array(image));
  const deadline = BigInt(Math.floor(Date.now() / 1000) + VOUCHER_TTL_S);
  const signature = await signMintVoucher(quote.wallet as Address, quote.recipeCode, metadataUrl, deadline);

  return NextResponse.json({
    ok: true,
    contract: address,
    chainId: VELVIQUE_CHAIN_ID,
    recipe: quote.recipeCode,
    uri: metadataUrl,
    imageUrl,
    deadline: deadline.toString(),
    signature,
  });
}
