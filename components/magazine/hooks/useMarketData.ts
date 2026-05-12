"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PoolEntry = {
  name: string;
  price: number;
  change24h: number | null;
  volume24h: number | null;
  address?: string;
};

export type ExchangeEntry = {
  name: string;
  price: number;
  volume24h: number | null;
  url?: string;
};

export type MarketData = {
  symbol: string;
  name: string;
  price: number;
  change24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  /** 7-day hourly prices for sparkline */
  sparkline: number[];
  pools: PoolEntry[];
  dex: ExchangeEntry[];
  cex: ExchangeEntry[];
  /** GeckoTerminal pool address for embed chart (Base tokens only) */
  poolAddress?: string;
  network?: string;
};

type CoinGeckoMarket = {
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number | null;
  total_volume?: number | null;
  market_cap?: number | null;
  sparkline_in_7d?: {
    price?: number[];
  };
};

type CoinGeckoTicker = {
  market?: {
    identifier?: string;
    name?: string;
  };
  converted_last?: {
    usd?: number;
  };
  converted_volume?: {
    usd?: number | null;
  };
  trade_url?: string | null;
};

type CoinGeckoTickersResponse = {
  tickers?: CoinGeckoTicker[];
};

type GeckoTerminalPoolAttributes = {
  name?: string;
  base_token_price_usd?: string;
  price_change_percentage?: {
    h24?: string;
  };
  volume_usd?: {
    h24?: string;
  };
};

type GeckoTerminalPoolRelationships = {
  base_token?: {
    data?: {
      id?: string;
    };
  };
};

type GeckoTerminalPool = {
  id?: string;
  attributes?: GeckoTerminalPoolAttributes;
  relationships?: GeckoTerminalPoolRelationships;
};

type GeckoTerminalTrendingPoolsResponse = {
  data?: GeckoTerminalPool[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CG = "https://api.coingecko.com/api/v3";
const GT = "https://api.geckoterminal.com/api/v2";
const MARKET_CACHE_KEY_PREFIX = "axis:market-data:v1:";
/** CoinGecko IDs for the main tab options */
export const CG_IDS: Record<string, string> = {
  bitcoin:  "bitcoin",
  ethereum: "ethereum",
  solana:   "solana",
};

/** Substrings in market identifiers that signal a DEX */
const DEX_KEYWORDS = [
  "uniswap", "sushi", "curve", "balancer", "pancake", "orca",
  "raydium", "jupiter", "serum", "aerodrome", "velodrome",
  "camelot", "trader_joe", "quickswap", "spooky", "dex",
];

function isDex(identifier: string): boolean {
  const id = identifier.toLowerCase();
  return DEX_KEYWORDS.some((k) => id.includes(k));
}

function getCacheKey(activeTab: string) {
  return `${MARKET_CACHE_KEY_PREFIX}${activeTab}`;
}

function isUsableMarketData(data: MarketData | null): data is MarketData {
  return Boolean(data && data.name && data.symbol && Number.isFinite(data.price) && data.price > 0);
}

function readCachedMarketData(activeTab: string): MarketData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getCacheKey(activeTab));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketData;
    return isUsableMarketData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedMarketData(activeTab: string, data: MarketData) {
  if (typeof window === "undefined" || !isUsableMarketData(data)) return;

  try {
    window.localStorage.setItem(getCacheKey(activeTab), JSON.stringify(data));
  } catch {
    // Ignore storage failures.
  }
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCoinGeckoMarket(cgId: string): Promise<Partial<MarketData>> {
  try {
    const marketsRes = await fetch(
      `${CG}/coins/markets?vs_currency=usd&ids=${cgId}&sparkline=true&price_change_percentage=24h`,
      { cache: "no-store" },
    );
    if (!marketsRes.ok) return {};
    const markets = (await marketsRes.json()) as CoinGeckoMarket[];
    const coin = markets[0];
    if (!coin) return {};

    return {
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h ?? null,
      volume24h: coin.total_volume ?? null,
      marketCap: coin.market_cap ?? null,
      sparkline: coin.sparkline_in_7d?.price ?? [],
    };
  } catch {
    return {};
  }
}

async function fetchCoinGeckoTickers(cgId: string): Promise<{ dex: ExchangeEntry[]; cex: ExchangeEntry[] }> {
  try {
    const res = await fetch(
      `${CG}/coins/${cgId}/tickers?order=trust_score_desc&depth=false`,
      { cache: "no-store" },
    );
    if (!res.ok) return { dex: [], cex: [] };
    const data = (await res.json()) as CoinGeckoTickersResponse;
    const tickers = data.tickers ?? [];

    const dex: ExchangeEntry[] = [];
    const cex: ExchangeEntry[] = [];

    for (const ticker of tickers) {
      const identifier = ticker.market?.identifier ?? "";
      const name = ticker.market?.name ?? identifier;
      const price = ticker.converted_last?.usd ?? 0;
      const vol = ticker.converted_volume?.usd ?? null;
      const url = ticker.trade_url ?? undefined;
      if (price <= 0) continue;

      const entry: ExchangeEntry = { name, price, volume24h: vol, url };

      if (isDex(identifier)) {
        if (dex.length < 3) dex.push(entry);
      } else {
        if (cex.length < 3) cex.push(entry);
      }
      if (dex.length >= 3 && cex.length >= 3) break;
    }

    return { dex, cex };
  } catch {
    return { dex: [], cex: [] };
  }
}

async function fetchBaseTrending(): Promise<Partial<MarketData>> {
  try {
    const res = await fetch(
      `${GT}/networks/base/trending_pools?page=1`,
      { cache: "no-store" },
    );
    if (!res.ok) return {};
    const data = (await res.json()) as GeckoTerminalTrendingPoolsResponse;
    const rawPools = data.data ?? [];

    const pools: PoolEntry[] = rawPools.slice(0, 3).map((raw) => {
      const attrs = raw.attributes;
      const name = attrs?.name ?? "Pool";
      const price = parseFloat(attrs?.base_token_price_usd ?? "0");
      const change = parseFloat(attrs?.price_change_percentage?.h24 ?? "NaN");
      const vol = parseFloat(attrs?.volume_usd?.h24 ?? "NaN");
      return {
        name,
        price,
        change24h: isNaN(change) ? null : change,
        volume24h: isNaN(vol) ? null : vol,
        address: raw.relationships?.base_token?.data?.id,
      };
    }).filter((p) => p.price > 0);

    // Top pool info for main display
    const top = rawPools[0];
    const topAttrs = top?.attributes;
    const topName = topAttrs?.name ?? "";
    const topSymbol = topName.split("/")[0]?.trim() ?? "BASE";
    const topPrice = parseFloat(topAttrs?.base_token_price_usd ?? "0");
    const topChange = parseFloat(topAttrs?.price_change_percentage?.h24 ?? "NaN");
    const topVol = parseFloat(topAttrs?.volume_usd?.h24 ?? "NaN");
    const poolAddress = top?.id?.replace(/^base_/, "") ?? undefined;

    return {
      symbol: topSymbol,
      name: topName,
      price: topPrice,
      change24h: isNaN(topChange) ? null : topChange,
      volume24h: isNaN(topVol) ? null : topVol,
      marketCap: null,
      sparkline: [],
      pools,
      dex: [],
      cex: [],
      poolAddress,
      network: "Base",
    };
  } catch {
    return {};
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketData(activeTab: string) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const cached = readCachedMarketData(activeTab);

    setData(cached);
    setLoading(!cached);

    const load = async () => {
      try {
        let nextData: MarketData | null = null;

        if (activeTab === "base") {
          const base = await fetchBaseTrending();
          nextData = {
            symbol: base.symbol ?? "BASE",
            name: base.name ?? "Base Trending",
            price: base.price ?? 0,
            change24h: base.change24h ?? null,
            volume24h: base.volume24h ?? null,
            marketCap: null,
            sparkline: [],
            pools: base.pools ?? [],
            dex: [],
            cex: [],
            poolAddress: base.poolAddress,
            network: "Base",
          };
        } else {
          const cgId = CG_IDS[activeTab] ?? activeTab;
          const [market, tickers] = await Promise.all([
            fetchCoinGeckoMarket(cgId),
            fetchCoinGeckoTickers(cgId),
          ]);
          nextData = {
            symbol: market.symbol ?? cgId.replace(/-/g, " ").slice(0, 12).toUpperCase(),
            name: market.name ?? cgId.replace(/-/g, " "),
            price: market.price ?? 0,
            change24h: market.change24h ?? null,
            volume24h: market.volume24h ?? null,
            marketCap: market.marketCap ?? null,
            sparkline: market.sparkline ?? [],
            pools: [],
            dex: tickers.dex,
            cex: tickers.cex,
          };
        }

        if (!mounted || !isUsableMarketData(nextData)) {
          if (!cached && mounted) {
            setLoading(true);
          }
          return;
        }

        setData(nextData);
        writeCachedMarketData(activeTab, nextData);
        setLoading(false);
      } catch {
        if (!mounted) return;
        const fallback = readCachedMarketData(activeTab);
        if (fallback) {
          setData(fallback);
          setLoading(false);
          return;
        }
        setLoading(true);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  return { data, loading };
}
