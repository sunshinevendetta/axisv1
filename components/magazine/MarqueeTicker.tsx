"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCryptoPrices } from "./hooks/useCryptoPrices";
import type { MagazineArticle } from "./types";

function fmt(n: number): string {
  if (n >= 10_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

type Props = {
  articles: MagazineArticle[];
};

export default function MarqueeTicker({ articles }: Props) {
  const { prices, loading } = useCryptoPrices();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldLoop, setShouldLoop] = useState(false);

  const items = useMemo(() => {
    const out: React.ReactNode[] = [];

    // ── Markets section ───────────────────────────────────────────────
    out.push(
      <span key="markets-label" className="mx-6 text-[7px] uppercase tracking-[0.44em] text-white/22">
        Markets
      </span>,
    );

    if (loading) {
      out.push(
        <span key="loading" className="mx-4 text-[8px] uppercase tracking-[0.28em] text-white/22">
          loading…
        </span>,
      );
    } else {
      prices.forEach((p, i) => {
        const up = (p.change24h ?? 0) >= 0;
        out.push(
          <Link
            key={`price-${i}`}
            href={p.href}
            className="mx-4 inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-75"
          >
            <span className="text-[8px] uppercase tracking-[0.32em] text-white/36">{p.symbol}</span>
            <span className="text-[8px] tabular-nums tracking-wide text-white/60">${fmt(p.price)}</span>
            {p.change24h !== null && (
              <span className={`text-[7px] tabular-nums ${up ? "text-[#6ee7a0]/70" : "text-[#f87171]/65"}`}>
                {up ? "▲" : "▼"}{Math.abs(p.change24h).toFixed(2)}%
              </span>
            )}
            {p.network && (
              <span className="text-[6px] uppercase tracking-[0.3em] text-white/16">{p.network}</span>
            )}
          </Link>,
        );

        if (i < prices.length - 1) {
          out.push(
            <span key={`dot-${i}`} className="text-white/10 text-[8px]">·</span>,
          );
        }
      });
    }

    // ── Separator ─────────────────────────────────────────────────────
    out.push(
      <span key="sep" className="mx-8 text-white/10 text-[9px] tracking-widest">‖</span>,
    );

    // ── Latest section ────────────────────────────────────────────────
    out.push(
      <span key="latest-label" className="mx-6 text-[7px] uppercase tracking-[0.44em] text-white/22">
        Latest
      </span>,
    );

    articles.slice(0, 6).forEach((a, i) => {
      out.push(
        <span key={`news-${i}`} className="mx-4 inline-flex items-baseline gap-2.5">
          <span className="text-[7px] uppercase tracking-[0.30em] text-white/20">{a.category}</span>
          <span className="text-[8px] tracking-wide text-white/45">{a.title}</span>
        </span>,
      );
      if (i < Math.min(articles.length, 6) - 1) {
        out.push(
          <span key={`news-dot-${i}`} className="text-white/10 text-[8px]">·</span>,
        );
      }
    });

    out.push(<span key="trail" className="mx-8" />);

    return out;
  }, [prices, loading, articles]);

  useEffect(() => {
    const updateLoopState = () => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const contentWidth = contentRef.current?.scrollWidth ?? 0;
      setShouldLoop(contentWidth > containerWidth);
    };

    updateLoopState();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", updateLoopState);
      return () => window.removeEventListener("resize", updateLoopState);
    }

    const observer = new ResizeObserver(updateLoopState);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex h-8 items-center overflow-hidden border-t border-white/[0.07] bg-black/96"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Static left — label + markets link */}
      <div className="flex-none border-r border-white/[0.07] px-4">
        <Link
          href="/magazine/markets"
          className="text-[7px] uppercase tracking-[0.46em] text-white/20 whitespace-nowrap transition-colors hover:text-white/42"
        >
          Markets
        </Link>
      </div>

      {/* Scrolling track — duplicated for seamless loop */}
      <div ref={containerRef} className="relative min-w-0 flex-1 overflow-hidden">
        <div className={shouldLoop ? "ticker-track--loop flex items-center whitespace-nowrap" : "flex items-center whitespace-nowrap"}>
          <div ref={contentRef} className="flex items-center">{items}</div>
          {shouldLoop ? <div className="flex items-center" aria-hidden="true">{items}</div> : null}
        </div>
      </div>

      {/* Static right — red blink live indicator */}
      <div className="flex-none border-l border-white/[0.07] px-4">
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-red-500"
            style={{ animation: "live-blink 1s step-start infinite" }}
          />
          <span className="text-[7px] uppercase tracking-[0.4em] text-white/22">Live</span>
        </span>
      </div>
    </div>
  );
}
