import { NextResponse } from "next/server";

type OkxCandle = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

type OkxTrade = {
  px?: string;
  sz?: string;
  side?: string;
  ts?: string;
  tradeId?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const candlesUrl = new URL("https://www.okx.com/api/v5/market/candles");
  candlesUrl.searchParams.set("instId", "BTC-USDT");
  candlesUrl.searchParams.set("bar", "1m");
  candlesUrl.searchParams.set("limit", "96");

  const tradesUrl = new URL("https://www.okx.com/api/v5/market/trades");
  tradesUrl.searchParams.set("instId", "BTC-USDT");
  tradesUrl.searchParams.set("limit", "100");

  try {
    const [candlesResponse, tradesResponse] = await Promise.all([
      fetch(candlesUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
      fetch(tradesUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
    ]);

    if (!candlesResponse.ok) {
      return NextResponse.json({ error: "market_fetch_failed" }, { status: 502 });
    }

    const candlePayload = (await candlesResponse.json()) as { code?: string; data?: OkxCandle[] };
    const candles = (candlePayload.data ?? [])
      .map((row) => ({
        t: Number(row[0]),
        o: Number(row[1]),
        h: Number(row[2]),
        l: Number(row[3]),
        c: Number(row[4]),
        v: Number(row[5]),
      }))
      .filter((row) => Number.isFinite(row.t + row.o + row.h + row.l + row.c + row.v))
      .sort((a, b) => a.t - b.t);

    const tradePayload = tradesResponse.ok
      ? ((await tradesResponse.json()) as { code?: string; data?: OkxTrade[] })
      : { data: [] };
    const trades = (tradePayload.data ?? [])
      .map((row) => ({
        t: Number(row.ts),
        px: Number(row.px),
        sz: Number(row.sz),
        side: row.side === "sell" ? "sell" : "buy",
        id: row.tradeId ?? "",
      }))
      .filter((row) => Number.isFinite(row.t + row.px + row.sz))
      .sort((a, b) => a.t - b.t);

    return NextResponse.json(
      { source: "okx", instrument: "BTC-USDT", candles, trades },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "market_fetch_failed" }, { status: 502 });
  }
}
