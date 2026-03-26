"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCryptoPrices } from "@/components/magazine/hooks/useCryptoPrices";

const TICKER_PIXELS_PER_SECOND = 200;

function fmtPrice(n: number): string {
  if (n >= 10_000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
}

export default function GlobalTicker() {
  const { prices, loading } = useCryptoPrices();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const offsetRef = useRef(0);
  const [shouldLoop, setShouldLoop] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const introReady = true;
  const [isHovered, setIsHovered] = useState(false);

  const items = useMemo(
    () =>
      prices.map((token) => {
        const up = (token.change24h ?? 0) >= 0;
        return (
          <Link
            key={token.id}
            href={token.href}
            className="mx-4 inline-flex items-baseline gap-2 whitespace-nowrap transition-opacity hover:opacity-80"
          >
            <span className="text-[7px] uppercase tracking-[0.3em] text-white/26">#{token.rank}</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-white/48">{token.symbol}</span>
            <span className="text-[8px] tabular-nums tracking-wide text-white/68">{fmtPrice(token.price)}</span>
            {token.change24h !== null ? (
              <span className={`text-[7px] tabular-nums ${up ? "text-white/74" : "text-white/48"}`}>
                {up ? "+" : "-"}{Math.abs(token.change24h).toFixed(2)}%
              </span>
            ) : null}
          </Link>
        );
      }),
    [prices],
  );


  useEffect(() => {
    const updateLoopState = () => {
      const nextContentWidth = contentRef.current?.scrollWidth ?? 0;
      setContentWidth(nextContentWidth);
      setShouldLoop(nextContentWidth > 0);
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

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !shouldLoop || contentWidth <= 0) {
      if (track) {
        track.style.transform = "translate3d(0, 0, 0)";
      }
      offsetRef.current = 0;
      return;
    }

    let frameId = 0;
    let lastTs: number | null = null;

    const tick = (ts: number) => {
      if (lastTs === null) {
        lastTs = ts;
      }

      const deltaSeconds = (ts - lastTs) / 1000;
      lastTs = ts;
      if (!isHoveredRef.current) {
        offsetRef.current = (offsetRef.current + TICKER_PIXELS_PER_SECOND * deltaSeconds) % contentWidth;
      }
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      frameId = window.requestAnimationFrame(tick);
    };

    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldLoop, contentWidth]);

  if (!introReady) {
    return null;
  }

  if (!loading && prices.length === 0) {
    return null;
  }

  if (prices.length === 0) {
    return null;
  }

  return (
    <div className="global-ticker">
      <div
        ref={containerRef}
        className="relative min-w-0 flex-1 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={trackRef}
          className="flex items-center whitespace-nowrap will-change-transform"
        >
          <div ref={contentRef} className="flex items-center pr-8">
            {items}
          </div>
          {shouldLoop ? (
            <div className="flex items-center pr-8" aria-hidden="true">
              {items}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
