/**
 * Client-side helper for sponsored Pizza Day mints.
 *
 * Uses EIP-5792 `wallet_sendCalls` with ERC-7677 paymasterService capability.
 * Smart Wallet (Coinbase) handles the UserOp; we just hand it our proxy URL
 * (which then forwards to CDP). No 4337 bundler / SDK plumbing in the browser.
 */

import { numberToHex, type Address } from "viem";
import {
  encodeMintCall,
  getMedalsChainId,
  getMedalsContractAddress,
} from "./pizzaday-onchain";

/** Path of the server-side paymaster proxy. Override with NEXT_PUBLIC_PDQ_PAYMASTER_URL. */
export function getPaymasterProxyUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PDQ_PAYMASTER_URL;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv.trim();
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/pizzaday/paymaster`;
  }
  return "/api/pizzaday/paymaster";
}

type EthereumLikeProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type Capabilities = Record<string, { paymasterService?: { supported?: boolean } | undefined }>;

/** Returns true if the connected provider+account supports paymaster sponsorship. */
export async function checkPaymasterSupport(
  provider: EthereumLikeProvider,
  account: Address,
  chainId: number = getMedalsChainId(),
): Promise<boolean> {
  try {
    const capabilities = (await provider.request({
      method: "wallet_getCapabilities",
      params: [account],
    })) as Capabilities;
    // wallet_getCapabilities is keyed by chainId as either number-string or hex.
    const hex = numberToHex(chainId);
    const entry = capabilities[hex] ?? capabilities[String(chainId)];
    return Boolean(entry?.paymasterService?.supported);
  } catch {
    return false;
  }
}

export type SendMintResult = {
  /** EIP-5792 batch id returned by wallet_sendCalls. */
  batchId: string;
};

/**
 * Fire a sponsored mint. Throws if no medals contract is configured, no
 * paymaster URL is available, or the wallet rejects the call.
 *
 * `wallet_sendCalls` returns a batch id, not a tx hash. To resolve a tx hash,
 * poll `wallet_getCallsStatus` (see useMintMedal hook).
 */
export async function sendSponsoredMint(
  provider: EthereumLikeProvider,
  from: Address,
  tokenId: bigint | number,
  options?: {
    chainId?: number;
    contractAddress?: Address;
    paymasterUrl?: string;
  },
): Promise<SendMintResult> {
  const contractAddress = options?.contractAddress ?? getMedalsContractAddress();
  if (!contractAddress) throw new Error("PDQ medals contract address not configured");

  const chainId = options?.chainId ?? getMedalsChainId();
  const paymasterUrl = options?.paymasterUrl ?? getPaymasterProxyUrl();

  const data = encodeMintCall(tokenId);

  const result = (await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "1.0",
        chainId: numberToHex(chainId),
        from,
        calls: [
          {
            to: contractAddress,
            value: "0x0",
            data,
          },
        ],
        capabilities: {
          paymasterService: {
            url: paymasterUrl,
          },
        },
      },
    ],
  })) as string | { id?: string };

  const batchId = typeof result === "string" ? result : result?.id ?? "";
  if (!batchId) throw new Error("wallet_sendCalls returned no batch id");
  return { batchId };
}

export type CallsStatus = {
  status: "PENDING" | "CONFIRMED" | string;
  receipts?: Array<{
    transactionHash?: `0x${string}`;
    status?: string;
    blockNumber?: string;
  }>;
};

/** Poll `wallet_getCallsStatus` until the batch leaves PENDING (or until cancelled). */
export async function pollCallsStatus(
  provider: EthereumLikeProvider,
  batchId: string,
  options?: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal },
): Promise<CallsStatus> {
  const interval = options?.intervalMs ?? 1500;
  const timeout = options?.timeoutMs ?? 90_000;
  const start = Date.now();

  while (true) {
    if (options?.signal?.aborted) throw new Error("aborted");

    const status = (await provider.request({
      method: "wallet_getCallsStatus",
      params: [batchId],
    })) as CallsStatus;

    if (status?.status && status.status !== "PENDING") return status;
    if (Date.now() - start > timeout) throw new Error("timed out waiting for batch confirmation");
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
