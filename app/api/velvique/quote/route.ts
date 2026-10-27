import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { EXCLUSION_OPTIONS } from "@/src/lib/velvique-catalog";
import { generateNarrative, isNarrativeLanguage } from "@/src/lib/velvique-ai";
import { encodeRecipe } from "@/src/lib/velvique-chain";
import { isAnswerSet, profileCode, sensoryTarget } from "@/src/lib/velvique-questions";
import { cardOfWallet, fetchMetadata, pickGarnish, pickRecipe, readRegistry, registryConfigured, sealQuote, type Quote } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type QuoteBody = { answers?: unknown; restrictions?: unknown; displayName?: unknown; wallet?: unknown; lang?: unknown; avoid?: unknown };

const ALLOWED_RESTRICTIONS = new Set(EXCLUSION_OPTIONS.map((item) => item.id));

/* Printed on the card: letters in any script, spaces and simple punctuation, 24 characters at most. */
function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/[^\p{L}\p{M}\p{N} .'\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return name || null;
}

/* Step 1 of a card: read what Base has already given out, choose this
   guest's unique recipe and write its narrative. Nothing is stored; the
   sealed quote travels with the guest to /publish. */
export async function POST(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Cards are not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as QuoteBody;
  if (!isAnswerSet(body.answers)) return NextResponse.json({ ok: false, error: "Five answers (A-D) are required." }, { status: 400 });
  if (typeof body.wallet !== "string" || !isAddress(body.wallet)) return NextResponse.json({ ok: false, error: "A Base address is required." }, { status: 400 });
  const wallet = body.wallet;

  const existing = await cardOfWallet(wallet);
  if (existing) {
    const metadata = await fetchMetadata(existing.uri);
    return NextResponse.json({ ok: true, existing: { tokenId: existing.tokenId, metadata } });
  }

  const answers = body.answers;
  const restrictions = Array.isArray(body.restrictions) ? body.restrictions.filter((item): item is string => typeof item === "string" && ALLOWED_RESTRICTIONS.has(item)) : [];
  const avoid = Array.isArray(body.avoid) ? body.avoid.filter((item): item is string => typeof item === "string").slice(0, 10) : [];
  const { cards, maxSupply } = await readRegistry();
  if (cards.length >= maxSupply) return NextResponse.json({ ok: false, error: "All cards have been given out." }, { status: 409 });

  const candidate = pickRecipe(sensoryTarget(answers), restrictions, cards, wallet, avoid);
  if (!candidate) {
    console.error("Velvique: no unique feasible recipe left", { minted: cards.length, restrictions });
    return NextResponse.json({ ok: false, error: "No unique recipe is available right now." }, { status: 409 });
  }

  const garnish = pickGarnish(candidate, restrictions);
  const lang = isNarrativeLanguage(body.lang) ? body.lang : "en";
  const narrative = await generateNarrative({ answerIds: answers }, { components: candidate.components, recipeSignature: candidate.signature, garnishId: garnish.id }, lang);

  const quote: Quote = {
    wallet,
    recipeCode: encodeRecipe(candidate.components),
    components: candidate.components,
    signatureHash: candidate.signatureHash,
    garnishId: garnish.id,
    narrative: { name: narrative.name, description: narrative.description, reading: narrative.reading },
    guestName: cleanName(body.displayName),
    profileCode: profileCode(answers),
    lang,
    expiresAt: Date.now() + 30 * 60 * 1000,
  };
  return NextResponse.json({ ok: true, quote, token: sealQuote(quote) });
}
