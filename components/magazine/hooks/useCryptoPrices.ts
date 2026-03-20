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

type CoinGeckoMarket = {
  id?: string;
  symbol?: string;
  name?: string;
  current_price?: number;
  price_change_percentage_24h?: number | null;
  market_cap_rank?: number | null;
};

const CACHE_KEY = "spectra:crypto-prices:v2";
const REFRESH_MS = 60_000;
const CG_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h";

function dedupeAndNormalize(markets: CoinGeckoMarket[]): CryptoPrice[] {
  const seenSymbols = new Set<string>();
  const prices: CryptoPrice[] = [];

  for (const market of markets) {
    const id = market.id?.trim();
    const symbol = market.symbol?.trim().toUpperCase();
    const name = market.name?.trim();
    const price = market.current_price;
    const rank = market.market_cap_rank;

    if (!id || !symbol || !name) continue;
    if (seenSymbols.has(symbol)) continue;
    if (!Number.isFinite(price) || (price ?? 0) <= 0) continue;
    if (!Number.isFinite(rank) || (rank ?? 0) <= 0) continue;

    seenSymbols.add(symbol);
    prices.push({
      id,
      symbol,
      name,
      price: price as number,
      change24h:
        typeof market.price_change_percentage_24h === "number"
          ? market.price_change_percentage_24h
          : null,
      rank: rank as number,
      href: `/magazine/markets?active=${id}`,
    });

    if (prices.length === 100) {
      break;
    }
  }

  return prices;
}

async function fetchPrices(): Promise<CryptoPrice[]> {
  const response = await fetch(CG_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`CoinGecko request failed with ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoMarket[];
  return dedupeAndNormalize(data);
}

function readCache(): CryptoPrice[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CachedPrices;
    return Array.isArray(parsed.prices) ? parsed.prices : [];
  } catch {
    return [];
  }
}

function writeCache(prices: CryptoPrice[]) {
  if (typeof window === "undefined" || prices.length === 0) return;

  try {
    const payload: CachedPrices = {
      updatedAt: Date.now(),
      prices,
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures; live data still wins.
  }
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const cached = readCache();
    if (cached.length > 0) {
      setPrices(cached);
      setLoading(false);
    }

    const load = () =>
      fetchPrices()
        .then((nextPrices) => {
          if (!mounted || nextPrices.length === 0) return;
          setPrices(nextPrices);
          writeCache(nextPrices);
        })
        .catch(() => {
          if (!mounted) return;
          const fallbackPrices = readCache();
          if (fallbackPrices.length > 0) {
            setPrices(fallbackPrices);
          }
        })
        .finally(() => { if (mounted) setLoading(false); });

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return { prices, loading };
}
