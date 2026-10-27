import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { buildCard, linkCollectible, withState } from "@/src/lib/velvique-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Links the guest's Base Account to their recipe collectible. Repeating the
   call with the same address is a no-op; a different address is refused. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { guestId?: unknown; walletAddress?: unknown };
  const guestId = typeof body.guestId === "string" ? body.guestId : "";
  const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress : "";
  if (!guestId || !isAddress(walletAddress)) {
    return NextResponse.json({ ok: false, error: "A guest and a valid Base address are required." }, { status: 400 });
  }

  const result = await withState((state) => linkCollectible(state, guestId, walletAddress));
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, assignment: buildCard(result.assignment) });
}
