"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PillNav from "@/components/PillNav";
import { magazineNavItems } from "@/src/lib/navigation";
import { useMarketData } from "@/components/magazine/hooks/useMarketData";
import type { PoolEntry, ExchangeEntry } from "@/components/magazine/hooks/useMarketData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 10_000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  const hours = Math.max(0, Math.floor(diffMs / 3_600_000));
  if (hours < 1) return "updated <1h ago";
  if (hours < 48) return `updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `updated ${days}d ago`;
}

function fmtCompact(n: number | null): string {
  if (n === null || isNaN(n)) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ prices }: { prices: number[] }) {
  if (prices.length < 4) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 1000;
  const H = 72;
  const pts = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * W;
      const y = H - ((p - min) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const trend = prices[prices.length - 1] >= prices[0];
  const stroke = trend ? "#22c55e" : "#ef4444";
  const fillTop = trend ? "#22c55e" : "#ef4444";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="market-chart w-full"
      style={{ height: 72 }}
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill="url(#sg)"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Data columns ─────────────────────────────────────────────────────────────

function PoolsColumn({ pools }: { pools: PoolEntry[] }) {
  return (
    <div className="border border-white/[0.06] p-5">
      <p className="mb-4 text-[7px] uppercase tracking-[0.46em] text-white/22">Top Pools</p>
      {pools.length === 0 ? (
        <p className="text-[9px] text-white/20">No pool data</p>
      ) : (
        <div className="space-y-4">
          {pools.map((pool, i) => {
            const up = (pool.change24h ?? 0) >= 0;
            return (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-none tabular-nums text-[8px] tracking-[0.24em] text-white/16">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] leading-tight tracking-wide text-white/65">
                    {pool.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="tabular-nums text-[9px] text-white/45">
                      {fmtPrice(pool.price)}
                    </span>
                    {pool.change24h !== null && (
                      <span
                        className="market-signal text-[8px] tabular-nums"
                        style={{ color: up ? "#22c55e" : "#ef4444" }}
                      >
                        {up ? "▲" : "▼"}{Math.abs(pool.change24h).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  {pool.volume24h !== null && (
                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.24em] text-white/18">
                      Vol {fmtCompact(pool.volume24h)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExchangeColumn({
  label,
  entries,
}: {
  label: string;
  entries: ExchangeEntry[];
}) {
  return (
    <div className="border border-white/[0.06] p-5">
      <p className="mb-4 text-[7px] uppercase tracking-[0.46em] text-white/22">{label}</p>
      {entries.length === 0 ? (
        <p className="text-[9px] text-white/20">No data</p>
      ) : (
        <div className="space-y-4">
          {entries.map((ex, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex-none tabular-nums text-[8px] tracking-[0.24em] text-white/16">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                {ex.url ? (
                  <a
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[10px] leading-tight tracking-wide text-white/65 transition-colors hover:text-white/90"
                  >
                    {ex.name} ↗
                  </a>
                ) : (
                  <p className="truncate text-[10px] leading-tight tracking-wide text-white/65">
                    {ex.name}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="tabular-nums text-[9px] text-white/45">
                    {fmtPrice(ex.price)}
                  </span>
                  {ex.volume24h !== null && (
                    <span className="text-[8px] uppercase tracking-[0.22em] text-white/18">
                      {fmtCompact(ex.volume24h)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-48 bg-white/[0.04]" />
      <div className="h-20 w-full bg-white/[0.03]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "bitcoin",  label: "BTC" },
  { id: "ethereum", label: "ETH" },
  { id: "solana",   label: "SOL" },
  { id: "base",     label: "Base" },
];

// ─── Inner page (needs searchParams) ─────────────────────────────────────────

function MarketsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const active = params.get("active") ?? "bitcoin";

  const { data, updatedAt, loading } = useMarketData(active);

  const up = (data?.change24h ?? 0) >= 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Fixed nav */}
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={magazineNavItems}
          activeHref="/magazine/markets"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main className="relative z-10" style={{ paddingTop: 72, paddingBottom: 56 }}>

        {/* Back + masthead */}
        <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/magazine"
                className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/58"
              >
                ← Magazine
              </Link>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-white/18">Markets</span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              <span className="text-[7px] uppercase tracking-[0.4em] text-white/22">
                24h prices{updatedAt ? ` · ${formatRelative(updatedAt)}` : ""}
              </span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="border-b border-white/[0.05] px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-[8px] uppercase tracking-[0.5em] text-white/20">
              AXIS Hypermedia
            </p>
            <h1 className="[font-family:var(--font-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Markets
            </h1>
          </div>
        </div>

        {/* Token tabs */}
        <div className="border-b border-white/[0.06] px-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl gap-0">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.replace(`/magazine/markets?active=${tab.id}`)}
                  className={`relative border-r border-white/[0.06] px-5 py-3.5 text-[8px] uppercase tracking-[0.38em] transition-colors ${
                    isActive
                      ? "text-white/85"
                      : "text-white/26 hover:text-white/50"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-6xl">

            {loading || !data ? (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/24">
                  Loading market
                </p>
                <Skeleton />
              </div>
            ) : (
              <div className="space-y-6">

                {/* ── Price hero ─────────────────────────────────────────── */}
                <div className="border border-white/[0.06] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="mb-2 text-[8px] uppercase tracking-[0.44em] text-white/22">
                        {data.name}
                        {data.network && (
                          <span className="ml-3 border border-white/10 px-1.5 py-px text-[7px]">
                            {data.network}
                          </span>
                        )}
                      </p>
                      <div className="flex items-baseline gap-4">
                        <span className="[font-family:var(--font-display)] text-[clamp(1.8rem,5vw,3rem)] leading-none tracking-tight text-white">
                          {fmtPrice(data.price)}
                        </span>
                        {data.change24h !== null && (
                          <span
                            className="market-signal text-sm tabular-nums"
                            style={{ color: up ? "#22c55e" : "#ef4444" }}
                          >
                            {up ? "▲" : "▼"} {Math.abs(data.change24h).toFixed(2)}%
                            <span className="ml-1 text-[8px] uppercase tracking-[0.28em] opacity-60">24h</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-8">
                      {data.volume24h !== null && (
                        <div>
                          <p className="text-[7px] uppercase tracking-[0.4em] text-white/20">24h Volume</p>
                          <p className="mt-1 tabular-nums text-xs text-white/55">{fmtCompact(data.volume24h)}</p>
                        </div>
                      )}
                      {data.marketCap !== null && (
                        <div>
                          <p className="text-[7px] uppercase tracking-[0.4em] text-white/20">Market Cap</p>
                          <p className="mt-1 tabular-nums text-xs text-white/55">{fmtCompact(data.marketCap)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sparkline */}
                  {data.sparkline.length > 4 && (
                    <div className="mt-5 border-t border-white/[0.05] pt-4">
                      <p className="mb-2 text-[7px] uppercase tracking-[0.38em] text-white/18">7d Price</p>
                      <Sparkline prices={data.sparkline} />
                    </div>
                  )}

                  {/* GeckoTerminal embed for Base pools */}
                  {data.poolAddress && (
                    <div className="mt-5 border-t border-white/[0.05] pt-4">
                      <p className="mb-2 text-[7px] uppercase tracking-[0.38em] text-white/18">
                        Pool Chart · Base
                      </p>
                      <div className="overflow-hidden border border-white/[0.04]" style={{ height: 320 }}>
                        <iframe
                          src={`https://www.geckoterminal.com/base/pools/${data.poolAddress}?embed=1&info=0&swaps=0&theme=dark`}
                          width="100%"
                          height="320"
                          frameBorder="0"
                          allow="clipboard-write"
                          title="Pool chart"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Data columns ───────────────────────────────────────── */}
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-${
                  active === "base" ? "1" : "3"
                }`}>
                  {data.pools.length > 0 && <PoolsColumn pools={data.pools} />}
                  {data.dex.length > 0 && <ExchangeColumn label="DEX" entries={data.dex} />}
                  {data.cex.length > 0 && <ExchangeColumn label="CEX" entries={data.cex} />}
                </div>

                {/* Footer note */}
                <p className="text-[7px] uppercase tracking-[0.34em] text-white/12">
                  Data: CoinGecko · GeckoTerminal · Updates on page load
                </p>

              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}

// ─── Page (Suspense wrapper required for useSearchParams) ─────────────────────

export default function MarketsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black" />
      }
    >
      <MarketsInner />
    </Suspense>
  );
}

