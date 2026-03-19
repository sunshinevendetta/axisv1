"use client";

import { useEffect, useState } from "react";

export type CryptoPrice = {
  symbol: string;
  name: string;
  price: number;
  change24h: number | null;
  network?: string;
  /** Link to the markets page for this token */
  href: string;
};

const CG_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

const GT_BASE_URL =
  "https://api.geckoterminal.com/api/v2/networks/base/trending_pools?page=1";

async function fetchPrices(): Promise<CryptoPrice[]> {
  const [cgResult, gtResult] = await Promise.allSettled([
    fetch(CG_URL, { cache: "no-store" }),
    fetch(GT_BASE_URL, { cache: "no-store" }),
  ]);

  const prices: CryptoPrice[] = [];

  // CoinGecko — BTC / ETH / SOL
  if (cgResult.status === "fulfilled" && cgResult.value.ok) {
    const d = await cgResult.value.json();
    const map: [string, string, string, string][] = [
      ["bitcoin",  "BTC", "Bitcoin",  "/magazine/markets?active=bitcoin"],
      ["ethereum", "ETH", "Ethereum", "/magazine/markets?active=ethereum"],
      ["solana",   "SOL", "Solana",   "/magazine/markets?active=solana"],
    ];
    for (const [id, symbol, name, href] of map) {
      if (d[id]) {
        prices.push({
          symbol,
          name,
          price: d[id].usd,
          change24h: d[id].usd_24h_change ?? null,
          href,
        });
      }
    }
  }

  // GeckoTerminal — Base chain trending (top 2)
  if (gtResult.status === "fulfilled" && gtResult.value.ok) {
    const d = await gtResult.value.json();
    const pools: unknown[] = d.data?.slice(0, 2) ?? [];
    for (const pool of pools) {
      const p = pool as Record<string, unknown>;
      const attrs = p.attributes as Record<string, unknown> | undefined;
      if (!attrs) continue;
      const name = attrs.name as string | undefined;
      const symbol = name?.split("/")[0]?.trim();
      const price = parseFloat((attrs.base_token_price_usd as string) ?? "0");
      const pcp = attrs.price_change_percentage as Record<string, string> | undefined;
      const change = parseFloat(pcp?.h24 ?? "NaN");
      if (symbol && price > 0) {
        prices.push({
          symbol,
          name: name ?? symbol,
          price,
          change24h: isNaN(change) ? null : change,
          network: "Base",
          href: "/magazine/markets?active=base",
        });
      }
    }
  }

  return prices;
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = () =>
      fetchPrices()
        .then((p) => { if (mounted && p.length > 0) setPrices(p); })
        .catch(() => {})
        .finally(() => { if (mounted) setLoading(false); });

    load();
    const id = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return { prices, loading };
}
