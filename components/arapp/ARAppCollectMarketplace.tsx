"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { getARAppCollectDrops, type ARAppCollectDrop, type ARAppCollectStatus } from "@/src/lib/arapp-collect";

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

const arappDrops = getARAppCollectDrops();

// ─── Types ─────────────────────────────────────────────────────────────────────
type FilterKey = "all" | "live" | "member-access" | "coming-soon" | "sold-out";

const statusLabel: Record<ARAppCollectStatus, string> = {
  live: "Live",
  "member-access": "Members",
  "coming-soon": "Soon",
  "sold-out": "Sold Out",
};

const statusTone: Record<ARAppCollectStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  "member-access": "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
  "coming-soon": "border-amber-400/30 bg-amber-400/15 text-amber-300",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "member-access", label: "Members" },
  { key: "coming-soon", label: "Soon" },
  { key: "sold-out", label: "Sold Out" },
];

function isClaimable(drop: ARAppCollectDrop) {
  return drop.status === "live" || drop.status === "member-access";
}

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

// ─── Per-drop claim button (needs its own hook calls) ────────────────────────
function ClaimButton({ drop }: { drop: ARAppCollectDrop }) {
  const { address, isConnected } = useAccount();
  const tokenId = BigInt(drop.tokenId);
  const canClaim = isClaimable(drop);

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

  if (!canClaim) {
    return (
      <div className={`w-full rounded-xl border border-white/8 bg-white/4 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-white/28`}>
        {drop.status === "sold-out" ? "Sold Out" : "Coming Soon"}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-full rounded-xl border border-white/10 bg-white/4 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-white/42">
        Connect to Claim
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/8 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-emerald-300">
        Claimed ✓
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={writing || confirming}
      className="w-full rounded-xl border border-white/16 bg-white py-2.5 text-[10px] uppercase tracking-[0.26em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
    >
      {writing ? "Confirm in wallet…" : confirming ? "Claiming…" : drop.status === "member-access" ? "Claim Access" : "Claim Free"}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ARAppCollectMarketplace() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [walletOpen, setWalletOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => { setIsMounted(true); }, []);

  const preferredConnector = useMemo(
    () =>
      connectors.find(
        (c) => c.id === "coinbaseWalletSDK" || c.id === "coinbaseWallet" || c.id === "coinbaseSmartWallet",
      ) || connectors[0],
    [connectors],
  );

  const alternateConnectors = useMemo(
    () => connectors.filter((c) => c.id !== preferredConnector?.id),
    [connectors, preferredConnector],
  );

  const visibleDrops = useMemo(
    () => (filter === "all" ? arappDrops : arappDrops.filter((d) => d.status === filter)),
    [filter],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040406] text-white">

      {/* Store header */}
      <div className="border-b border-white/8 bg-[#040406]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-24 sm:px-6 sm:pt-28">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/36">Episode Next · Free Claim</div>
            <h1 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">SPECTRA<span className="copy-mark">©</span> Collect</h1>
          </div>
          <div className="hidden gap-6 sm:flex">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Artworks</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappDrops.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Claimable</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappDrops.filter((d) => d.status === "live").length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Gas</div>
              <div className="mt-0.5 text-sm font-semibold text-white">Free</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWalletOpen(!walletOpen)}
            className="flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/78 transition-colors hover:border-white/24 hover:text-white"
          >
            {isMounted && isConnected ? shortAddress(address) : "Wallet"}
          </button>
        </div>

        {/* Filter bar */}
        <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6">
          {filterOptions.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setFilter(o.key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                filter === o.key
                  ? "border-white/20 bg-white text-black"
                  : "border-white/10 bg-white/4 text-white/54 hover:border-white/18 hover:text-white/80"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-6 xl:items-start">

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            {visibleDrops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-xs text-white/40">
                No artworks match this filter.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDrops.map((drop) => (
                  <article
                    key={drop.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/18"
                  >
                    <Link href={`/arapp/collect/${drop.episodeSlug}/${drop.tokenId}`} className="relative block aspect-[4/5] overflow-hidden bg-black/40">
                      <Image
                        src={drop.image}
                        alt={drop.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3">
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                          {statusLabel[drop.status]}
                        </span>
                      </div>
                      {drop.remaining > 0 && drop.remaining < 100 && (
                        <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-white/60">
                          {drop.remaining} left
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                        Free
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="text-[9px] uppercase tracking-[0.28em] text-white/38">{drop.artist}</div>
                      <Link href={`/arapp/collect/${drop.episodeSlug}/${drop.tokenId}`}>
                        <h3 className="mt-1 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white hover:text-white/80">
                          {drop.title}
                        </h3>
                      </Link>
                      <div className="mt-1 text-[11px] text-white/46">{drop.edition}</div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tracking-[-0.02em] text-white">Free</span>
                        <Link
                          href={`/arapp/collect/${drop.episodeSlug}/${drop.tokenId}`}
                          className="text-[10px] uppercase tracking-[0.2em] text-white/44 hover:text-white/70"
                        >
                          Details →
                        </Link>
                      </div>

                      <div className="mt-3">
                        {isMounted ? (
                          <ClaimButton drop={drop} />
                        ) : (
                          <div className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 text-center text-[10px] uppercase tracking-[0.26em] text-white/28">
                            Loading…
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Wallet panel — sticky sidebar */}
          <aside
            className={`xl:sticky xl:top-24 xl:block xl:w-72 xl:shrink-0 xl:self-start ${
              walletOpen
                ? "fixed inset-y-0 right-0 z-40 w-72 overflow-y-auto bg-[#040406] px-4 py-6 xl:relative xl:inset-auto xl:z-auto xl:px-0 xl:py-0"
                : "hidden xl:block"
            }`}
          >
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/38">Wallet</div>
                  <h2 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">
                    {isMounted && isConnected ? shortAddress(address) : "Connect to claim"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWalletOpen(false)}
                  className="xl:hidden text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {isMounted && isConnected ? (
                <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] text-white/60">{chain?.name || "Base"}</div>
                  <div className="mt-1 font-mono text-[12px] text-white/80">{shortAddress(address)}</div>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] uppercase tracking-[0.22em] text-white/50 hover:text-white"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                isMounted && preferredConnector ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => connect({ connector: preferredConnector, chainId: base.id })}
                      disabled={isPending}
                      className="w-full rounded-xl border border-white/16 bg-white px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-black disabled:opacity-40"
                    >
                      {isPending ? "Connecting…" : connectorLabel(preferredConnector.id, preferredConnector.name)}
                    </button>
                    {alternateConnectors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => connect({ connector: c, chainId: base.id })}
                        disabled={isPending}
                        className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/56 disabled:opacity-40"
                      >
                        {connectorLabel(c.id, c.name)}
                      </button>
                    ))}
                  </div>
                ) : null
              )}

              <div className="rounded-xl border border-white/6 bg-black/20 p-3 space-y-1.5 text-[10px] text-white/40">
                <div className="flex justify-between">
                  <span>Network</span><span className="text-white/60">Base</span>
                </div>
                <div className="flex justify-between">
                  <span>Claim price</span><span className="text-white/60">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas</span><span className="text-white/60">Sponsored</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard</span><span className="text-white/60">ERC-1155</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-white/36">
                Each artwork in this episode collection is free to claim for today only. Gas fees are sponsored.
              </div>
            </div>
          </aside>
        </div>
      </div>

      {walletOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 xl:hidden" onClick={() => setWalletOpen(false)} />
      )}
    </main>
  );
}
