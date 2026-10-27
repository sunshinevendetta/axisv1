import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { createPublicClient, http, keccak256, toBytes, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { GARNISHES, INGREDIENTS, VELVIQUE_CATALOG_VERSION, getGarnish, getIngredient } from "./velvique-catalog";
import { conflictsWith, denseOf, excludesCandidate, rankCandidates, rankGarnishes, type Candidate } from "./velvique-engine";
import { uploadToGrove } from "./grove";
import { VELVIQUE_CARDS_ABI, VELVIQUE_CHAIN_ID, decodeRecipe, encodeRecipe, getCardsAddress, type ChainComponent } from "./velvique-chain";
import type { SensoryVector } from "./velvique-catalog";

/* Server side of the on-chain registry. Base is the only record of which
   recipes exist; Grove holds each card's image and metadata. Nothing is
   stored by the server itself. */

const chain = VELVIQUE_CHAIN_ID === 84532 ? baseSepolia : base;

export function registryConfigured() {
  return Boolean(getCardsAddress() && process.env.VELVIQUE_VOUCHER_PRIVATE_KEY?.trim());
}

function client() {
  const rpc = process.env.VELVIQUE_RPC_URL?.trim() || process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  return createPublicClient({ chain, transport: http(rpc || undefined) });
}

function voucherKey(): Hex {
  const key = process.env.VELVIQUE_VOUCHER_PRIVATE_KEY?.trim();
  if (!key) throw new Error("VELVIQUE_VOUCHER_PRIVATE_KEY is not set");
  return (key.startsWith("0x") ? key : `0x${key}`) as Hex;
}

export type MintedCard = { tokenId: number; owner: Address; recipeCode: Hex; components: ChainComponent[] };

export async function readRegistry() {
  const address = getCardsAddress();
  if (!address) throw new Error("NEXT_PUBLIC_VELVIQUE_CARDS_ADDRESS is not set");
  const c = client();
  const [recipes, owners, maxSupply] = await Promise.all([
    c.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "allRecipes" }),
    c.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "allOwners" }),
    c.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "maxSupply" }),
  ]);
  const cards: MintedCard[] = recipes.map((code, i) => ({ tokenId: i + 1, owner: owners[i], recipeCode: code, components: decodeRecipe(code) }));
  return { cards, maxSupply: Number(maxSupply) };
}

export async function cardOfWallet(wallet: Address) {
  const address = getCardsAddress();
  if (!address) return null;
  const c = client();
  const tokenId = Number(await c.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "cardOf", args: [wallet] }));
  if (!tokenId) return null;
  const uri = await c.readContract({ address, abi: VELVIQUE_CARDS_ABI, functionName: "tokenURI", args: [BigInt(tokenId)] });
  return { tokenId, uri };
}

/* Ingredient use so far, from the recipes already minted. */
export function usedMl(cards: MintedCard[]) {
  const used: Record<string, number> = Object.fromEntries(INGREDIENTS.map((item) => [item.id, 0]));
  for (const card of cards) for (const c of card.components) used[c.ingredientId] = (used[c.ingredientId] ?? 0) + c.ml;
  return used;
}

/* Pick an unused recipe that clears the 10% distance rule against every
   minted card and fits stock. Among the best few, the wallet decides which,
   so two guests with identical answers at the same moment rarely collide;
   if they do, the contract rejects the second mint and the guest re-quotes. */
export function pickRecipe(target: SensoryVector, restrictions: string[], cards: MintedCard[], wallet: string, avoid: string[] = []): Candidate | null {
  const used = usedMl(cards);
  const usedDense = cards.map((card) => denseOf(card.components as Parameters<typeof denseOf>[0]));
  const taken = new Set(cards.map((card) => card.recipeCode.toLowerCase()));
  const skip = new Set(avoid.map((code) => code.toLowerCase()));
  const shortlist: Candidate[] = [];
  for (const { candidate } of rankCandidates(target)) {
    const code = encodeRecipe(candidate.components).toLowerCase();
    if (taken.has(code) || skip.has(code)) continue;
    if (excludesCandidate(candidate, restrictions)) continue;
    if (candidate.components.some((c) => (used[c.ingredientId] ?? 0) + c.ml > getIngredient(c.ingredientId)!.initialStockMl)) continue;
    if (conflictsWith(candidate, usedDense)) continue;
    shortlist.push(candidate);
    if (shortlist.length === 3) break;
  }
  if (shortlist.length === 0) return null;
  const pick = parseInt(createHash("sha256").update(wallet.toLowerCase()).digest("hex").slice(0, 8), 16) % shortlist.length;
  return shortlist[pick];
}

export function pickGarnish(candidate: Candidate, restrictions: string[]) {
  return rankGarnishes(candidate.profile, restrictions)[0] ?? GARNISHES[0];
}

/* Quotes travel through the browser between "pick" and "publish"; an HMAC
   keyed by the voucher key stops a guest from editing their recipe. */
export type Quote = {
  wallet: string;
  recipeCode: Hex;
  components: ChainComponent[];
  signatureHash: string;
  garnishId: string | null;
  narrative: { name: string; description: string; reading: string };
  guestName: string | null;
  profileCode: string;
  lang: string;
  expiresAt: number;
};

function hmac(payload: string) {
  return createHmac("sha256", voucherKey()).update(payload).digest("base64url");
}

export function sealQuote(quote: Quote) {
  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function openQuote(token: string): Quote | null {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(hmac(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const quote = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Quote;
  return quote.expiresAt > Date.now() ? quote : null;
}

export async function signMintVoucher(minter: Address, recipe: Hex, uri: string, deadline: bigint) {
  const address = getCardsAddress();
  if (!address) throw new Error("NEXT_PUBLIC_VELVIQUE_CARDS_ADDRESS is not set");
  const account = privateKeyToAccount(voucherKey());
  return account.signTypedData({
    domain: { name: "AxisVelviqueCards", version: "1", chainId: VELVIQUE_CHAIN_ID, verifyingContract: address },
    types: { Mint: [{ name: "minter", type: "address" }, { name: "recipe", type: "bytes8" }, { name: "uriHash", type: "bytes32" }, { name: "deadline", type: "uint256" }] },
    primaryType: "Mint",
    message: { minter, recipe, uriHash: keccak256(toBytes(uri)), deadline },
  });
}

async function groveUpload(bytes: Uint8Array, fileName: string, contentType: string) {
  const result = await uploadToGrove({ bytes, fileName, contentType });
  const url = result.gateway_url ?? (result.storage_key ? `https://api.grove.storage/${result.storage_key}` : null);
  if (!url) throw new Error("Grove did not return a URL");
  return url;
}

/* Card image plus OpenSea-style metadata carrying the full recipe identity
   (guide addendum: recipe id and signature, names, sensory summary,
   ingredients, garnish, event id). */
export async function publishCard(quote: Quote, image: Uint8Array) {
  const imageUrl = await groveUpload(image, `velvique-${quote.signatureHash}.jpg`, "image/jpeg");
  const garnish = quote.garnishId ? getGarnish(quote.garnishId) : null;
  const metadata = {
    name: quote.narrative.name,
    description: quote.narrative.description,
    image: imageUrl,
    external_url: "https://axis.show/velvique",
    attributes: [
      ...quote.components.map((c) => ({ trait_type: getIngredient(c.ingredientId)?.name ?? c.ingredientId, value: c.ml, display_type: "number" })),
      ...(garnish ? [{ trait_type: "Garnish", value: garnish.name }] : []),
      { trait_type: "Profile", value: quote.profileCode },
      ...(quote.guestName ? [{ trait_type: "Made for", value: quote.guestName }] : []),
    ],
    properties: {
      event_id: "velvique-axis-2026",
      recipe_code: quote.recipeCode,
      recipe_signature: quote.signatureHash,
      recipe: quote.components,
      garnish_id: quote.garnishId,
      sensory_reading: quote.narrative.reading,
      guest_name: quote.guestName,
      language: quote.lang,
      catalog_version: VELVIQUE_CATALOG_VERSION,
      created_at: new Date().toISOString(),
    },
  };
  const metadataUrl = await groveUpload(new TextEncoder().encode(JSON.stringify(metadata)), `velvique-${quote.signatureHash}.json`, "application/json");
  return { imageUrl, metadataUrl };
}

export type CardMetadata = {
  name: string;
  description: string;
  image: string;
  properties: {
    recipe_code: Hex;
    recipe_signature: string;
    recipe: ChainComponent[];
    garnish_id: string | null;
    sensory_reading: string;
    guest_name: string | null;
    created_at: string;
  };
};

export async function fetchMetadata(uri: string): Promise<CardMetadata | null> {
  try {
    const res = await fetch(uri, { next: { revalidate: 3600 } });
    return res.ok ? ((await res.json()) as CardMetadata) : null;
  } catch {
    return null;
  }
}
