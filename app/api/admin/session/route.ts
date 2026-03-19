import { NextRequest, NextResponse } from "next/server";
import {
  clearOwnerSession,
  createOwnerWalletChallenge,
  getOwnerSessionSubject,
  hasOwnerSession,
  isOwnerBootstrapOnly,
  isOwnerAuthConfigured,
  isOwnerWalletConfigured,
  issueBootstrapWalletSession,
  issueOwnerWalletSession,
  verifyOwnerWalletSignature,
} from "@/src/lib/owner-session";

export async function GET() {
  return NextResponse.json({
    authenticated: await hasOwnerSession(),
    configured: isOwnerAuthConfigured(),
    walletConfigured: isOwnerWalletConfigured(),
    bootstrapOnly: isOwnerBootstrapOnly(),
    subject: await getOwnerSessionSubject(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const mode = String(body.mode ?? "wallet");

  if (!isOwnerAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Owner wallet auth is not configured. Set the ERC-1155 owner environment variables first.",
      },
      { status: 500 },
    );
  }

  if (mode === "challenge") {
    try {
      const message = await createOwnerWalletChallenge(String(body.address ?? ""));
      return NextResponse.json({ message });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create wallet challenge." },
        { status: 400 },
      );
    }
  }

  if (mode === "wallet") {
    try {
      const address = String(body.address ?? "");
      const signature = String(body.signature ?? "");
      const isValidSignature = await verifyOwnerWalletSignature(address, signature);

      if (!isValidSignature) {
        return NextResponse.json({ error: "Invalid wallet signature." }, { status: 401 });
      }

      if (isOwnerWalletConfigured()) {
        await issueOwnerWalletSession(address);
      } else {
        await issueBootstrapWalletSession(address);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Wallet sign-in failed." },
        { status: 401 },
      );
    }
  }

  return NextResponse.json({ error: "Unsupported owner auth mode." }, { status: 400 });
}

export async function DELETE() {
  await clearOwnerSession();
  return NextResponse.json({ success: true });
}
