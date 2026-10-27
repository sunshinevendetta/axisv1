import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { sendWinnerToTeam } from "@/src/lib/velvique-email";
import { readRegistry, registryConfigured } from "@/src/lib/velvique-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Free-bottle draw at 10:30 pm. Every guest with a card is an entry. The
   screen shows the card number and first name; the winner's email and phone
   go only to the team inbox (ADMIN_EMAIL) so they can be contacted. */
export async function GET() {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Velvique is not configured yet." }, { status: 503 });
  const { cards } = await readRegistry();
  return NextResponse.json({ ok: true, entrants: cards.length });
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export async function POST(request: Request) {
  if (!registryConfigured()) return NextResponse.json({ ok: false, error: "Velvique is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { exclude?: unknown };
  const exclude = new Set(Array.isArray(body.exclude) ? body.exclude.filter((id): id is number => typeof id === "number") : []);

  const { guests, cards } = await readRegistry();
  const pool = cards.filter((card) => !exclude.has(card.number));
  if (pool.length === 0) return NextResponse.json({ ok: true, entrants: cards.length, winner: null });
  const winner = pool[randomInt(pool.length)];
  const guest = guests.find((item) => item.email === winner.email);

  let notified = true;
  await sendWinnerToTeam({ number: winner.number, name: winner.guestName, email: winner.email, phone: guest?.phone ?? "", entrants: cards.length }).catch((error) => {
    notified = false;
    console.error("Velvique winner email failed", error instanceof Error ? error.message : error);
  });

  return NextResponse.json({
    ok: true,
    entrants: cards.length,
    winner: { tokenId: winner.number, guestName: winner.guestName || null, contactHint: maskEmail(winner.email), notified },
  });
}
