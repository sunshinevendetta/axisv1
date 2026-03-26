"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  EPISODE_CONFIG,
  arappCollectCollection,
  getDropsByEpisode,
} from "@/src/lib/arapp-collect";

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

// ─── Main component ────────────────────────────────────────────────────────────
export default function ARAppCollectMarketplace() {
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

  const episodeCards = useMemo(
    () =>
      EPISODE_CONFIG.map((episode) => {
        const drops = getDropsByEpisode(episode.slug);
        return {
          ...episode,
          artworkCount: drops.length,
          previewImage: drops[0]?.image ?? "/soon.jpg",
        };
      }),
    [],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040406] text-white">

      {/* Store header */}
      <div className="border-b border-white/8 bg-[#040406]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-24 sm:px-6 sm:pt-28">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/36">{arappCollectCollection.eyebrow}</div>
            <h1 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">AXIS<span className="copy-mark">©</span> Collect</h1>
          </div>
          <div className="hidden gap-6 sm:flex">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Episodes</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{episodeCards.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Configured</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{episodeCards.filter((episode) => episode.artworkCount > 0).length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Season</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappCollectCollection.season}</div>
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

        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <p className="max-w-3xl text-sm leading-6 text-white/54">
            Open an episode first. Each episode page holds the artworks available to collect for that drop.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-6 xl:items-start">

          {/* Episode grid */}
          <div className="min-w-0 flex-1">
            {episodeCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-xs text-white/40">
                No episodes found.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {episodeCards.map((episode) => (
                  <article
                    key={episode.slug}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/18"
                  >
                    <Link href={`/arapp/collect/${episode.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-black/40">
                      <Image
                        src={episode.previewImage}
                        alt={episode.label}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm">
                          {episode.label}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${episode.claimOpen ? "border-white/18 bg-white/8 text-white/74" : "border-white/12 bg-white/6 text-white/50"}`}>
                          {episode.claimOpen ? "Claim Open" : "Preparing"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 rounded-full border border-white/16 bg-black/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                        {episode.artworkCount} artwork{episode.artworkCount === 1 ? "" : "s"}
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="text-[9px] uppercase tracking-[0.28em] text-white/38">Episode collect room</div>
                      <Link href={`/arapp/collect/${episode.slug}`}>
                        <h3 className="mt-1 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white hover:text-white/80">
                          {episode.label}
                        </h3>
                      </Link>
                      <div className="mt-1 text-[11px] text-white/46">
                        {episode.artworkCount > 0 ? `${episode.artworkCount} artwork${episode.artworkCount === 1 ? "" : "s"} configured` : "No artworks synced yet"}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tracking-[-0.02em] text-white">
                          {episode.claimOpen ? "Live" : "Setup"}
                        </span>
                        <Link
                          href={`/arapp/collect/${episode.slug}`}
                          className="text-[10px] uppercase tracking-[0.2em] text-white/44 hover:text-white/70"
                        >
                          Open Episode →
                        </Link>
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
                  <span>Mode</span><span className="text-white/60">Episode first</span>
                </div>
                <div className="flex justify-between">
                  <span>Episodes</span><span className="text-white/60">{episodeCards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Configured</span><span className="text-white/60">{episodeCards.filter((episode) => episode.artworkCount > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network</span><span className="text-white/60">Base</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-white/36">
                Enter an episode first, then open the artwork cards inside that episode. NFC chips should point to those episode or token links.
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
