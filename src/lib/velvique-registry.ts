import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { GARNISHES, INGREDIENTS, VELVIQUE_CATALOG_VERSION, getGarnish, getIngredient } from "./velvique-catalog";
import { conflictsWith, denseOf, excludesCandidate, rankCandidates, rankGarnishes, type Candidate } from "./velvique-engine";
import { uploadToGrove } from "./grove";
import { brevoConfigured, listGuests, type VelviqueGuest } from "./velvique-brevo";
import { decodeRecipe, encodeRecipe, type CodeComponent, type RecipeCode } from "./velvique-recipe-code";
import type { SensoryVector } from "./velvique-catalog";

/* The registry of cards given out. The Brevo guest list is the record of
   which guest got which recipe; Grove holds each card's image and metadata. */

export function registryConfigured() {
  return brevoConfigured();
}

export type IssuedCard = {
  number: number;
  email: string;
  guestName: string;
  recipeCode: RecipeCode;
  components: CodeComponent[];
  cardUrl: string | null;
};

/* Cards in the order they were made; a card's number is its place in line. */
export function cardsOf(guests: VelviqueGuest[]): IssuedCard[] {
  return guests
    .filter((guest): guest is VelviqueGuest & { recipe: RecipeCode } => Boolean(guest.recipe))
    .sort((a, b) => (a.cardAt ?? "").localeCompare(b.cardAt ?? ""))
    .map((guest, i) => ({
      number: i + 1,
      email: guest.email,
      guestName: guest.name,
      recipeCode: guest.recipe,
      components: decodeRecipe(guest.recipe),
      cardUrl: guest.cardUrl,
    }));
}

export async function readRegistry() {
  const guests = await listGuests();
  return { guests, cards: cardsOf(guests) };
}

/* Ingredient use so far, from the recipes already given out. */
export function usedMl(cards: IssuedCard[]) {
  const used: Record<string, number> = Object.fromEntries(INGREDIENTS.map((item) => [item.id, 0]));
  for (const card of cards) for (const c of card.components) used[c.ingredientId] = (used[c.ingredientId] ?? 0) + c.ml;
  return used;
}

/* Pick an unused recipe for the guest. First choice clears the 10% distance
   rule against every card given out and fits the planned stock; once those
   run out (past roughly a hundred guests) any unused recipe will do, so
   there is no cap on guests. Among the best few, the guest's email decides
   which, so two guests with identical answers at the same moment rarely
   collide; if they do, /publish refuses the second and it re-quotes. */
export function pickRecipe(target: SensoryVector, restrictions: string[], cards: IssuedCard[], identity: string, avoid: string[] = []): Candidate | null {
  const used = usedMl(cards);
  const usedDense = cards.map((card) => denseOf(card.components as Parameters<typeof denseOf>[0]));
  const taken = new Set(cards.map((card) => card.recipeCode.toLowerCase()));
  const skip = new Set(avoid.map((code) => code.toLowerCase()));
  const open: Candidate[] = [];
  for (const { candidate } of rankCandidates(target)) {
    const code = encodeRecipe(candidate.components).toLowerCase();
    if (taken.has(code) || skip.has(code)) continue;
    if (excludesCandidate(candidate, restrictions)) continue;
    open.push(candidate);
  }
  const strict = open.filter(
    (candidate) =>
      !candidate.components.some((c) => (used[c.ingredientId] ?? 0) + c.ml > getIngredient(c.ingredientId)!.initialStockMl) && !conflictsWith(candidate, usedDense),
  );
  const shortlist = (strict.length > 0 ? strict : open).slice(0, 3);
  if (shortlist.length === 0) return null;
  const pick = parseInt(createHash("sha256").update(identity.toLowerCase()).digest("hex").slice(0, 8), 16) % shortlist.length;
  return shortlist[pick];
}

export function pickGarnish(candidate: Candidate, restrictions: string[]) {
  return rankGarnishes(candidate.profile, restrictions)[0] ?? GARNISHES[0];
}

/* Quotes travel through the browser between "pick" and "publish"; an HMAC
   keyed off the server's Brevo key stops a guest from editing their recipe. */
export type Quote = {
  email: string;
  recipeCode: RecipeCode;
  components: CodeComponent[];
  signatureHash: string;
  garnishId: string | null;
  narrative: { name: string; description: string; reading: string };
  guestName: string | null;
  profileCode: string;
  lang: string;
  expiresAt: number;
};

function hmac(payload: string) {
  const secret = createHash("sha256").update(`velvique-quote:${process.env.BREVO_API_KEY?.trim() ?? ""}`).digest();
  return createHmac("sha256", secret).update(payload).digest("base64url");
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

async function groveUpload(bytes: Uint8Array, fileName: string, contentType: string) {
  const result = await uploadToGrove({ bytes, fileName, contentType });
  const url = result.gateway_url ?? (result.storage_key ? `https://api.grove.storage/${result.storage_key}` : null);
  if (!url) throw new Error("Grove did not return a URL");
  return url;
}

/* Card image plus OpenSea-style metadata carrying the full recipe identity
   (guide addendum: recipe id and signature, names, sensory summary,
   ingredients, garnish, event id). No email or phone ever goes to Grove. */
export async function publishCard(quote: Quote, image: Uint8Array, number: number) {
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
      { trait_type: "Card", value: number },
      ...(quote.guestName ? [{ trait_type: "Made for", value: quote.guestName }] : []),
    ],
    properties: {
      event_id: "velvique-axis-2026",
      card_number: number,
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
    card_number?: number;
    recipe_code: RecipeCode;
    recipe_signature: string;
    recipe: CodeComponent[];
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
