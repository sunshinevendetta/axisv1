import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress, verifyMessage } from "ethers";
import { buildOwnerAuthMessage, verifyOwnerToken } from "@/src/lib/owner-session";

const OWNER_ADDRESS = "0xAe6b19b637FDCB9c5C05238E5279754C39DE76A9";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) {
    const authenticated = verifyOwnerToken(auth.slice(7));
    return NextResponse.json({ authenticated, configured: true, walletConfigured: true, bootstrapOnly: false });
  }
  return NextResponse.json({ authenticated: false, configured: true, walletConfigured: true, bootstrapOnly: false });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const address = typeof body.address === "string" ? body.address.trim() : "";
  const signature = typeof body.signature === "string" ? body.signature.trim() : "";
  const timestamp = typeof body.timestamp === "number" ? body.timestamp : Date.now();

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  if (getAddress(address) !== getAddress(OWNER_ADDRESS)) {
    return NextResponse.json({ error: "This wallet does not have owner access." }, { status: 401 });
  }

  if (!signature) {
    const message = buildOwnerAuthMessage(address, timestamp);
    return NextResponse.json({ message, timestamp });
  }

  try {
    const message = buildOwnerAuthMessage(address, timestamp);
    const recovered = getAddress(verifyMessage(message, signature));
    if (recovered !== getAddress(OWNER_ADDRESS)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
    const token = `${getAddress(address)}:${signature}:${timestamp}`;
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
