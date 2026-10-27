import { NextResponse } from "next/server";
import { saveGuestCard } from "@/src/lib/velvique-brevo";
import { sendCard } from "@/src/lib/velvique-email";
import { fetchMetadata, openQuote, publishCard, readRegistry } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/* Step 3 of a card: upload the rendered card and its metadata to Grove,
   write the recipe onto the guest's Brevo contact and email them the card. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; image?: unknown };
  const quote = typeof body.token === "string" ? openQuote(body.token) : null;
  if (!quote) return NextResponse.json({ ok: false, error: "This card request expired. Create it again." }, { status: 400 });
  if (typeof body.image !== "string") return NextResponse.json({ ok: false, error: "The card image is missing." }, { status: 400 });

  const image = Buffer.from(body.image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) return NextResponse.json({ ok: false, error: "The card image is too large." }, { status: 400 });

  const { guests, cards } = await readRegistry();
  const existing = cards.find((card) => card.email === quote.email);
  if (existing?.cardUrl) {
    const metadata = await fetchMetadata(existing.cardUrl);
    if (metadata) return NextResponse.json({ ok: true, existing: { number: existing.number, metadata } });
  }
  /* The recipe may have been given to someone else since the quote. */
  if (cards.some((card) => card.recipeCode === quote.recipeCode.toLowerCase())) {
    return NextResponse.json({ ok: false, taken: true, error: "That recipe was just taken." }, { status: 409 });
  }

  const number = cards.length + 1;
  const { imageUrl, metadataUrl } = await publishCard(quote, new Uint8Array(image), number);
  await saveGuestCard(quote.email, { recipe: quote.recipeCode, cardUrl: metadataUrl, at: new Date().toISOString() });

  const guest = guests.find((item) => item.email === quote.email);
  await sendCard(
    { email: quote.email, name: guest?.name ?? quote.guestName ?? "", lang: quote.lang },
    { name: quote.narrative.name, description: quote.narrative.description, number, imageUrl, metadataUrl, signatureHash: quote.signatureHash },
  ).catch((error) => console.error("Velvique card email failed", error instanceof Error ? error.message : error));

  return NextResponse.json({ ok: true, number, imageUrl, metadataUrl });
}
