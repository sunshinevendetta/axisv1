/**
 * Pizza Day medals — frontend manifest.
 *
 * Maps in-app identifiers (mission.id, payoff label, mission.type) to the
 * on-chain tokenId + the Grove URL of the medal's .glb model.
 *
 * Keep this file in sync with scripts/pizzaday-medals.json (the on-chain
 * registration manifest). The off-chain JSON manifest is the source of truth
 * for what the contract knows about; this TS module is the source of truth
 * for what the UI shows and which tokenId each mission claims.
 *
 * Adding a medal:
 *   1. Add entry to scripts/pizzaday-medals.json with a new tokenId.
 *   2. Run scripts/registerPizzaDayMedals.ts.
 *   3. Add a matching MedalDescriptor here with the same tokenId and the
 *      Grove glb URL, and map any mission ids that should claim it.
 */

export type MedalDescriptor = {
  /** On-chain tokenId (matches scripts/pizzaday-medals.json). */
  tokenId: number;
  /** Human-readable label (matches the on-chain `name`). */
  name: string;
  /** Full URL to the .glb on Lens Grove. */
  glbUrl: string;
  /** Optional .usdz for iOS AR Quick Look. If absent, iOS falls back to inline 3D. */
  usdzUrl?: string;
  /** Optional poster image shown before the model loads. */
  posterUrl?: string;
};

const GROVE_BASE = "https://api.grove.storage/";

function grove(hash: string): string {
  return `${GROVE_BASE}${hash}`;
}

/**
 * The set of medals the UI knows about. tokenId must match the on-chain
 * registration. Replace the GROVE_HASH_* placeholders with the real hashes
 * from your Lens Grove uploads.
 */
export const PDQ_MEDALS: Record<number, MedalDescriptor> = {
  0: {
    tokenId: 0,
    name: "Entry Medal",
    glbUrl: grove("GROVE_HASH_ENTRY_GLB"),
  },
  1: {
    tokenId: 1,
    name: "Sponsor Medal",
    glbUrl: grove("GROVE_HASH_SPONSOR_GLB"),
  },
  2: {
    tokenId: 2,
    name: "Artist Medal",
    glbUrl: grove("GROVE_HASH_ARTIST_GLB"),
  },
  3: {
    tokenId: 3,
    name: "Activity Medal",
    glbUrl: grove("GROVE_HASH_ACTIVITY_GLB"),
  },
  4: {
    tokenId: 4,
    name: "DJ Set — Opening",
    glbUrl: grove("GROVE_HASH_DJ_OPENING_GLB"),
  },
  5: {
    tokenId: 5,
    name: "DJ Set — Headliner",
    glbUrl: grove("GROVE_HASH_DJ_HEADLINER_GLB"),
  },
};

/**
 * Map a mission `payoff` string (from components/pizzaday/data.ts) to a tokenId.
 * Falls back to null if the mission doesn't map to a medal.
 *
 * Edit the rules below as the medal lineup evolves — the UI side decides
 * which mission earns which medal; the contract only knows about tokenIds.
 */
export function tokenIdForMissionPayoff(payoff: string): number | null {
  const p = payoff.toLowerCase();
  if (p.includes("entry")) return 0;
  if (p.includes("sponsor")) return 1;
  if (p.includes("artist")) return 2;
  if (p.includes("activity")) return 3;
  if (p.includes("dj") && p.includes("open")) return 4;
  if (p.includes("dj")) return 5;
  return null;
}

export function getMedalByTokenId(tokenId: number): MedalDescriptor | undefined {
  return PDQ_MEDALS[tokenId];
}
