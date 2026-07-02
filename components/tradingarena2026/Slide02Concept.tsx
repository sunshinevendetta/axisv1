"use client";

import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

/* KPI numerals are literal, non-translated values carried over verbatim from
   public/tradingarena/arena-horizontal.html (250 / 4-9 / 2 / DJs). Only the
   labels are translated. */
const KPIS: ReadonlyArray<{ value: string; labelKey: ArenaKey }> = [
  { value: "250", labelKey: "s2.kpi1" },
  { value: "4-9", labelKey: "s2.kpi2" },
  { value: "2", labelKey: "s2.kpi3" },
  { value: "DJs", labelKey: "s2.kpi4" },
];

/* Slide 02 — Concept. Chrome h2, an oversized statement lead, two body
   paragraphs and a 4-KPI row of metallic panels with a subtle perspective
   tilt. All motion comes from the shared scroll-reveal ([data-reveal]);
   the KPI cards use the "scale" variant so the numerals scale/fade in,
   staggered in DOM order. The liquidation mention in s2.p2 stays strictly
   monochrome — the deck's single red accent lives in slide 03's bracket. */
export default function Slide02Concept({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker={t("kicker.02")} id="slide-02">
      <div ref={ref} className="flex flex-col">
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-[clamp(2.6rem,7vw,5.5rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]"
        >
          {t("s2.h2")}
        </h2>

        <div
          data-reveal
          aria-hidden
          className="mt-8 h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        {/* Oversized statement lead */}
        <p
          data-reveal
          className="mt-10 max-w-4xl text-2xl font-light leading-snug text-[var(--arena-white)] sm:text-3xl lg:text-4xl"
        >
          {t("s2.lead")}
        </p>

        {/* Body copy — liquidation mention stays mono by design */}
        <div className="mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          <p
            data-reveal="left"
            className="border-l border-[var(--arena-line)] pl-6 text-base leading-relaxed text-[var(--arena-silver)] sm:text-lg"
          >
            {t("s2.p1")}
          </p>
          <p
            data-reveal="right"
            className="border-l border-[var(--arena-line)] pl-6 text-sm leading-relaxed text-[var(--arena-steel)] sm:text-base"
          >
            {t("s2.p2")}
          </p>
        </div>

        {/* KPI row — metallic panels on a subtle 3D plane */}
        <div className="mt-16 [perspective:1400px]">
          <div className="grid grid-cols-2 gap-4 [transform-style:preserve-3d] lg:grid-cols-4">
            {KPIS.map(({ value, labelKey }) => (
              <div
                key={labelKey}
                data-reveal="scale"
                className="arena-panel flex flex-col gap-3 p-6 [transform:rotateX(6deg)] sm:p-7"
              >
                <span className="arena-chrome text-5xl font-black tracking-[-0.03em] sm:text-6xl">
                  {value}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[var(--arena-steel)]">
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
