"use client";

import type { CSSProperties } from "react";
import { explorerTxUrl, getMedalsChainId } from "@/src/lib/pizzaday-onchain";

export type MintPhase =
  | "idle"
  | "checking"
  | "unsupported"
  | "submitting"
  | "pending"
  | "confirmed"
  | "error";

type Props = {
  phase: MintPhase;
  txHash?: string | null;
  error?: string | null;
  style?: CSSProperties;
};

const COPY: Record<MintPhase, { label: string; tone: string }> = {
  idle: { label: "READY", tone: "rgba(255,255,255,0.5)" },
  checking: { label: "CHECKING WALLET…", tone: "rgba(255,255,255,0.6)" },
  unsupported: {
    label: "SMART WALLET REQUIRED FOR GAS SPONSORSHIP",
    tone: "#ffb84d",
  },
  submitting: { label: "SIGN IN WALLET…", tone: "rgba(255,255,255,0.85)" },
  pending: { label: "CLAIMING MEDAL · GAS SPONSORED", tone: "#3aff7a" },
  confirmed: { label: "MEDAL CLAIMED ON BASE", tone: "#3aff7a" },
  error: { label: "CLAIM FAILED", tone: "#ff6b6b" },
};

export function MintStatus({ phase, txHash, error, style }: Props) {
  const copy = COPY[phase];
  const chainId = getMedalsChainId();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--pdq-mono, monospace)",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: copy.tone,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: copy.tone,
          boxShadow:
            phase === "pending" ? `0 0 12px ${copy.tone}` : phase === "confirmed" ? `0 0 10px ${copy.tone}` : "none",
          animation: phase === "pending" || phase === "submitting" ? "pdqPulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span>{copy.label}</span>
      {phase === "error" && error ? (
        <span style={{ color: "rgba(255,255,255,0.5)", textTransform: "none", letterSpacing: 0 }}>
          · {error}
        </span>
      ) : null}
      {txHash ? (
        <a
          href={explorerTxUrl(txHash, chainId)}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "rgba(255,255,255,0.7)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          view tx ↗
        </a>
      ) : null}
    </div>
  );
}
