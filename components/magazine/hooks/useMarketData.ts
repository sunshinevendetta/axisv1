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

type Snapshot = {
  updatedAt: string;
  payload: MarketData;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MARKET_CACHE_KEY_PREFIX = "axis:market-data:v2:";

/** CoinGecko IDs for the main tab options — kept for legacy callers */
export const CG_IDS: Record<string, string> = {
  bitcoin:  "bitcoin",
  ethereum: "ethereum",
  solana:   "solana",
};

const SNAPSHOT_TABS = new Set(["bitcoin", "ethereum", "solana", "base"]);

function snapshotUrlFor(activeTab: string): string {
  const id = SNAPSHOT_TABS.has(activeTab) ? activeTab : "bitcoin";
  return `/data/markets/${id}.json`;
}

function getCacheKey(activeTab: string) {
  return `${MARKET_CACHE_KEY_PREFIX}${activeTab}`;
}

function isUsableMarketData(data: MarketData | null): data is MarketData {
  return Boolean(data && data.name && data.symbol && Number.isFinite(data.price) && data.price > 0);
}

type CachedEntry = { updatedAt: string; data: MarketData };

function readCachedMarketData(activeTab: string): CachedEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getCacheKey(activeTab));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    return isUsableMarketData(parsed.data) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedMarketData(activeTab: string, entry: CachedEntry) {
  if (typeof window === "undefined" || !isUsableMarketData(entry.data)) return;
  try {
    window.localStorage.setItem(getCacheKey(activeTab), JSON.stringify(entry));
  } catch {
    // Ignore storage failures.
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketData(activeTab: string) {
  const [data, setData] = useState<MarketData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const cached = readCachedMarketData(activeTab);

    setData(cached?.data ?? null);
    setUpdatedAt(cached?.updatedAt ?? null);
    setLoading(!cached);

    const load = async () => {
      try {
        const res = await fetch(snapshotUrlFor(activeTab), { cache: "no-store" });
        if (!res.ok) throw new Error(`snapshot ${res.status}`);
        const snapshot = (await res.json()) as Snapshot;
        const next = snapshot.payload;

        if (!mounted || !isUsableMarketData(next)) {
          if (!cached && mounted) setLoading(true);
          return;
        }

        setData(next);
        setUpdatedAt(snapshot.updatedAt);
        writeCachedMarketData(activeTab, { updatedAt: snapshot.updatedAt, data: next });
        setLoading(false);
      } catch {
        if (!mounted) return;
        const fallback = readCachedMarketData(activeTab);
        if (fallback) {
          setData(fallback.data);
          setUpdatedAt(fallback.updatedAt);
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

  return { data, updatedAt, loading };
}
