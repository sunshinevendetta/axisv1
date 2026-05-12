import { getAddress, hashMessage, isAddress, verifyMessage } from "ethers";
import { headers } from "next/headers";

const OWNER_ADDRESS = "0xAe6b19b637FDCB9c5C05238E5279754C39DE76A9";
const TOKEN_MAX_AGE_MS = 60 * 60 * 24 * 1000; // 24 hours

export function buildOwnerAuthMessage(address: string, timestamp: number) {
  return `AXIS owner access\nAddress: ${getAddress(address)}\nTimestamp: ${timestamp}`;
}

export function verifyOwnerToken(token: string): boolean {
  try {
    const [address, signature, tsStr] = token.split(":");
    if (!address || !signature || !tsStr) return false;

    const ts = Number(tsStr);
    if (!Number.isFinite(ts) || Date.now() - ts > TOKEN_MAX_AGE_MS) return false;
    if (!isAddress(address)) return false;
    if (getAddress(address) !== getAddress(OWNER_ADDRESS)) return false;

    const message = buildOwnerAuthMessage(address, ts);
    const recovered = getAddress(verifyMessage(message, signature));
    return recovered === getAddress(OWNER_ADDRESS);
  } catch {
    return false;
  }
}

export async function hasOwnerSession(): Promise<boolean> {
  try {
    const headerStore = await headers();
    const auth = headerStore.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return false;
    return verifyOwnerToken(auth.slice(7));
  } catch {
    return false;
  }
}

// Kept for backward compat — no-ops, we don't store anything server-side
export async function clearOwnerSession() {}
export async function getOwnerSessionSubject(): Promise<string | null> {
  try {
    const headerStore = await headers();
    const auth = headerStore.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return null;
    const [address] = auth.slice(7).split(":");
    return verifyOwnerToken(auth.slice(7)) ? `wallet:${address}` : null;
  } catch {
    return null;
  }
}

export function isOwnerAuthConfigured() { return true; }
export function isOwnerWalletConfigured() { return true; }
export function isOwnerBootstrapOnly() { return false; }
