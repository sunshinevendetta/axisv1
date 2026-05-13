"use client";

import { useEffect, useState } from "react";

export type CryptoPrice = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number | null;
  rank: number;
  network?: string;
  /** Link to the markets page for this token */
  href: string;
};

type CachedPrices = {
  updatedAt: number;
  prices: CryptoPrice[];
};

type Snapshot = {
  updatedAt: string;
  payload: CryptoPrice[];
};

const CACHE_KEY = "axis:crypto-prices:v4";
const SNAPSHOT_URL = "/data/markets/top100.json";

async function fetchPrices(): Promise<CryptoPrice[]> {
  const response = await fetch(SNAPSHOT_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Snapshot request failed with ${response.status}`);
  }
  const snapshot = (await response.json()) as Snapshot;
  return Array.isArray(snapshot.payload) ? snapshot.payload : [];
}

function readCache(): CachedPrices | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPrices;
    if (!Array.isArray(parsed.prices)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(prices: CryptoPrice[]) {
  if (typeof window === "undefined" || prices.length === 0) return;
  try {
    const payload: CachedPrices = { updatedAt: Date.now(), prices };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures; the static snapshot still wins.
  }
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const cached = readCache();
    if (cached && cached.prices.length > 0) {
      setPrices(cached.prices);
      setLoading(false);
    }

    fetchPrices()
      .then((nextPrices) => {
        if (!mounted || nextPrices.length === 0) return;
        setPrices(nextPrices);
        writeCache(nextPrices);
      })
      .catch(() => {
        if (!mounted) return;
        const fallbackPrices = readCache()?.prices ?? [];
        if (fallbackPrices.length > 0) setPrices(fallbackPrices);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  return { prices, loading };
}
