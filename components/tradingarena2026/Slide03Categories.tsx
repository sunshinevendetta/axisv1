"use client";

import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import BracketDiagram from "./BracketDiagram";
import type { ArenaKey, SlideProps } from "./content";

const CARDS: ReadonlyArray<{ num: string; bKey: ArenaKey; sKey: ArenaKey }> = [
  { num: "01", bKey: "s3.card1.b", sKey: "s3.card1.s" },
  { num: "02", bKey: "s3.card2.b", sKey: "s3.card2.s" },
  { num: "03", bKey: "s3.card3.b", sKey: "s3.card3.s" },
];

/* Slide 03 — Format. Chrome h2, intro, three metallic category cards and the
   centerpiece: the tournament bracket diagram (which owns the deck's single
   red accent — the knockout-by-liquidation beat). Cards ride the shared
   scroll-reveal; the bracket choreographs its own draw-on via ScrollTrigger. */
export default function Slide03Categories({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker={t("kicker.03")} id="slide-03">
      <div ref={ref} className="flex flex-col">
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-[clamp(2.6rem,7vw,5.5rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]"
        >
          {t("s3.h2")}
        </h2>

        <div
          data-reveal
          aria-hidden
          className="mt-8 h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        <p
          data-reveal
          className="mt-8 max-w-3xl text-base leading-relaxed text-[var(--arena-silver)] sm:text-lg"
        >
          {t("s3.p")}
        </p>

        {/* Category cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CARDS.map(({ num, bKey, sKey }) => (
            <div
              key={bKey}
              data-reveal="scale"
              className="arena-panel flex flex-col gap-4 p-6 sm:p-7"
            >
              <span className="arena-num text-4xl font-black" aria-hidden>
                {num}
              </span>
              <b className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--arena-white)]">
                {t(bKey)}
              </b>
              <span className="text-sm leading-relaxed text-[var(--arena-steel)]">
                {t(sKey)}
              </span>
            </div>
          ))}
        </div>

        {/* Centerpiece — tournament bracket. No data-reveal here: the diagram
            runs its own draw-on timeline when it enters the viewport. */}
        <div className="mt-16">
          <BracketDiagram t={t} />
        </div>
      </div>
    </SlideShell>
  );
}
