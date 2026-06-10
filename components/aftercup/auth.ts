import { isAddressEqual, recoverMessageAddress } from "viem";

export const AFTERCUP_AUTH_KEY = "axis:aftercup:auth";

export type AftercupAuthRecord = {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};

type StoredAftercupAuthRecord = AftercupAuthRecord & {
  version: 1;
};

export function buildAftercupAuthMessage(address: `0x${string}`, issuedAt = Date.now()) {
  const nonce = crypto.randomUUID();
  const expiresAt = issuedAt + 12 * 60 * 60 * 1000;

  return {
    message: [
      "AXIS AFTERCUP QUEST ACCESS",
      `Address: ${address}`,
      `Issued at: ${new Date(issuedAt).toISOString()}`,
      `Expires at: ${new Date(expiresAt).toISOString()}`,
      `Nonce: ${nonce}`,
      "Scope: /aftercup",
    ].join("\n"),
    issuedAt,
    expiresAt,
    nonce,
  };
}

export function readAftercupAuthRecord(): AftercupAuthRecord | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(AFTERCUP_AUTH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAftercupAuthRecord> | null;
    if (!parsed || parsed.version !== 1) return null;
    if (
      typeof parsed.address !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.signature !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    return {
      address: parsed.address as `0x${string}`,
      message: parsed.message,
      signature: parsed.signature as `0x${string}`,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function storeAftercupAuthRecord(record: AftercupAuthRecord) {
  if (typeof window === "undefined") return;

  const payload: StoredAftercupAuthRecord = {
    version: 1,
    ...record,
  };
  window.sessionStorage.setItem(AFTERCUP_AUTH_KEY, JSON.stringify(payload));
}

export function clearAftercupAuthRecord() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(AFTERCUP_AUTH_KEY);
}

export async function verifyAftercupAuthRecord(record: AftercupAuthRecord) {
  if (Date.now() > record.expiresAt) return false;

  // Connection-only auth: no signature was collected at sign-in. The wallet
  // connection itself is the proof of access — on-chain medal uniqueness is
  // enforced contract-side, so we don't need a SIWE signature to gate UI.
  if (record.signature === "0x") return true;

  const recovered = await recoverMessageAddress({
    message: record.message,
    signature: record.signature,
  });

  return isAddressEqual(recovered, record.address);
}

/**
 * Build a no-signature auth record. The wallet connection is treated as the
 * proof; access is bounded by `ttlMs` (default 12h).
 */
export function buildConnectionOnlyAuthRecord(
  address: `0x${string}`,
  ttlMs = 12 * 60 * 60 * 1000,
): AftercupAuthRecord {
  const now = Date.now();
  return {
    address,
    message: "",
    signature: "0x" as `0x${string}`,
    issuedAt: now,
    expiresAt: now + ttlMs,
  };
}

export function shortAftercupAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
