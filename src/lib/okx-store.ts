export const OKX_OFFICIAL_DRINK_LIMIT = 500;
export const OKX_TOTAL_DRINK_LIMIT = 650;

export type StoredClaim = {
  claimId: string;
  missionId: string;
  participantId: string;
  uid: string;
  proofName: string;
  hasProofImage: boolean;
  uidText: string;
  ocrProvider: string;
  drinkId: number;
  emailedAt: string;
  createdAt: string;
  usedAt: string | null;
};

export type OkxRedeemResult =
  | { ok: true; claim: StoredClaim; status: "redeemed" }
  | { ok: false; claim?: StoredClaim; status: "not-found" | "already-used" };

declare global {
  var okxClaims: Map<string, StoredClaim> | undefined;
  var okxParticipantMissionClaims: Map<string, string> | undefined;
  var okxDrinkSequence: number | undefined;
}

export function getClaimStore() {
  if (!globalThis.okxClaims) globalThis.okxClaims = new Map<string, StoredClaim>();
  return globalThis.okxClaims;
}

export function getParticipantMissionStore() {
  if (!globalThis.okxParticipantMissionClaims) globalThis.okxParticipantMissionClaims = new Map<string, string>();
  return globalThis.okxParticipantMissionClaims;
}

export function allocateDrinkId() {
  const nextId = globalThis.okxDrinkSequence ?? 0;
  if (nextId >= OKX_TOTAL_DRINK_LIMIT) return null;
  globalThis.okxDrinkSequence = nextId + 1;
  return nextId;
}

export function redeemClaim(claimId: string): OkxRedeemResult {
  const store = getClaimStore();
  const claim = store.get(claimId);
  if (!claim) return { ok: false, status: "not-found" };
  if (claim.usedAt) return { ok: false, claim, status: "already-used" };

  claim.usedAt = new Date().toISOString();
  store.set(claimId, claim);
  return { ok: true, claim, status: "redeemed" };
}

export function getOkxStats() {
  const claims = Array.from(getClaimStore().values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const delivered = claims.filter((claim) => claim.usedAt).length;
  const officialDelivered = claims.filter((claim) => claim.usedAt && claim.drinkId < OKX_OFFICIAL_DRINK_LIMIT).length;
  const fallbackDelivered = claims.filter((claim) => claim.usedAt && claim.drinkId >= OKX_OFFICIAL_DRINK_LIMIT).length;
  const allocated = claims.length;

  return {
    officialLimit: OKX_OFFICIAL_DRINK_LIMIT,
    fallbackReserve: OKX_TOTAL_DRINK_LIMIT - OKX_OFFICIAL_DRINK_LIMIT,
    totalCapacity: OKX_TOTAL_DRINK_LIMIT,
    allocated,
    delivered,
    officialDelivered,
    fallbackDelivered,
    officialLeft: Math.max(0, OKX_OFFICIAL_DRINK_LIMIT - officialDelivered),
    fallbackLeft: Math.max(0, OKX_TOTAL_DRINK_LIMIT - Math.max(OKX_OFFICIAL_DRINK_LIMIT, delivered)),
    totalLeft: Math.max(0, OKX_TOTAL_DRINK_LIMIT - delivered),
    nextDrinkId: globalThis.okxDrinkSequence ?? 0,
    recentClaims: claims.slice(0, 24).map((claim) => ({
      claimId: claim.claimId,
      missionId: claim.missionId,
      participantId: claim.participantId,
      drinkId: claim.drinkId,
      official: claim.drinkId < OKX_OFFICIAL_DRINK_LIMIT,
      createdAt: claim.createdAt,
      usedAt: claim.usedAt,
      uidText: claim.uidText,
    })),
  };
}

export function resetOkxStores() {
  globalThis.okxClaims = new Map<string, StoredClaim>();
  globalThis.okxParticipantMissionClaims = new Map<string, string>();
  globalThis.okxDrinkSequence = 0;
}
