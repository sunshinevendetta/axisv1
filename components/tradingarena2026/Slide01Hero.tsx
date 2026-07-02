"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Deterministic candle series for the hero market graphic. All values are
   y-coordinates in the 640x220 viewBox (y grows downward), hand-tuned to read
   as a grinding uptrend with red pullbacks. o/c = open/close, h/l = wick
   extremes. A candle is "down" (red, market data — not decoration) when the
   close sits below the open. */
type Candle = { o: number; c: number; h: number; l: number };

const CANDLES: readonly Candle[] = [
  { o: 178, c: 160, h: 154, l: 184 },
  { o: 160, c: 148, h: 142, l: 165 },
  { o: 148, c: 157, h: 145, l: 162 },
  { o: 157, c: 138, h: 132, l: 160 },
  { o: 138, c: 128, h: 120, l: 142 },
  { o: 128, c: 140, h: 124, l: 146 },
  { o: 140, c: 122, h: 116, l: 144 },
  { o: 122, c: 110, h: 102, l: 126 },
  { o: 110, c: 118, h: 106, l: 124 },
  { o: 118, c: 98, h: 92, l: 122 },
  { o: 98, c: 88, h: 80, l: 102 },
  { o: 88, c: 99, h: 84, l: 104 },
  { o: 99, c: 78, h: 72, l: 102 },
  { o: 78, c: 70, h: 62, l: 82 },
  { o: 70, c: 82, h: 66, l: 88 },
  { o: 82, c: 64, h: 58, l: 86 },
  { o: 64, c: 56, h: 48, l: 68 },
  { o: 56, c: 66, h: 52, l: 72 },
  { o: 66, c: 50, h: 44, l: 70 },
  { o: 50, c: 42, h: 36, l: 56 },
  { o: 42, c: 52, h: 38, l: 58 },
  { o: 52, c: 34, h: 28, l: 56 },
];

const CANDLE_STEP = 29;
const CANDLE_W = 12;
const candleX = (i: number) => 8 + i * CANDLE_STEP;

/* Price path traced through the closes — drawn on with strokeDashoffset. */
const PRICE_PATH = CANDLES.map(
  (k, i) => `${i === 0 ? "M" : "L"}${candleX(i) + CANDLE_W / 2} ${k.c}`,
).join(" ");

/* Decorative session readouts — untranslated trading jargon as graphic labels
   (same convention as HUMAN TRADERS in the bracket). Negative funding renders
   red because it is down-data, never decoration. */
const SESSION_STATS: ReadonlyArray<{ label: string; value: string; down?: boolean }> = [
  { label: "VOL 24H", value: "1,284,502" },
  { label: "OPEN INT", value: "86,412" },
  { label: "FUNDING", value: "-0.0125%", down: true },
];

/* Slide 01 — the opener. Brand lockup (AXIS mark), a compact chrome headline,
   and a real market graphic: a candlestick strip whose candles rise in with
   the mount-time entrance while the close-price path draws itself across the
   chart. Hairline rules, sub lines and a looping scroll cue complete the
   build; a scrubbed exit parallax fades the stack as the deck scrolls on.
   Translated strings stay in single wrappers so language swaps in place. */
export default function Slide01Hero({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const q = gsap.utils.selector(root);

    /* Prime the price path for draw-on before the timeline starts. */
    const pricePath = root.querySelector<SVGPathElement>("[data-hero-price]");
    if (pricePath) {
      const len = pricePath.getTotalLength();
      gsap.set(pricePath, { strokeDasharray: len, strokeDashoffset: len });
    }

    /* Entrance — plays on mount, not on scroll. */
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(
      q("[data-hero-rule]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: "power3.inOut", stagger: 0.15 },
      0,
    )
      .fromTo(
        q("[data-hero-logo]"),
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 1 },
        0.1,
      )
      .fromTo(
        q("[data-hero-h1]"),
        { yPercent: 115 },
        { yPercent: 0, duration: 1.2 },
        0.3,
      )
      .fromTo(
        q("[data-hero-lead]"),
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 1 },
        0.7,
      )
      .fromTo(
        q("[data-hero-line]"),
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.16 },
        0.9,
      )
      /* Market graphic: candles rise from their lows, staggered left→right. */
      .fromTo(
        q("[data-hero-candle]"),
        { scaleY: 0, autoAlpha: 0, transformOrigin: "50% 100%" },
        {
          scaleY: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.045,
        },
        0.5,
      )
      .fromTo(
        q("[data-hero-stat]"),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
        1.4,
      )
      .fromTo(
        q("[data-hero-cue]"),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.9, ease: "power2.out" },
        1.7,
      );

    if (pricePath) {
      tl.to(
        pricePath,
        { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
        0.9,
      );
    }

    /* Scroll cue: a light dot endlessly travels down its hairline track. */
    gsap.fromTo(
      q("[data-hero-cue-dot]"),
      { y: -14 },
      {
        y: 56,
        duration: 1.7,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.45,
        delay: 1.8,
      },
    );

    /* Exit parallax: the hero recedes and dims as the deck scrolls on. */
    const section = root.closest("section");
    if (section) {
      gsap.to(root, {
        yPercent: -10,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom 25%",
          scrub: true,
        },
      });
    }
  });

  return (
    <SlideShell index={index} kicker={t("kicker.01")} id="slide-01">
      <div ref={ref} className="flex flex-col">
        {/* Top hairline */}
        <div
          data-hero-rule
          aria-hidden
          className="h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-14">
          {/* Copy column */}
          <div className="flex flex-col">
            {/* Brand lockup — AXIS mark above the headline */}
            <div data-hero-logo>
              <Image
                src="/logow.svg"
                alt="AXIS"
                width={104}
                height={75}
                priority
                className="h-auto w-[90px] sm:w-[104px]"
              />
            </div>

            {/* Chrome headline inside a clipping mask */}
            <div className="mt-7 overflow-hidden pb-1">
              <h1
                data-hero-h1
                className="arena-chrome arena-chrome--live text-[clamp(1.15rem,3.5vw,2.9rem)] font-black uppercase leading-[1.02] tracking-[0.02em]"
              >
                {t("s1.h1")}
              </h1>
            </div>

            {/* Lead */}
            <p
              data-hero-lead
              className="mt-5 max-w-xl text-base font-light leading-snug text-[var(--arena-silver)] lg:text-lg"
            >
              {t("s1.lead")}
            </p>

            {/* Statement lines */}
            <div className="mt-7 flex max-w-xl flex-col gap-4 border-l border-[var(--arena-line)] pl-5">
              <p
                data-hero-line
                className="text-sm leading-relaxed text-[var(--arena-steel)] lg:text-base"
              >
                <strong className="font-semibold text-[var(--arena-white)]">
                  {t("s1.p1.strong")}
                </strong>
                <span>{t("s1.p1.rest")}</span>
              </p>
              <p
                data-hero-line
                className="text-sm leading-relaxed text-[var(--arena-steel)] lg:text-base"
              >
                <strong className="font-semibold text-[var(--arena-white)]">
                  {t("s1.p2.strong")}
                </strong>
                <span>{t("s1.p2.rest")}</span>
              </p>
            </div>
          </div>

          {/* Market graphic — candlestick strip + close-price path. Pure
              decoration for screen readers; the copy carries the message. */}
          <div aria-hidden className="flex flex-col gap-4">
            <svg
              viewBox="0 0 640 220"
              className="h-auto w-full"
              role="presentation"
            >
              {/* Session grid hairlines */}
              <g stroke="var(--arena-line)" strokeWidth={1}>
                <line x1={0} y1={55} x2={640} y2={55} />
                <line x1={0} y1={110} x2={640} y2={110} />
                <line x1={0} y1={165} x2={640} y2={165} />
              </g>

              {/* Candles — white/silver up, red down (market data) */}
              {CANDLES.map((k, i) => {
                const up = k.c <= k.o;
                const color = up ? "var(--arena-silver)" : "var(--arena-red)";
                const x = candleX(i);
                const cx = x + CANDLE_W / 2;
                const bodyY = Math.min(k.o, k.c);
                const bodyH = Math.max(Math.abs(k.o - k.c), 2);
                return (
                  <g key={i} data-hero-candle>
                    <line
                      x1={cx}
                      y1={k.h}
                      x2={cx}
                      y2={k.l}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <rect
                      x={x}
                      y={bodyY}
                      width={CANDLE_W}
                      height={bodyH}
                      fill={up ? color : "none"}
                      stroke={color}
                      strokeWidth={up ? 0 : 1.5}
                      opacity={up ? 0.92 : 1}
                    />
                  </g>
                );
              })}

              {/* Close-price path, drawn on by the entrance timeline */}
              <path
                data-hero-price
                d={PRICE_PATH}
                fill="none"
                stroke="var(--arena-white)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
            </svg>

            {/* Session-stat readouts — graphic labels, tabular numerals */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-[var(--arena-line)] pt-3">
              {SESSION_STATS.map(({ label, value, down }) => (
                <div key={label} data-hero-stat className="flex flex-col gap-0.5">
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-[var(--arena-steel)]">
                    {label}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums tracking-wide ${
                      down ? "arena-down" : "arena-up"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom hairline */}
        <div
          data-hero-rule
          aria-hidden
          className="mt-12 h-px origin-right bg-gradient-to-l from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        {/* Scroll cue — purely visual, no copy needed */}
        <div
          data-hero-cue
          aria-hidden
          className="pointer-events-none mt-12 flex flex-col items-center gap-3 self-center"
        >
          <span className="relative block h-14 w-px overflow-hidden bg-[var(--arena-line)]">
            <span
              data-hero-cue-dot
              className="absolute left-0 top-0 block h-3.5 w-px bg-[var(--arena-white)]"
            />
          </span>
          <span className="block h-1.5 w-1.5 rotate-45 border-b border-r border-[var(--arena-steel)]" />
        </div>
      </div>
    </SlideShell>
  );
}
