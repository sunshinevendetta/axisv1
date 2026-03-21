"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ModelViewer from "@/components/arapp/ModelViewer";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { type ARAppDrop, type ARAppDropStatus } from "@/src/lib/arapp-catalog";

const statusLabel: Record<ARAppDropStatus, string> = {
  live: "Live Now",
  "member-access": "Member Access",
  "coming-soon": "Coming Soon",
  "sold-out": "Sold Out",
};

const statusTone: Record<ARAppDropStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  "member-access": "border-cyan-400/30 bg-cyan-400/15 text-cyan-300",
  "coming-soon": "border-amber-400/30 bg-amber-400/15 text-amber-300",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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

type ViewMode = "image" | "model" | "video";

type Props = { drop: ARAppDrop };

function detectMediaKind(url: string) {
  const normalized = url.split("?")[0].toLowerCase();
  if (!normalized) return "none";
  if (normalized.endsWith(".glb") || normalized.endsWith(".gltf")) return "model";
  if (normalized.endsWith(".mp4") || normalized.endsWith(".webm") || normalized.endsWith(".mov") || normalized.endsWith(".m4v")) return "video";
  return "other";
}

export default function ARAppProductPage({ drop }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("image");
  const [status, setStatus] = useState<string>("");
  const [isPreparing, setIsPreparing] = useState(false);
  const mediaKind = detectMediaKind(drop.model);
  const hasSecondaryMedia = Boolean(drop.model);

  useEffect(() => {
    if (mediaKind === "video") {
      setViewMode("video");
    } else if (mediaKind === "model") {
      setViewMode("model");
    } else {
      setViewMode("image");
    }
  }, [mediaKind]);

  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const canBuy = drop.status === "live" || drop.status === "member-access";

  const preferred = connectors.find(
    (c) => c.id === "coinbaseWalletSDK" || c.id === "coinbaseWallet" || c.id === "coinbaseSmartWallet",
  ) || connectors[0];

  const alternates = connectors.filter((c) => c.id !== preferred?.id);

  async function handleMint() {
    if (!canBuy) return;
    setIsPreparing(true);
    setStatus("");
    try {
      const res = await fetch("/api/arapp/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address || null,
          items: [{ id: drop.id, quantity }],
        }),
      });
      const data = (await res.json()) as {
        previewMode?: boolean; message?: string; checkoutUrl?: string; orderReference?: string; error?: string;
      };
      if (!res.ok) { setStatus(data.error || "Order failed."); return; }
      if (data.checkoutUrl) {
        setStatus(`Order ref: ${data.orderReference}`);
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
        return;
      }
      setStatus(data.message || `Preview order prepared — ref: ${data.orderReference}`);
    } catch {
      setStatus("Commerce unavailable. Preview mode is active.");
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#040406] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/36">
          <Link href="/arapp" className="hover:text-white/60 transition-colors">Store</Link>
          <span>/</span>
          <Link href={`/arapp/products/episode-${drop.episode}`} className="hover:text-white/60 transition-colors">Episode {drop.episode}</Link>
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
              {mediaKind === "model" ? (
                <button
                  type="button"
                  onClick={() => setViewMode("model")}
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    viewMode === "model"
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                  }`}
                >
                  3D View
                </button>
              ) : null}
              {mediaKind === "video" ? (
                <button
                  type="button"
                  onClick={() => setViewMode("video")}
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    viewMode === "video"
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/4 text-white/50 hover:text-white/80"
                  }`}
                >
                  Video
                </button>
              ) : null}
              <div className="ml-auto">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                  {statusLabel[drop.status]}
                </span>
              </div>
            </div>

            {/* Viewer area */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {viewMode === "image" || !hasSecondaryMedia ? (
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
              ) : viewMode === "video" && mediaKind === "video" ? (
                <video
                  src={drop.model}
                  poster={drop.image}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : viewMode === "model" && mediaKind === "model" ? (
                <ModelViewer
                  src={drop.model}
                  poster={drop.image}
                  alt={drop.title}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/52">
                  Extra media is available for this artwork, but this file type is not previewable here yet.
                </div>
              )}
            </div>

            {/* Chips / tags */}
            <div className="flex flex-wrap gap-2">
              {drop.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/52">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Info + purchase panel */}
          <div className="space-y-5">

            {/* Header */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">{drop.artist}</div>
              <h1 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{drop.title}</h1>
              <p className="mt-2 text-sm leading-6 text-white/56">{drop.subtitle}</p>
              <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{fmt.format(drop.priceUsd)}</div>
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
                <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Surface</div>
                <div className="mt-1 text-[12px] font-medium text-white/82">{drop.surface}</div>
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

            {/* Delivery */}
            <div className="flex items-center gap-2 text-[11px] text-white/44">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {drop.delivery}
            </div>

            {/* Wallet section */}
            <div className="rounded-xl border border-white/8 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Wallet</div>
                  <div className="mt-0.5 text-[12px] font-medium text-white/80">{shortAddress(address)}</div>
                  {isConnected && <div className="mt-0.5 text-[10px] text-white/36">{chain?.name || "Base"}</div>}
                </div>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/48 hover:text-white"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {!isConnected && preferred && (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => connect({ connector: preferred })}
                    disabled={isPending}
                    className="w-full rounded-xl border border-white/14 bg-white/8 px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:bg-white/12 disabled:opacity-40"
                  >
                    {isPending ? "Connecting…" : connectorLabel(preferred.id, preferred.name)}
                  </button>
                  {alternates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => connect({ connector: c })}
                      disabled={isPending}
                      className="w-full rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/48 disabled:opacity-40"
                    >
                      {connectorLabel(c.id, c.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity + CTA */}
            {canBuy && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:text-white"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleMint}
                  disabled={isPreparing}
                  className="flex-1 rounded-xl border border-white/20 bg-white py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {isPreparing
                    ? "Preparing…"
                    : drop.status === "member-access"
                    ? "Claim Access Drop"
                    : "Collect Now"}
                </button>
              </div>
            )}

            {!canBuy && (
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[11px] text-white/42">
                {drop.status === "coming-soon"
                  ? "This drop opens in the next release wave. Check back soon."
                  : "This edition is sold out and preserved as a collection reference."}
              </div>
            )}

            {status && (
              <div className="rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-[11px] leading-5 text-white/54">
                {status}
              </div>
            )}

            <Link
              href={`/arapp/products/episode-${drop.episode}`}
              className="block text-center text-[10px] uppercase tracking-[0.26em] text-white/34 hover:text-white/56"
            >
              ← Back to Episode {drop.episode}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
