"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { type ARAppCollectDrop, type ARAppCollectStatus, type EpisodeConfig } from "@/src/lib/arapp-collect";
import ModelViewer from "@/components/arapp/ModelViewer";

const COLLECT_CONTRACT =
  (process.env.NEXT_PUBLIC_COLLECT_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

const COLLECT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const statusLabel: Record<ARAppCollectStatus, string> = {
  live: "Live Now",
  "member-access": "Member Access",
  "coming-soon": "Coming Soon",
  "sold-out": "Sold Out",
};

const statusTone: Record<ARAppCollectStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  "member-access": "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
  "coming-soon": "border-amber-400/30 bg-amber-400/15 text-amber-300",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

function shortAddress(v: string | undefined) {
  if (!v) return "Not connected";
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

function connectorLabel(id: string, name: string) {
  if (id === "coinbaseWalletSDK" || id === "coinbaseWallet" || id === "coinbaseSmartWallet") return "Coinbase / Base Smart Wallet";
  if (id === "walletConnect") return "WalletConnect";
  if (id === "injected") return "Browser Wallet";
  return name || "Connect Wallet";
}

type ViewMode = "image" | "3d";

type Props = { drop: ARAppCollectDrop; episode: EpisodeConfig; isContractDeployed?: boolean };

export default function ARAppCollectProductPage({ drop, episode, isContractDeployed = false }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("image");

  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const canClaim = drop.status === "live" || drop.status === "member-access";
  const tokenId = BigInt(drop.tokenId);

  const preferred = connectors.find(
    (c) => c.id === "coinbaseWalletSDK" || c.id === "coinbaseWallet" || c.id === "coinbaseSmartWallet",
  ) || connectors[0];

  const alternates = connectors.filter((c) => c.id !== preferred?.id);

  const { data: balance } = useReadContract({
    address: COLLECT_CONTRACT,
    abi: COLLECT_ABI,
    functionName: "balanceOf",
    args: address ? [address, tokenId] : undefined,
    chainId: base.id,
    query: { enabled: !!address },
  });

  const alreadyClaimed = balance !== undefined && balance > 0n;

  const { writeContract, data: hash, isPending: writing } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimed = alreadyClaimed || isSuccess;

  useEffect(() => { setIsMounted(true); }, []);

  function handleClaim() {
    if (!address || !canClaim || claimed) return;
    writeContract({
      address: COLLECT_CONTRACT,
      abi: COLLECT_ABI,
      functionName: "mint",
      args: [address, tokenId, 1n, "0x"],
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/36">
          <Link href="/arapp/collect" className="hover:text-white/60 transition-colors">Collect</Link>
          <span>/</span>
          <Link href={`/arapp/collect/${episode.slug}`} className="hover:text-white/60 transition-colors">{episode.label}</Link>
          <span>/</span>
          <span className="text-white/54">{drop.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">

          {/* Image + 3D panel */}
          <div className="space-y-3">
            {/* View toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("image")}
                className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                  viewMode === "image"
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                  viewMode === "3d"
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                }`}
              >
                3D View
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                  {statusLabel[drop.status]}
                </span>
                <span className="rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
                  Free
                </span>
              </div>
            </div>

            {/* Viewer area */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {viewMode === "image" ? (
                <>
                  <Image
                    src={drop.image}
                    alt={drop.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </>
              ) : (
                <ModelViewer
                  src={drop.model}
                  poster={drop.image}
                  alt={drop.title}
                  className="h-full w-full"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {drop.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/52">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Info + claim panel */}
          <div className="space-y-5">

            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">{drop.artist}</div>
              <h1 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{drop.title}</h1>
              <p className="mt-2 text-sm leading-6 text-white/56">{drop.subtitle}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-semibold tracking-[-0.04em] text-white">Free</span>
                <span className="text-[11px] text-white/36">Gas sponsored · ERC-1155 on Base</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Edition</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">{drop.edition}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Format</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">{drop.format}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Token</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">ERC-1155 #{tokenId.toString()}</div>
              </div>
            </div>

            {/* Availability */}
            {drop.remaining > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/4 p-3 text-[11px] text-white/54">
                <span className="font-semibold text-white">{drop.remaining}</span>{" "}
                {drop.remaining === 1 ? "edition" : "editions"} available
                {drop.remaining < 30 && (
                  <span className="ml-2 text-amber-400/80">— almost gone</span>
                )}
              </div>
            )}

            {/* Utilities */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">What you get</div>
              <ul className="mt-3 space-y-2">
                {drop.utilities.map((u) => (
                  <li key={u} className="flex items-start gap-2.5 text-[12px] text-white/66">
                    <span className="mt-0.5 text-white/30">—</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/44">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {drop.delivery}
            </div>

            {/* Wallet section */}
            <div className="rounded-xl border border-white/8 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Wallet</div>
                  <div className="mt-0.5 text-[12px] font-medium text-white/80">
                    {isMounted ? shortAddress(address) : "—"}
                  </div>
                  {isMounted && isConnected && (
                    <div className="mt-0.5 text-[10px] text-white/36">{chain?.name || "Base"}</div>
                  )}
                </div>
                {isMounted && isConnected && (
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/48 hover:text-white"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {isMounted && !isConnected && preferred && (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => connect({ connector: preferred, chainId: base.id })}
                    disabled={isPending}
                    className="w-full rounded-xl border border-white/14 bg-white/8 px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:bg-white/12 disabled:opacity-40"
                  >
                    {isPending ? "Connecting…" : connectorLabel(preferred.id, preferred.name)}
                  </button>
                  {alternates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => connect({ connector: c, chainId: base.id })}
                      disabled={isPending}
                      className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/48 disabled:opacity-40"
                    >
                      {connectorLabel(c.id, c.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Claim CTA */}
            {isMounted && canClaim && (
              <>
                {claimed ? (
                  <div className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/8 py-4 text-center text-[11px] uppercase tracking-[0.28em] text-emerald-300">
                    Claimed ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={writing || confirming || !isConnected}
                    className="w-full rounded-xl border border-white/20 bg-white py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {!isConnected
                      ? "Connect Wallet to Claim"
                      : writing
                      ? "Confirm in wallet…"
                      : confirming
                      ? "Claiming…"
                      : drop.status === "member-access"
                      ? "Claim Access Drop"
                      : "Claim Free"}
                  </button>
                )}
              </>
            )}

            {!canClaim && (
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[11px] text-white/42">
                {drop.status === "coming-soon"
                  ? "This artwork opens in the next release wave."
                  : "This edition is sold out."}
              </div>
            )}

            <Link
              href={`/arapp/collect/${episode.slug}`}
              className="block text-center text-[10px] uppercase tracking-[0.26em] text-white/34 hover:text-white/56"
            >
              ← Back to {episode.label}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
