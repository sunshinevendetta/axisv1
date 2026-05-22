/**
 * On-chain identity of the Pizza Day medals contract.
 * Frontend-side. ABI subset matches AxisPizzaDayEpisode1155 — only the
 * functions we actually call from the browser.
 */

import { encodeFunctionData, type Address } from "viem";

export const PDQ_MEDALS_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "hasMinted",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "artworks",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "metadataUri", type: "string" },
      { name: "maxSupply", type: "uint256" },
      { name: "minted", type: "uint256" },
      { name: "exists", type: "bool" },
      { name: "openMint", type: "bool" },
      { name: "mintStartsAt", type: "uint64" },
      { name: "mintEndsAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

/** Address of the deployed AxisPizzaDayEpisode1155, or null if unset. */
export function getMedalsContractAddress(): Address | null {
  const raw = process.env.NEXT_PUBLIC_PDQ_MEDALS_ADDRESS;
  if (!raw || !/^0x[0-9a-fA-F]{40}$/.test(raw)) return null;
  return raw as Address;
}

/** Chain id for the deployment. Defaults to Base mainnet (8453). */
export function getMedalsChainId(): number {
  const raw = process.env.NEXT_PUBLIC_PDQ_CHAIN_ID;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 8453;
}

/** Build calldata for `mint(uint256 tokenId)`. */
export function encodeMintCall(tokenId: bigint | number): `0x${string}` {
  return encodeFunctionData({
    abi: PDQ_MEDALS_ABI,
    functionName: "mint",
    args: [BigInt(tokenId)],
  });
}

/** Block explorer base for the configured chain. */
export function getExplorerBase(chainId: number = getMedalsChainId()): string {
  switch (chainId) {
    case 8453:
      return "https://basescan.org";
    case 84532:
      return "https://sepolia.basescan.org";
    default:
      return "https://basescan.org";
  }
}

export function explorerTxUrl(txHash: string, chainId?: number): string {
  return `${getExplorerBase(chainId)}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string, chainId?: number): string {
  return `${getExplorerBase(chainId)}/address/${address}`;
}
