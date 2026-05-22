"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import {
  checkPaymasterSupport,
  pollCallsStatus,
  sendSponsoredMint,
} from "@/src/lib/pizzaday-paymaster";
import { getMedalsChainId } from "@/src/lib/pizzaday-onchain";
import { MintStatus, type MintPhase } from "./MintStatus";

type Props = {
  /** On-chain tokenId of the medal to claim. */
  tokenId: number;
  /** Optional label override. Default "CLAIM MEDAL". */
  label?: string;
  /** Called after the batch is CONFIRMED (also fires once for "already minted" — local can update). */
  onSuccess?: (info: { txHash?: string; tokenId: number }) => void;
  /** Called on terminal failure. */
  onError?: (error: Error) => void;
  /** Disable the button (e.g. wallet not authenticated yet). */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

type WindowEthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function isProviderLike(value: unknown): value is WindowEthereumProvider {
  return Boolean(
    value &&
      typeof value === "object" &&
      "request" in value &&
      typeof (value as { request: unknown }).request === "function",
  );
}

export function MintMedalButton({
  tokenId,
  label = "CLAIM MEDAL",
  onSuccess,
  onError,
  disabled = false,
  className = "pdq-btn lg",
  style,
}: Props) {
  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient();

  const [phase, setPhase] = useState<MintPhase>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  // One-shot capability check whenever connection changes.
  useEffect(() => {
    let cancelled = false;
    setSupported(null);
    if (!isConnected || !address || !connectorClient?.transport) return;

    const provider = connectorClient.transport as unknown;
    if (!isProviderLike(provider)) return;

    setPhase("checking");
    checkPaymasterSupport(provider, address, getMedalsChainId())
      .then((ok) => {
        if (cancelled) return;
        setSupported(ok);
        setPhase(ok ? "idle" : "unsupported");
      })
      .catch(() => {
        if (cancelled) return;
        setSupported(false);
        setPhase("unsupported");
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, connectorClient]);

  const handleClick = useCallback(async () => {
    if (!isConnected || !address) {
      setPhase("error");
      setErrorMessage("connect wallet first");
      return;
    }
    const provider = connectorClient?.transport as unknown;
    if (!isProviderLike(provider)) {
      setPhase("error");
      setErrorMessage("wallet provider unavailable");
      return;
    }

    setErrorMessage(null);
    setTxHash(null);
    setPhase("submitting");

    try {
      const { batchId } = await sendSponsoredMint(provider, address, tokenId);
      setPhase("pending");

      const status = await pollCallsStatus(provider, batchId, {
        intervalMs: 1500,
        timeoutMs: 90_000,
      });

      const receipt = status.receipts?.[0];
      const hash = receipt?.transactionHash ?? null;
      setTxHash(hash);
      setPhase("confirmed");
      onSuccess?.({ txHash: hash ?? undefined, tokenId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "claim failed";
      setErrorMessage(message);
      setPhase("error");
      if (err instanceof Error) onError?.(err);
    }
  }, [address, connectorClient, isConnected, onError, onSuccess, tokenId]);

  const buttonDisabled =
    disabled ||
    !isConnected ||
    supported === false ||
    phase === "checking" ||
    phase === "submitting" ||
    phase === "pending" ||
    phase === "confirmed";

  return (
    <div style={{ display: "grid", gap: 10, ...style }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={buttonDisabled}
        className={className}
      >
        {phase === "confirmed" ? "MEDAL CLAIMED ✓" : label}{" "}
        {!buttonDisabled && <span className="arr">→</span>}
      </button>
      <MintStatus phase={phase} txHash={txHash} error={errorMessage} />
    </div>
  );
}
