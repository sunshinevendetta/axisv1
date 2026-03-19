"use client";

import type { MagazineArticle } from "./types";
import type { CryptoPrice } from "./hooks/useCryptoPrices";

function fmt(n: number): string {
  if (n >= 10_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)      return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 5 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type Props = {
  articles: MagazineArticle[];
  prices: CryptoPrice[];
  pricesLoading: boolean;
  onOpenArticle: (slug: string) => void;
  onCategoryChange: (cat: string | null) => void;
};

const CATEGORIES = [
  "INTERVIEW",
  "NEWS",
  "ESSAY",
  "CULTURE",
  "TECHNOLOGY",
  "EVENT",
];

export default function MagazineSidebar({
  articles,
  prices,
  pricesLoading,
  onOpenArticle,
  onCategoryChange,
}: Props) {

  // Trending = latest 4 articles by date
  const trending = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // All unique tags
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags)),
  ).slice(0, 18);

  // Category counts
  const categoryCounts = CATEGORIES.map((cat) => ({
    cat,
    count: articles.filter((a) => a.category === cat).length,
  }));

  return (
    <aside className="space-y-0 divide-y divide-white/6">

      {/* ── Trending ───────────────────────────────────────────────── */}
      <div className="pb-8">
        <p className="mb-5 text-[8px] uppercase tracking-[0.48em] text-white/24">
          Trending
        </p>
        <div className="space-y-5">
          {trending.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onOpenArticle(a.slug)}
              className="group flex w-full gap-4 text-left"
            >
              <span className="flex-none tabular-nums text-[10px] text-white/16 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-[8px] uppercase tracking-[0.36em] text-white/22 mb-1.5">
                  {a.category}
                </p>
                <p className="text-xs leading-[1.4] tracking-wide text-white/55 transition-colors group-hover:text-white/78 line-clamp-2">
                  {a.title}
                </p>
                <p className="mt-1.5 text-[8px] uppercase tracking-[0.28em] text-white/18">
                  {formatDate(a.date)} · {a.readTime}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Markets ───────────────────────────────────────────── */}
      <div className="py-8">
        <div className="mb-5 flex items-center gap-2">
          <p className="text-[8px] uppercase tracking-[0.48em] text-white/24">
            Live Markets
          </p>
          <span className="h-1 w-1 rounded-full bg-white/30 animate-pulse" />
        </div>

        {pricesLoading ? (
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/18">
            Fetching prices…
          </p>
        ) : prices.length === 0 ? (
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/18">
            Unavailable
          </p>
        ) : (
          <div className="space-y-3">
            {prices.map((p) => {
              const up = (p.change24h ?? 0) >= 0;
              return (
                <div key={p.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.34em] text-white/42">
                      {p.symbol}
                    </span>
                    {p.network && (
                      <span className="border border-white/10 px-1 py-px text-[7px] uppercase tracking-[0.26em] text-white/18">
                        {p.network}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="tabular-nums text-[9px] tracking-wide text-white/56">
                      ${fmt(p.price)}
                    </span>
                    {p.change24h !== null && (
                      <span
                        className={`tabular-nums text-[8px] tracking-wide ${
                          up ? "text-[#6ee7a0]/65" : "text-[#f87171]/60"
                        }`}
                      >
                        {up ? "▲" : "▼"} {Math.abs(p.change24h).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[7px] uppercase tracking-[0.3em] text-white/14">
          Via CoinGecko · GeckoTerminal · Updates every 60s
        </p>
      </div>

      {/* ── Browse by Category ─────────────────────────────────────── */}
      <div className="py-8">
        <p className="mb-5 text-[8px] uppercase tracking-[0.48em] text-white/24">
          Browse
        </p>
        <div className="space-y-2">
          {categoryCounts.map(({ cat, count }) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className="group flex w-full items-center justify-between"
            >
              <span className="text-[9px] uppercase tracking-[0.36em] text-white/36 transition-colors group-hover:text-white/62">
                {cat}
              </span>
              <span className="tabular-nums text-[8px] text-white/18">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tags ───────────────────────────────────────────────────── */}
      <div className="py-8">
        <p className="mb-5 text-[8px] uppercase tracking-[0.48em] text-white/24">
          Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <span
              key={tag}
              className="border border-white/8 px-2 py-0.5 text-[8px] uppercase tracking-[0.22em] text-white/24"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── About ──────────────────────────────────────────────────── */}
      <div className="py-8">
        <p className="mb-4 text-[8px] uppercase tracking-[0.48em] text-white/24">
          About
        </p>
        <p className="text-xs leading-5 tracking-wide text-white/36">
          Spectra Journal is the editorial arm of SPECTRA — a platform for digital
          culture, music, and technology at the edge of what's possible.
        </p>
        <div className="mt-5 space-y-2">
          <a
            href="/#about"
            className="block text-[9px] uppercase tracking-[0.36em] text-white/24 transition-colors hover:text-white/50"
          >
            About SPECTRA →
          </a>
          <a
            href="/#episodes"
            className="block text-[9px] uppercase tracking-[0.36em] text-white/24 transition-colors hover:text-white/50"
          >
            Episodes →
          </a>
          <a
            href="/magazine/mixtapes"
            className="block text-[9px] uppercase tracking-[0.36em] text-white/24 transition-colors hover:text-white/50"
          >
            Mixtapes →
          </a>
        </div>
      </div>

    </aside>
  );
}
