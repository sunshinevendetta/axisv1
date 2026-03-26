"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { arappCollection, arappDrops, type ARAppDrop, type ARAppDropStatus } from "@/src/lib/arapp-catalog";

type CartState = Record<string, number>;
type FilterKey = "all" | "live" | "member-access" | "coming-soon" | "sold-out";

const statusLabel: Record<ARAppDropStatus, string> = {
  live: "Live",
  "member-access": "Members",
  "coming-soon": "Soon",
  "sold-out": "Sold Out",
};

const statusTone: Record<ARAppDropStatus, string> = {
  live: "border-white/20 bg-white/10 text-white/82",
  "member-access": "border-white/16 bg-white/8 text-white/74",
  "coming-soon": "border-white/14 bg-white/7 text-white/66",
  "sold-out": "border-white/12 bg-white/6 text-white/42",
};

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "member-access", label: "Members" },
  { key: "coming-soon", label: "Soon" },
  { key: "sold-out", label: "Sold Out" },
];

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

function isCollectible(drop: ARAppDrop) {
  return drop.status === "live" || drop.status === "member-access";
}

export default function ARAppMarketplace() {
  const [cart, setCart] = useState<CartState>({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [checkoutMessage, setCheckoutMessage] = useState<string>(arappCollection.launchWindow);
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { address, chain, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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

  const cartItems = useMemo(
    () =>
      arappDrops
        .filter((d) => (cart[d.id] ?? 0) > 0)
        .map((d) => ({ drop: d, quantity: cart[d.id], lineTotal: d.priceUsd * cart[d.id] })),
    [cart],
  );

  const lineItemCount = useMemo(() => cartItems.reduce((n, i) => n + i.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((n, i) => n + i.lineTotal, 0), [cartItems]);

  function updateQty(drop: ARAppDrop, delta: number) {
    if (!isCollectible(drop)) return;
    setCart((cur) => {
      const next = Math.max(0, (cur[drop.id] ?? 0) + delta);
      if (next === 0) {
        const { [drop.id]: _, ...rest } = cur;
        return rest;
      }
      return { ...cur, [drop.id]: next };
    });
  }

  async function handleCheckout() {
    if (!cartItems.length) {
      setCheckoutMessage("Add at least one live drop to prepare the order.");
      return;
    }
    setIsPreparingOrder(true);
    try {
      const res = await fetch("/api/arapp/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address || null,
          items: cartItems.map(({ drop, quantity }) => ({ id: drop.id, quantity })),
        }),
      });
      const data = (await res.json()) as {
        previewMode?: boolean; message?: string; checkoutUrl?: string; orderReference?: string; error?: string;
      };
      if (!res.ok) { setCheckoutMessage(data.error || "Order failed."); return; }
      if (data.checkoutUrl) {
        setCheckoutMessage(`Order reference: ${data.orderReference}`);
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
        return;
      }
      setCheckoutMessage(data.message || `Preview order prepared. Ref: ${data.orderReference}`);
    } catch {
      setCheckoutMessage("Commerce handoff unavailable. Storefront preview is active.");
    } finally {
      setIsPreparingOrder(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040406] text-white">

      {/* Store header */}
      <div className="border-b border-white/8 bg-[#040406]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-3 pt-24 sm:px-6 sm:pt-28">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/36">{arappCollection.season}</div>
            <h1 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">{arappCollection.title}</h1>
          </div>
          <div className="hidden gap-6 sm:flex">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Releases</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappDrops.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Available</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappDrops.filter((d) => d.status === "live").length}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/36">Units</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{arappDrops.reduce((n, d) => n + d.remaining, 0)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(!cartOpen)}
            className="flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/78 transition-colors hover:border-white/24 hover:text-white"
          >
            Cart
            {lineItemCount > 0 && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
                {lineItemCount}
              </span>
            )}
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
                No drops match this filter.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDrops.map((drop) => {
                  const qty = cart[drop.id] ?? 0;
                  const canBuy = isCollectible(drop);
                  return (
                    <article
                      key={drop.id}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/18"
                    >
                      {/* Image */}
                      <Link href={`/arapp/products/${drop.id}`} className="relative block aspect-[4/5] overflow-hidden bg-black/40">
                        <Image
                          src={drop.image}
                          alt={drop.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <span className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${statusTone[drop.status]}`}>
                            {statusLabel[drop.status]}
                          </span>
                        </div>
                        {drop.remaining > 0 && drop.remaining < 100 && (
                          <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.2em] text-white/60">
                            {drop.remaining} left
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="p-4">
                        <div className="text-[9px] uppercase tracking-[0.28em] text-white/38">{drop.artist}</div>
                        <Link href={`/arapp/products/${drop.id}`}>
                          <h3 className="mt-1 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white hover:text-white/80">
                            {drop.title}
                          </h3>
                        </Link>
                        <div className="mt-1 text-[11px] text-white/46">{drop.edition}</div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold tracking-[-0.02em] text-white">{fmt.format(drop.priceUsd)}</span>
                          <Link
                            href={`/arapp/products/${drop.id}`}
                            className="text-[10px] uppercase tracking-[0.2em] text-white/44 hover:text-white/70"
                          >
                            Details →
                          </Link>
                        </div>

                        <div className="mt-3">
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => updateQty(drop, 1)}
                              disabled={!canBuy}
                              className={`w-full rounded-xl py-2.5 text-[10px] uppercase tracking-[0.26em] transition-colors ${
                                canBuy
                                  ? "border border-white/16 bg-white text-black hover:bg-white/90"
                                  : "border border-white/8 bg-white/4 text-white/28"
                              }`}
                            >
                              {drop.status === "sold-out" ? "Sold Out" : drop.status === "coming-soon" ? "Coming Soon" : "Add to Cart"}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQty(drop, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/6 text-sm text-white/70 hover:bg-white/10"
                              >
                                −
                              </button>
                              <div className="flex-1 rounded-xl border border-white/10 py-1.5 text-center text-sm font-semibold text-white">
                                {qty}
                              </div>
                              <button
                                type="button"
                                onClick={() => updateQty(drop, 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white text-sm text-black hover:bg-white/90"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart panel — always visible on xl, toggled on smaller screens */}
          <aside
            className={`xl:sticky xl:top-24 xl:block xl:w-80 xl:shrink-0 xl:self-start ${
              cartOpen ? "fixed inset-y-0 right-0 z-40 w-80 overflow-y-auto bg-[#040406] px-4 py-6 xl:relative xl:inset-auto xl:z-auto xl:px-0 xl:py-0" : "hidden xl:block"
            }`}
          >
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/38">Collector Cart</div>
                  <h2 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white">
                    {lineItemCount > 0 ? `${lineItemCount} item${lineItemCount !== 1 ? "s" : ""}` : "Empty"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="xl:hidden text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Wallet */}
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.26em] text-white/36">Wallet</div>
                    <div className="mt-0.5 text-[12px] font-medium text-white/84">
                      {isConnected ? shortAddress(address) : "Not connected"}
                    </div>
                    {isConnected && (
                      <div className="mt-0.5 text-[10px] text-white/40">{chain?.name || "Base"}</div>
                    )}
                  </div>
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/54 hover:text-white"
                    >
                      Disconnect
                    </button>
                  ) : null}
                </div>

                {!isConnected && preferredConnector && (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => connect({ connector: preferredConnector })}
                      disabled={isPending}
                      className="w-full rounded-xl border border-white/16 bg-white px-3 py-2.5 text-[10px] uppercase tracking-[0.24em] text-black disabled:opacity-40"
                    >
                      {isPending ? "Connecting…" : connectorLabel(preferredConnector.id, preferredConnector.name)}
                    </button>
                    {alternateConnectors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => connect({ connector: c })}
                        disabled={isPending}
                        className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/56 disabled:opacity-40"
                      >
                        {connectorLabel(c.id, c.name)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Line items */}
              <div className="space-y-2">
                {cartItems.length ? (
                  cartItems.map(({ drop, quantity, lineTotal }) => (
                    <div key={drop.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-black/20 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium text-white">{drop.title}</div>
                        <div className="mt-0.5 text-[10px] text-white/44">{quantity} × {fmt.format(drop.priceUsd)}</div>
                      </div>
                      <div className="shrink-0 text-[12px] font-semibold text-white">{fmt.format(lineTotal)}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-[11px] leading-5 text-white/36">
                    Add drops to get started.
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>Subtotal</span>
                  <span>{fmt.format(subtotal)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-white/32">
                  <span>Mode</span>
                  <span>Preview</span>
                </div>
                <div className="mt-2 border-t border-white/8 pt-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.24em] text-white/40">Total</span>
                  <span className="text-base font-semibold tracking-[-0.03em] text-white">{fmt.format(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!cartItems.length || isPreparingOrder}
                className="w-full rounded-xl border border-white/18 bg-white py-3 text-[10px] uppercase tracking-[0.28em] text-black transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                {isPreparingOrder ? "Preparing…" : "Checkout"}
              </button>

              <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-white/48">
                {checkoutMessage}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile cart overlay backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 xl:hidden"
          onClick={() => setCartOpen(false)}
        />
      )}
    </main>
  );
}
