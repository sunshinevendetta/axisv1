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
  var okxManualDeliveredAdjustment: number | undefined;
  var okxParticipantResets: Map<string, string> | undefined;
  var okxGlobalResetAt: string | undefined;
}

export function getClaimStore() {
  if (!globalThis.okxClaims) globalThis.okxClaims = new Map<string, StoredClaim>();
  return globalThis.okxClaims;
}

export function getParticipantMissionStore() {
  if (!globalThis.okxParticipantMissionClaims) globalThis.okxParticipantMissionClaims = new Map<string, string>();
  return globalThis.okxParticipantMissionClaims;
}

export function getParticipantResetStore() {
  if (!globalThis.okxParticipantResets) globalThis.okxParticipantResets = new Map<string, string>();
  return globalThis.okxParticipantResets;
}

export function allocateDrinkId() {
  const nextId = globalThis.okxDrinkSequence ?? 0;
  globalThis.okxDrinkSequence = nextId + 1;
  return nextId;
}

export function saveClaim(claim: StoredClaim) {
  getClaimStore().set(claim.claimId, claim);
  getParticipantMissionStore().set(`${claim.participantId}::${claim.missionId}`, claim.claimId);
}

export function redeemClaim(claimId: string): OkxRedeemResult {
  const store = getClaimStore();
  const claim = store.get(claimId);
  if (!claim) return { ok: false, status: "not-found" };
  if (claim.usedAt) return { ok: false, claim, status: "already-used" };

  claim.usedAt = new Date().toISOString();
  saveClaim(claim);
  return { ok: true, claim, status: "redeemed" };
}

export function getOkxStats() {
  const claims = Array.from(getClaimStore().values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const scannedDelivered = claims.filter((claim) => claim.usedAt).length;
  const manualDeliveredAdjustment = globalThis.okxManualDeliveredAdjustment ?? 0;
  const delivered = Math.max(0, scannedDelivered + manualDeliveredAdjustment);
  const allocated = claims.length;

  return {
    officialLimit: 0,
    fallbackReserve: 0,
    totalCapacity: 0,
    allocated,
    delivered,
    scannedDelivered,
    manualDeliveredAdjustment,
    officialDelivered: 0,
    fallbackDelivered: 0,
    officialLeft: 0,
    fallbackLeft: 0,
    totalLeft: 0,
    nextDrinkId: globalThis.okxDrinkSequence ?? 0,
    recentClaims: claims.slice(0, 24).map((claim) => ({
      claimId: claim.claimId,
      missionId: claim.missionId,
      participantId: claim.participantId,
      drinkId: claim.drinkId,
      official: true,
      createdAt: claim.createdAt,
      usedAt: claim.usedAt,
      uidText: claim.uidText,
    })),
  };
}

export function adjustManualDelivered(delta: number) {
  const stats = getOkxStats();
  const nextDelivered = Math.max(0, stats.delivered + delta);
  globalThis.okxManualDeliveredAdjustment = nextDelivered - stats.scannedDelivered;
  return getOkxStats();
}

export function setManualDelivered(totalDelivered: number) {
  const stats = getOkxStats();
  globalThis.okxManualDeliveredAdjustment = Math.max(0, totalDelivered) - stats.scannedDelivered;
  return getOkxStats();
}

export function getParticipantReset(participantId: string) {
  return getParticipantResetStore().get(participantId) || globalThis.okxGlobalResetAt || null;
}

export function resetOkxParticipant(participantId: string) {
  const claims = getClaimStore();
  const participantClaims = getParticipantMissionStore();
  for (const claim of Array.from(claims.values())) {
    if (claim.participantId !== participantId) continue;
    claims.delete(claim.claimId);
    participantClaims.delete(`${claim.participantId}::${claim.missionId}`);
  }
  getParticipantResetStore().set(participantId, new Date().toISOString());
  return getOkxStats();
}

export function resetOkxStores() {
  const participantIds = new Set(Array.from(getClaimStore().values()).map((claim) => claim.participantId));
  globalThis.okxClaims = new Map<string, StoredClaim>();
  globalThis.okxParticipantMissionClaims = new Map<string, string>();
  globalThis.okxDrinkSequence = 0;
  globalThis.okxManualDeliveredAdjustment = 0;
  const resetAt = new Date().toISOString();
  globalThis.okxGlobalResetAt = resetAt;
  const resetStore = getParticipantResetStore();
  for (const participantId of [...Array.from(resetStore.keys()), ...Array.from(participantIds)]) {
    resetStore.set(participantId, resetAt);
  }
}
