"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import type { EpisodeConfig, ARAppCollectToken, ARAppCollectMetadata, ARAppCollectStatus } from "@/src/lib/arapp-collect";

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_COLLECT_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

const COLLECT_ABI = [
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }, { internalType: "uint256", name: "amount", type: "uint256" }, { internalType: "bytes", name: "data", type: "bytes" }],
    name: "mint", outputs: [], stateMutability: "nonpayable", type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }, { internalType: "uint256", name: "id", type: "uint256" }],
    name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function",
  },
] as const;

const statusTone: Record<ARAppCollectStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  "member-access": "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
  "coming-soon": "border-amber-400/30 bg-amber-400/15 text-amber-300",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

const statusLabel: Record<ARAppCollectStatus, string> = {
  live: "Live",
  "member-access": "Members",
  "coming-soon": "Soon",
  "sold-out": "Sold Out",
};

function attr(metadata: ARAppCollectMetadata, key: string): string {
  return metadata.attributes.find((a) => a.trait_type === key)?.value ?? "—";
}

function ClaimButton({ tokenId, status }: { tokenId: number; status: ARAppCollectStatus }) {
  const { address, isConnected } = useAccount();
  const canClaim = status === "live" || status === "member-access";

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: COLLECT_ABI,
    functionName: "balanceOf",
    args: address ? [address, BigInt(tokenId)] : undefined,
    chainId: base.id,
    query: { enabled: !!address },
  });

  const claimed = balance !== undefined && balance > 0n;
  const { writeContract, data: hash, isPending: writing } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const done = claimed || isSuccess;

  if (!canClaim) return (
    <div className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-white/28">
      {status === "sold-out" ? "Sold Out" : "Coming Soon"}
    </div>
  );

  if (!isConnected) return (
    <div className="w-full rounded-xl border border-white/10 bg-white/4 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-white/42">
      Connect to Claim
    </div>
  );

  if (done) return (
    <div className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/8 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-emerald-300">
      Claimed ✓
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => address && writeContract({ address: CONTRACT_ADDRESS, abi: COLLECT_ABI, functionName: "mint", args: [address, BigInt(tokenId), 1n, "0x"], chainId: base.id })}
      disabled={writing || confirming}
      className="w-full rounded-xl border border-white/16 bg-white py-2.5 text-[10px] uppercase tracking-[0.26em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
    >
      {writing ? "Confirm in wallet…" : confirming ? "Claiming…" : status === "member-access" ? "Claim Access" : "Claim Free"}
    </button>
  );
}

type TokenRow = {
  token: ARAppCollectToken;
  onchainMetadata: ARAppCollectMetadata | null;
  onchainSupply: number | null;
};

type Props = {
  episode: EpisodeConfig;
  tokens: TokenRow[];
  isContractDeployed: boolean;
};

export default function ARAppCollectEpisodePage({ episode, tokens, isContractDeployed }: Props) {
  const [mounted, setMounted] = useState(false);
  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const preferred = connectors.find(
    (c) => c.id === "coinbaseWalletSDK" || c.id === "coinbaseWallet" || c.id === "coinbaseSmartWallet",
  ) ?? connectors[0];

  // Use onchain metadata when available, fall back to local config
  const resolvedTokens = tokens.map(({ token, onchainMetadata, onchainSupply }) => ({
    token,
    metadata: onchainMetadata ?? token.metadata,
    remaining: onchainSupply ?? token.remaining,
  }));

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      {/* Episode header */}
      <div className="border-b border-white/8 bg-[#040406]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-24 sm:px-6 sm:pt-28">
          <div>
            <nav className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-white/30">
              <Link href="/arapp/collect" className="hover:text-white/54 transition-colors">Collect</Link>
              <span>/</span>
              <span className="text-white/50">{episode.label}</span>
            </nav>
            <h1 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-white">{episode.label} Collection</h1>
          </div>
          <div className="hidden gap-5 sm:flex">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Artworks</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{resolvedTokens.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Chain</div>
              <div className="mt-0.5 text-sm font-semibold text-white">
                {isContractDeployed ? "Base" : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Gas</div>
              <div className="mt-0.5 text-sm font-semibold text-white">Free</div>
            </div>
          </div>
          {!isContractDeployed && (
            <div className="rounded-full border border-amber-400/20 bg-amber-400/8 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-amber-300">
              Preview — contract pending
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-6 xl:items-start">

          {/* Artwork grid */}
          <div className="min-w-0 flex-1">
            {resolvedTokens.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-xs text-white/40">
                No artworks found for this episode.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedTokens.map(({ token, metadata, remaining }) => (
                  <article
                    key={token.tokenId}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/18"
                  >
                    <Link
                      href={`/arapp/collect/${episode.slug}/${token.tokenId}`}
                      className="relative block aspect-[4/5] overflow-hidden bg-black/40"
                    >
                      <Image
                        src={metadata.image}
                        alt={metadata.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 flex gap-1.5">
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${statusTone[token.status]}`}>
                          {statusLabel[token.status]}
                        </span>
                      </div>
                      {remaining > 0 && remaining < 100 && (
                        <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-white/60">
                          {remaining} left
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                        Free
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="text-[9px] uppercase tracking-[0.28em] text-white/38">{attr(metadata, "Artist")}</div>
                      <Link href={`/arapp/collect/${episode.slug}/${token.tokenId}`}>
                        <h3 className="mt-1 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white hover:text-white/80">
                          {metadata.name}
                        </h3>
                      </Link>
                      <div className="mt-1 text-[11px] text-white/46">{attr(metadata, "Edition")}</div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">Free</span>
                        <Link
                          href={`/arapp/collect/${episode.slug}/${token.tokenId}`}
                          className="text-[10px] uppercase tracking-[0.2em] text-white/44 hover:text-white/70"
                        >
                          Details →
                        </Link>
                      </div>

                      <div className="mt-3">
                        <ClaimButton tokenId={token.tokenId} status={token.status} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Wallet sidebar */}
          <aside className="hidden xl:sticky xl:top-24 xl:block xl:w-72 xl:shrink-0 xl:self-start">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/38">Wallet</div>
                <h2 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">
                  {isConnected
                    ? `${address?.slice(0, 6)}…${address?.slice(-4)}`
                    : "Connect to claim"}
                </h2>
              </div>

              {isConnected ? (
                <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] text-white/60">{chain?.name ?? "Base"}</div>
                  <div className="mt-1 font-mono text-[12px] text-white/80">{address?.slice(0, 6)}…{address?.slice(-4)}</div>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] uppercase tracking-[0.22em] text-white/50 hover:text-white"
                  >
                    Disconnect
                  </button>
                </div>
              ) : preferred ? (
                <button
                  type="button"
                  onClick={() => connect({ connector: preferred, chainId: base.id })}
                  disabled={isPending}
                  className="w-full rounded-xl border border-white/16 bg-white px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-black disabled:opacity-40"
                >
                  {isPending ? "Connecting…" : "Coinbase / Base Smart Wallet"}
                </button>
              ) : null}

              <div className="rounded-xl border border-white/6 bg-black/20 p-3 space-y-1.5 text-[10px] text-white/40">
                <div className="flex justify-between"><span>Network</span><span className="text-white/60">Base</span></div>
                <div className="flex justify-between"><span>Standard</span><span className="text-white/60">ERC-1155</span></div>
                <div className="flex justify-between"><span>Gas</span><span className="text-white/60">Sponsored</span></div>
                <div className="flex justify-between"><span>Data source</span><span className="text-white/60">{isContractDeployed ? "Onchain" : "Preview"}</span></div>
              </div>

              <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-white/36">
                Each artwork in {episode.label} is free to claim. Token metadata is read directly from the ERC-1155 contract.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
