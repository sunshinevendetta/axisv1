/**
 * arapp-collect-chain.ts
 *
 * Server-only — reads ERC-1155 uri(tokenId) from Base mainnet and resolves
 * the metadata JSON. Falls back gracefully when the contract is not yet
 * deployed (address still at the zero-address placeholder).
 */

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import type { ARAppCollectMetadata } from "./arapp-collect";

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_COLLECT_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const IS_CONTRACT_DEPLOYED =
  CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL ?? "https://mainnet.base.org"),
});

const ERC1155_ABI = [
  {
    name: "uri",
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "totalSupply",
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ─── URI resolution ───────────────────────────────────────────────────────────

async function resolveURI(raw: string, tokenId: number): Promise<ARAppCollectMetadata | null> {
  try {
    // ERC-1155 {id} substitution — pad tokenId to 64 hex chars
    const hexId = tokenId.toString(16).padStart(64, "0");
    let uri = raw.replace("{id}", hexId);

    // base64 inline JSON
    if (uri.startsWith("data:application/json;base64,")) {
      const json = Buffer.from(uri.split(",")[1], "base64").toString("utf-8");
      return JSON.parse(json) as ARAppCollectMetadata;
    }

    // IPFS → public gateway
    if (uri.startsWith("ipfs://")) {
      uri = `https://ipfs.io/ipfs/${uri.slice(7)}`;
    }

    const res = await fetch(uri, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as ARAppCollectMetadata;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reads uri(tokenId) from the deployed ERC-1155 contract and resolves the
 * metadata JSON. Returns null when the contract is not yet deployed or the
 * call fails, so the caller can fall back to the local config.
 */
export async function fetchOnchainMetadata(tokenId: number): Promise<ARAppCollectMetadata | null> {
  if (!IS_CONTRACT_DEPLOYED) return null;

  try {
    const uri = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ERC1155_ABI,
      functionName: "uri",
      args: [BigInt(tokenId)],
    });

    return resolveURI(uri, tokenId);
  } catch {
    return null;
  }
}

/**
 * Reads totalSupply(tokenId). Returns null when the contract is not deployed
 * or the call fails.
 */
export async function fetchOnchainSupply(tokenId: number): Promise<number | null> {
  if (!IS_CONTRACT_DEPLOYED) return null;

  try {
    const supply = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ERC1155_ABI,
      functionName: "totalSupply",
      args: [BigInt(tokenId)],
    });

    return Number(supply);
  } catch {
    return null;
  }
}

/**
 * Fetches metadata + supply for a token. Onchain data wins; local config is
 * the fallback for fields the chain does not provide (status, supply when not
 * yet deployed).
 */
export async function fetchTokenData(tokenId: number) {
  const [metadata, supply] = await Promise.all([
    fetchOnchainMetadata(tokenId),
    fetchOnchainSupply(tokenId),
  ]);

  return { metadata, supply };
}
