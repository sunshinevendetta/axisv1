import { NextResponse } from "next/server";
import { EXCLUSION_OPTIONS } from "@/src/lib/velvique-catalog";
import { generateNarrative, isNarrativeLanguage } from "@/src/lib/velvique-ai";
import { cleanEmail } from "@/src/lib/velvique-brevo";
import { encodeRecipe } from "@/src/lib/velvique-recipe-code";
import { isAnswerSet, profileCode, sensoryTarget } from "@/src/lib/velvique-questions";
import { fetchMetadata, pickGarnish, pickRecipe, readRegistry, registryConfigured, sealQuote, type Quote } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type QuoteBody = { answers?: unknown; restrictions?: unknown; email?: unknown; lang?: unknown; avoid?: unknown };

const ALLOWED_RESTRICTIONS = new Set(EXCLUSION_OPTIONS.map((item) => item.id));

/* Step 2 of a card: read which recipes the guest list has already given
   out, choose this guest's unique recipe and write its narrative. Nothing is
   stored yet; the sealed quote travels with the guest to /publish. */
export async function POST(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Velvique is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as QuoteBody;
  if (!isAnswerSet(body.answers)) return NextResponse.json({ ok: false, error: "Five answers (A-D) are required." }, { status: 400 });
  const email = cleanEmail(body.email);
  if (!email) return NextResponse.json({ ok: false, error: "Sign up first." }, { status: 400 });

  const { guests, cards } = await readRegistry();
  const guest = guests.find((item) => item.email === email);
  if (!guest) return NextResponse.json({ ok: false, error: "Sign up first." }, { status: 403 });

  const existing = cards.find((card) => card.email === email);
  if (existing?.cardUrl) {
    const metadata = await fetchMetadata(existing.cardUrl);
    if (metadata) return NextResponse.json({ ok: true, existing: { number: existing.number, metadata } });
  }

  const answers = body.answers;
  const restrictions = Array.isArray(body.restrictions) ? body.restrictions.filter((item): item is string => typeof item === "string" && ALLOWED_RESTRICTIONS.has(item)) : [];
  const avoid = Array.isArray(body.avoid) ? body.avoid.filter((item): item is string => typeof item === "string").slice(0, 10) : [];
  const candidate = pickRecipe(sensoryTarget(answers), restrictions, cards, email, avoid);
  if (!candidate) {
    console.error("Velvique: no unique feasible recipe left", { given: cards.length, restrictions });
    return NextResponse.json({ ok: false, error: "No unique recipe is available right now." }, { status: 409 });
  }

  const garnish = pickGarnish(candidate, restrictions);
  const lang = isNarrativeLanguage(body.lang) ? body.lang : "en";
  const narrative = await generateNarrative({ answerIds: answers }, { components: candidate.components, recipeSignature: candidate.signature, garnishId: garnish.id }, lang);

  const quote: Quote = {
    email,
    recipeCode: encodeRecipe(candidate.components),
    components: candidate.components,
    signatureHash: candidate.signatureHash,
    garnishId: garnish.id,
    narrative: { name: narrative.name, description: narrative.description, reading: narrative.reading },
    guestName: guest.name || null,
    profileCode: profileCode(answers),
    lang,
    expiresAt: Date.now() + 30 * 60 * 1000,
  };
  return NextResponse.json({ ok: true, quote, number: cards.length + 1, token: sealQuote(quote) });
}
