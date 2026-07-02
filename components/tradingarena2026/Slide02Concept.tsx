"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

/* Micro-candle series: [open, close, high, low] as y-coordinates in a 96x32
   viewBox (y grows downward). Deterministic, hand-tuned per card — down
   candles (close below open) render red as market data. */
type MicroCandle = readonly [o: number, c: number, h: number, l: number];

const MICRO_W = 8;
const MICRO_STEP = 16;
const microX = (i: number) => 4 + i * MICRO_STEP;

/* KPI numerals are literal, non-translated values carried over verbatim from
   public/tradingarena/arena-horizontal.html (250 / 4-9 / 2 / DJs). Only the
   labels are translated. Each card carries its own micro-series. */
const KPIS: ReadonlyArray<{
  value: string;
  labelKey: ArenaKey;
  candles: readonly MicroCandle[];
}> = [
  {
    value: "250",
    labelKey: "s2.kpi1",
    candles: [
      [26, 20, 18, 28],
      [20, 14, 12, 22],
      [14, 18, 12, 21],
      [18, 10, 8, 20],
      [10, 6, 4, 12],
      [6, 4, 2, 8],
    ],
  },
  {
    value: "4-9",
    labelKey: "s2.kpi2",
    candles: [
      [24, 18, 16, 27],
      [18, 22, 16, 25],
      [22, 12, 10, 24],
      [12, 16, 10, 19],
      [16, 8, 6, 18],
      [8, 5, 3, 10],
    ],
  },
  {
    value: "2",
    labelKey: "s2.kpi3",
    candles: [
      [22, 16, 14, 25],
      [16, 10, 8, 18],
      [10, 15, 9, 18],
      [15, 19, 13, 22],
      [19, 9, 7, 21],
      [9, 4, 2, 11],
    ],
  },
  {
    value: "DJs",
    labelKey: "s2.kpi4",
    candles: [
      [27, 21, 19, 29],
      [21, 24, 19, 27],
      [24, 14, 12, 26],
      [14, 9, 7, 16],
      [9, 13, 8, 16],
      [13, 5, 3, 15],
    ],
  },
];

/* Tiny inline candle chart used inside each KPI panel. */
function MicroChart({ candles }: { candles: readonly MicroCandle[] }) {
  return (
    <svg viewBox="0 0 96 32" className="h-6 w-24" aria-hidden role="presentation">
      {candles.map(([o, c, h, l], i) => {
        const up = c <= o;
        const color = up ? "var(--arena-silver)" : "var(--arena-red)";
        const x = microX(i);
        const cx = x + MICRO_W / 2;
        return (
          <g key={i}>
            <line x1={cx} y1={h} x2={cx} y2={l} stroke={color} strokeWidth={1} />
            <rect
              x={x}
              y={Math.min(o, c)}
              width={MICRO_W}
              height={Math.max(Math.abs(o - c), 1.5)}
              fill={up ? color : "none"}
              stroke={color}
              strokeWidth={up ? 0 : 1}
              opacity={up ? 0.9 : 1}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* Equity curve under the lead: a session P&L line that mostly grinds up with
   one drawdown leg. The white path is the curve; the red overlay retraces the
   drawdown segment (down-data). Both draw on scroll via strokeDashoffset. */
const EQUITY_PATH =
  "M0 86 L60 80 L120 82 L180 70 L240 74 L300 58 L360 62 L420 44 L470 60 L520 66 L580 48 L640 40 L700 44 L760 28 L820 32 L880 18 L960 12";
const EQUITY_DRAWDOWN = "M420 44 L470 60 L520 66";

/* Slide 02 — Concept. Compact chrome h2, lead, a scroll-drawn equity curve,
   two body paragraphs and a 4-KPI row of metallic panels with a subtle
   perspective tilt and per-card micro-candle charts. Shared scroll-reveal
   handles entrances; the equity curve choreographs its own draw-on. The
   liquidation mention in s2.p2 stays strictly monochrome — the deck's red
   liquidation beat lives in slide 03's bracket. */
export default function Slide02Concept({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const paths = root.querySelectorAll<SVGPathElement>("[data-eq-draw]");
    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.querySelector("[data-eq-chart]"),
        start: "top 85%",
        toggleActions: "play none none none",
      } satisfies ScrollTrigger.Vars,
    });
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: "power2.inOut",
      stagger: 0.35,
    });
  });

  return (
    <SlideShell index={index} kicker={t("kicker.02")} id="slide-02">
      <div ref={ref} className="flex flex-col">
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase leading-[1.05] tracking-[0.06em]"
        >
          {t("s2.h2")}
        </h2>

        <div
          data-reveal
          aria-hidden
          className="mt-6 h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        {/* Statement lead */}
        <p
          data-reveal
          className="mt-8 max-w-3xl text-base font-light leading-snug text-[var(--arena-white)] lg:text-lg"
        >
          {t("s2.lead")}
        </p>

        {/* Equity curve — session P&L drawing on scroll */}
        <div data-eq-chart data-reveal aria-hidden className="mt-8 max-w-5xl">
          <svg
            viewBox="0 0 960 100"
            preserveAspectRatio="none"
            className="h-16 w-full sm:h-20"
            role="presentation"
          >
            <line
              x1={0}
              y1={92}
              x2={960}
              y2={92}
              stroke="var(--arena-line)"
              strokeWidth={1}
            />
            <path
              data-eq-draw
              d={EQUITY_PATH}
              fill="none"
              stroke="var(--arena-white)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
            {/* Drawdown leg retraced in red — down-data, not decoration */}
            <path
              data-eq-draw
              d={EQUITY_DRAWDOWN}
              fill="none"
              stroke="var(--arena-red)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-1 flex justify-between text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-[var(--arena-steel)]">
            <span>16:00</span>
            <span>SESSION P&amp;L</span>
            <span>21:00</span>
          </div>
        </div>

        {/* Body copy — liquidation mention stays mono by design */}
        <div className="mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          <p
            data-reveal="left"
            className="border-l border-[var(--arena-line)] pl-6 text-sm leading-relaxed text-[var(--arena-silver)] lg:text-base"
          >
            {t("s2.p1")}
          </p>
          <p
            data-reveal="right"
            className="border-l border-[var(--arena-line)] pl-6 text-sm leading-relaxed text-[var(--arena-steel)] lg:text-base"
          >
            {t("s2.p2")}
          </p>
        </div>

        {/* KPI row — metallic panels on a subtle 3D plane, each with a
            micro-candle series */}
        <div className="mt-12 [perspective:1400px]">
          <div className="grid grid-cols-2 gap-4 [transform-style:preserve-3d] lg:grid-cols-4">
            {KPIS.map(({ value, labelKey, candles }) => (
              <div
                key={labelKey}
                data-reveal="scale"
                className="arena-panel flex flex-col gap-3 p-5 [transform:rotateX(6deg)] sm:p-6"
              >
                <span className="arena-chrome text-2xl font-black tracking-[-0.02em]">
                  {value}
                </span>
                <MicroChart candles={candles} />
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--arena-steel)]">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
