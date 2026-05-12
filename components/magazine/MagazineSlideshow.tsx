"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { MagazineArticle } from "./types";

const SLIDE_DURATION = 6000;

const CATEGORY_BG: Record<string, string> = {
  INTERVIEW:  "radial-gradient(ellipse at 25% 70%, #0d1020 0%, #000 65%)",
  NEWS:       "radial-gradient(ellipse at 70% 30%, #0f0f0f 0%, #000 65%)",
  ESSAY:      "radial-gradient(ellipse at 50% 80%, #100d08 0%, #000 65%)",
  CULTURE:    "radial-gradient(ellipse at 20% 50%, #07101a 0%, #000 65%)",
  TECHNOLOGY: "radial-gradient(ellipse at 80% 40%, #07091c 0%, #000 65%)",
  EVENT:      "radial-gradient(ellipse at 40% 65%, #140812 0%, #000 65%)",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  articles: MagazineArticle[];
  onRead: (slug: string) => void;
  /** top offset in px (nav + ticker height) */
  topOffset?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  forcePaused?: boolean;
};

export default function MagazineSlideshow({
  articles,
  onRead,
  topOffset = 88,
  currentIndex,
  onIndexChange,
  forcePaused = false,
}: Props) {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);

  const count = articles.length;
  const current = currentIndex ?? internalCurrent;

  const goTo = useCallback(
    (idx: number) => {
      const nextIndex = ((idx % count) + count) % count;
      setInternalCurrent(nextIndex);
      onIndexChange?.(nextIndex);
    },
    [count, onIndexChange],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    setProgressKey((k) => k + 1);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    if (paused || forcePaused) return;
    const id = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [forcePaused, paused, next]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStart.current = e.clientX;
    pointerId.current = e.pointerId;
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const delta = e.clientX - pointerStart.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    if (pointerId.current !== null && e.currentTarget.hasPointerCapture(pointerId.current)) {
      e.currentTarget.releasePointerCapture(pointerId.current);
    }
    pointerStart.current = null;
    pointerId.current = null;
    setPaused(false);
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== null && e.currentTarget.hasPointerCapture(pointerId.current)) {
      e.currentTarget.releasePointerCapture(pointerId.current);
    }
    pointerStart.current = null;
    pointerId.current = null;
    setPaused(false);
  };

  const article = articles[current];
  void (CATEGORY_BG[article.category] ?? CATEGORY_BG.NEWS);

  return (
    <div
      className="relative w-full overflow-hidden bg-black select-none touch-pan-y"
      style={{ height: `calc(100vh - ${topOffset}px)`, minHeight: 520 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Slides */}
      {articles.map((a, i) => {
        const slideBg = CATEGORY_BG[a.category] ?? CATEGORY_BG.NEWS;
        return (
          <div
            key={a.slug}
            aria-hidden={i !== current}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {/* Cover image — fills the slide, darkened for legibility */}
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt={a.title}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0.38 }}
              />
            )}

            {/* Gradient background (always present — acts as colour tint / fallback) */}
            <div className="absolute inset-0" style={{ background: slideBg, opacity: a.image_url ? 0.55 : 1 }} />

            {/* Image treatment: soft white wash plus the same grid language used in mixtapes */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 24%, rgba(255,255,255,0.04) 52%, rgba(255,255,255,0) 100%)",
                opacity: a.image_url ? 0.5 : 0.12,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: a.image_url ? 0.012 : 0.008,
                backgroundImage:
                  "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: a.image_url ? 0.34 : 0.48,
                mixBlendMode: "screen",
                maskImage: "radial-gradient(65% 90% at 16% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.26) 62%, transparent 82%)",
                WebkitMaskImage: "radial-gradient(65% 90% at 16% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.26) 62%, transparent 82%)",
                backgroundImage:
                  "linear-gradient(to right, rgba(190,235,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(190,235,255,1) 1px, transparent 1px)",
                backgroundSize: "24px 24px, 24px 24px",
                animation: "magazine-grid-zone-a 6.6s cubic-bezier(0.33, 0.02, 0.2, 1) infinite",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: a.image_url ? 0.38 : 0.14,
                mixBlendMode: "screen",
                maskImage: "radial-gradient(62% 78% at 50% 48%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 18%, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.3) 60%, transparent 82%)",
                WebkitMaskImage: "radial-gradient(62% 78% at 50% 48%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 18%, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.3) 60%, transparent 82%)",
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "24px 24px, 24px 24px",
                animation: "magazine-grid-zone-b 8.4s cubic-bezier(0.38, 0.06, 0.22, 1) infinite",
              }}
            />

            {/* Large faint background watermark — only when no image */}
            {!a.image_url && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden pr-8 sm:pr-16"
                style={{ zIndex: 0 }}
              >
                <span
                  className="[font-family:var(--font-display)] leading-none text-white/[0.032]"
                  style={{ fontSize: "clamp(14rem,28vw,32rem)", marginBottom: "-4rem" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom gradient — text legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Top edge gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-10">
        <div className="flex items-end justify-between gap-8">

          {/* Article info */}
          <div className="max-w-2xl flex-1">
            {/* Category + date */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.44em] text-white/32">
                {article.category}
              </span>
              <span className="text-white/14">·</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/22">
                {formatDate(article.date)}
              </span>
            </div>

            {/* Title */}
            <h2
              className="mb-8 [font-family:var(--font-display)] leading-[0.86] tracking-[-0.06em] text-white sm:mb-10 lg:mb-7"
              style={{ fontSize: "clamp(1.7rem,3.8vw + 0.5rem,3.6rem)" }}
            >
              {article.title}
            </h2>

            {/* Subtitle */}
            <p className="mb-6 max-w-lg text-xs leading-6 tracking-wide text-white/44 sm:mb-7 sm:text-sm sm:leading-7 lg:mb-5">
              {article.subtitle}
            </p>

            {/* Author + CTA */}
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-[9px] uppercase tracking-[0.34em] text-white/28">
                {article.author} · {article.readTime} read
              </span>
              <button
                onClick={() => onRead(article.slug)}
                className="border border-white/24 px-5 py-2.5 text-[10px] uppercase tracking-[0.34em] text-white transition-colors hover:border-white/55 hover:text-white sm:text-[11px]"
              >
                Read Now →
              </button>
            </div>
          </div>

          {/* Slide navigation */}
          <div className="hidden flex-col items-end gap-5 sm:flex">
            {/* Counter */}
            <div className="flex items-baseline gap-1.5 text-[9px] tabular-nums tracking-[0.3em] text-white/28">
              <span className="text-white/52">{String(current + 1).padStart(2, "0")}</span>
              <span className="text-white/16">/</span>
              <span>{String(count).padStart(2, "0")}</span>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-px transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-white/60"
                      : "w-2.5 bg-white/18 hover:bg-white/36"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex gap-4">
              <button
                onClick={prev}
                className="text-[9px] uppercase tracking-[0.36em] text-white/26 transition-colors hover:text-white/55"
              >
                ← Prev
              </button>
              <button
                onClick={next}
                className="text-[9px] uppercase tracking-[0.36em] text-white/26 transition-colors hover:text-white/55"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dot indicators */}
        <div className="mt-6 flex items-center justify-between sm:hidden">
          <div className="flex gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-px transition-all duration-300 ${
                  i === current ? "w-6 bg-white/60" : "w-2 bg-white/18"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-[9px] tabular-nums tracking-[0.3em] text-white/28">
            {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 h-px bg-white/6">
        {!paused && !forcePaused && (
          <div
            key={progressKey}
            className="h-full origin-left bg-white/32"
            style={{
              animation: `slideshow-progress ${SLIDE_DURATION}ms linear forwards`,
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes magazine-grid-zone-a {
          0% {
            opacity: 0;
          }
          11% {
            opacity: 0.02;
          }
          24% {
            opacity: 0.11;
          }
          39% {
            opacity: 0.29;
          }
          54% {
            opacity: 0.16;
          }
          72% {
            opacity: 0.025;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes magazine-grid-zone-b {
          0% {
            opacity: 0;
          }
          14% {
            opacity: 0.015;
          }
          28% {
            opacity: 0.025;
          }
          46% {
            opacity: 0.08;
          }
          61% {
            opacity: 0.19;
          }
          74% {
            opacity: 0.32;
          }
          87% {
            opacity: 0.09;
          }
          94% {
            opacity: 0.04;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
