import { NextResponse } from "next/server";
import { isNarrativeLanguage } from "@/src/lib/velvique-ai";
import { cleanEmail, cleanName, cleanPhone, upsertGuest } from "@/src/lib/velvique-brevo";
import { sendConfirmation } from "@/src/lib/velvique-email";
import { fetchMetadata, readRegistry, registryConfigured } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RegisterBody = { name?: unknown; email?: unknown; phone?: unknown; lang?: unknown };

/* Step 1: the guest joins the Brevo list with name, email and phone (for the
   draw) and gets a confirmation email. A guest who already has a card gets
   it back instead. */
export async function POST(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Velvique is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const name = cleanName(body.name);
  const email = cleanEmail(body.email);
  const phone = cleanPhone(body.phone);
  if (!name) return NextResponse.json({ ok: false, field: "name", error: "Your name is required." }, { status: 400 });
  if (!email) return NextResponse.json({ ok: false, field: "email", error: "A valid email is required." }, { status: 400 });
  if (!phone) return NextResponse.json({ ok: false, field: "phone", error: "A valid phone number is required." }, { status: 400 });
  const lang = isNarrativeLanguage(body.lang) ? body.lang : "en";

  const { guests, cards } = await readRegistry();
  const card = cards.find((item) => item.email === email);
  if (card?.cardUrl) {
    const metadata = await fetchMetadata(card.cardUrl);
    if (metadata) return NextResponse.json({ ok: true, existing: { number: card.number, metadata } });
  }

  const known = guests.some((guest) => guest.email === email);
  await upsertGuest({ email, name, phone, lang });
  if (!known) {
    await sendConfirmation({ email, name, lang }).catch((error) => console.error("Velvique confirmation email failed", error instanceof Error ? error.message : error));
  }
  return NextResponse.json({ ok: true, name });
}
