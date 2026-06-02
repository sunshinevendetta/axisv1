/**
 * Admin-side on-chain helpers for AxisPizzaDayEpisode1155.
 *
 * Browser/admin only. Pulls the full ABI + creation bytecode from the compiled
 * Hardhat artifact so the admin page can deploy a fresh contract and then drive
 * registerArtwork / setOpenMint / airdrop / etc. directly from a connected
 * wallet (wallet-only gate — the connected wallet pays gas and holds the roles).
 *
 * Read-only mint helpers for collectors live in pizzaday-onchain.ts; this file
 * is the privileged superset.
 */

import type { Address, Hex } from "viem";
import { PDQ_MEDALS_ABI, PDQ_MEDALS_BYTECODE } from "./pizzaday-artifact";

/**
 * Full ABI + creation bytecode of the contract. Sourced from the vendored
 * pizzaday-artifact.ts (committed) rather than the .gitignored /artifacts
 * folder, so the admin page builds on Vercel/CI. Regenerate per the header
 * of that file after any contract change.
 */
export const PDQ_ADMIN_ABI = PDQ_MEDALS_ABI;

/** Creation bytecode for deploying a new instance. */
export const PDQ_BYTECODE = PDQ_MEDALS_BYTECODE;

/** keccak256("ARTWORK_MANAGER_ROLE") etc. — only DEFAULT_ADMIN_ROLE is read on-chain. */
export const DEFAULT_ADMIN_ROLE: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * One medal as configured for on-chain registration. Mirrors the
 * registerArtwork() signature plus the metadata URI we resolve from Grove.
 */
export interface MedalConfig {
  tokenId: number;
  name: string;
  /** Full metadata URI (Grove gateway URL). Falls back to base URI if empty. */
  metadataUri: string;
  /** 0 = uncapped. */
  maxSupply: bigint;
  /** true = mint() open immediately after registration. */
  openMint: boolean;
  /** unix seconds, 0 = no start gate. */
  mintStartsAt: bigint;
  /** unix seconds, 0 = no end gate. */
  mintEndsAt: bigint;
}

/** Shape of an entry in pizzaday/ready/manifest.json. */
export interface ReadyManifestEntry {
  token_id: number;
  file: string;
  name: string;
  source: string;
}

export interface ReadyManifest {
  standard: string;
  collection: string;
  event: string;
  date: string;
  venue: string;
  files: ReadyManifestEntry[];
}

/**
 * Convert a ready/manifest.json into MedalConfig[] with sane defaults:
 * uncapped, locked (openMint=false — flip on at event start), no time window.
 * The Grove gateway URL in `source` is the per-token metadata URI.
 */
export function manifestToMedals(manifest: ReadyManifest): MedalConfig[] {
  return manifest.files
    .slice()
    .sort((a, b) => a.token_id - b.token_id)
    .map((f) => ({
      tokenId: f.token_id,
      name: f.name,
      metadataUri: f.source,
      maxSupply: 0n,
      openMint: false,
      mintStartsAt: 0n,
      mintEndsAt: 0n,
    }));
}

/** Constructor args for a deploy, in ABI order. */
export interface DeployArgs {
  admin: Address;
  name: string;
  symbol: string;
  seasonId: bigint;
  episodeNumber: bigint;
  /** Grove folder URI fallback; can be "" and set later via setBaseUri. */
  baseUri: string;
  /** Collection-level metadata URI; can be "". */
  contractMetadataUri: string;
}

export function deployArgsTuple(
  a: DeployArgs,
): [Address, string, string, bigint, bigint, string, string] {
  return [
    a.admin,
    a.name,
    a.symbol,
    a.seasonId,
    a.episodeNumber,
    a.baseUri,
    a.contractMetadataUri,
  ];
}

/** Sensible defaults for the Pizza Day 2026 deploy. */
export const PDQ_DEPLOY_DEFAULTS = {
  name: "AXIS Pizza Day 2026",
  symbol: "PDQ-2026",
  seasonId: 2026n,
  episodeNumber: 1n,
} as const;
