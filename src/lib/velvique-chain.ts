import { encodeFunctionData, type Address, type Hex } from "viem";

/* Contract adapter, shared by browser and server. This is the only file that
   knows the collectible contract's shape: the ABI, how a recipe is packed for
   it, and the mint call. AWAITING the project's ERC-1155 address and ABI —
   the ABI below is a placeholder for the reads the registry needs (recipes
   given out, owners, a wallet's card, its token URI) and the sponsored mint.
   Swap it, encodeCardMint and the reads in velvique-registry for the real
   contract's functions; nothing else in the app touches the contract. */

export const VELVIQUE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_VELVIQUE_CHAIN_ID || 8453);

export const VELVIQUE_CARDS_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipe", type: "bytes8" },
      { name: "uri", type: "string" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  { type: "function", name: "allRecipes", stateMutability: "view", inputs: [], outputs: [{ type: "bytes8[]" }] },
  { type: "function", name: "allOwners", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "totalMinted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "cardOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "tokenOfRecipe", stateMutability: "view", inputs: [{ type: "bytes8" }], outputs: [{ type: "uint256" }] },
] as const;

export function getCardsAddress(): Address | null {
  const value = process.env.NEXT_PUBLIC_VELVIQUE_CARDS_ADDRESS?.trim();
  return value && /^0x[0-9a-fA-F]{40}$/.test(value) ? (value as Address) : null;
}

/* Catalog order defines the on-chain ingredient index (T01 = 1 ... M02 = 12). */
export const INGREDIENT_ORDER = ["T01", "F01", "F02", "F03", "F04", "B01", "B02", "B03", "E01", "E02", "M01", "M02"] as const;
const UNIT_ML = 2.5;

export type ChainComponent = { ingredientId: string; ml: number };

export function encodeRecipe(components: ChainComponent[]): Hex {
  const pairs = components
    .map((c) => [INGREDIENT_ORDER.indexOf(c.ingredientId as (typeof INGREDIENT_ORDER)[number]) + 1, Math.round(c.ml / UNIT_ML)] as const)
    .sort((a, b) => a[0] - b[0]);
  if (pairs.length === 0 || pairs.length > 4 || pairs.some(([index, units]) => index < 1 || units < 1 || units > 255)) {
    throw new Error("Recipe cannot be encoded");
  }
  const bytes = pairs.flatMap(([index, units]) => [index, units]);
  while (bytes.length < 8) bytes.push(0);
  return `0x${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}` as Hex;
}

export function decodeRecipe(code: Hex): ChainComponent[] {
  const hex = code.slice(2).padEnd(16, "0");
  const out: ChainComponent[] = [];
  for (let i = 0; i < 16; i += 4) {
    const index = parseInt(hex.slice(i, i + 2), 16);
    const units = parseInt(hex.slice(i + 2, i + 4), 16);
    if (index > 0 && units > 0) out.push({ ingredientId: INGREDIENT_ORDER[index - 1], ml: units * UNIT_ML });
  }
  return out.sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
}

export function encodeCardMint(recipe: Hex, uri: string, deadline: bigint, signature: Hex): Hex {
  return encodeFunctionData({ abi: VELVIQUE_CARDS_ABI, functionName: "mint", args: [recipe, uri, deadline, signature] });
}

export function explorerTokenUrl(tokenId: number | bigint, chainId = VELVIQUE_CHAIN_ID): string | null {
  const address = getCardsAddress();
  if (!address) return null;
  const base = chainId === 84532 ? "https://sepolia.basescan.org" : "https://basescan.org";
  return `${base}/token/${address}?a=${tokenId}`;
}
