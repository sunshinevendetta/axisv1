"use client";

import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import BracketDiagram from "./BracketDiagram";
import type { ArenaKey, SlideProps } from "./content";

/* Small mono glyphs: human trader / AI agent / final showcase. */
function CardGlyph({ kind }: { kind: "human" | "agent" | "trophy" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[var(--arena-silver)]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "human" && (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 20c1.2-3.6 3.7-5.4 6.5-5.4s5.3 1.8 6.5 5.4" />
        </>
      )}
      {kind === "agent" && (
        <>
          <rect x="7" y="7" width="10" height="10" rx="1.6" />
          <path d="M9.5 4.5V7M14.5 4.5V7M9.5 17v2.5M14.5 17v2.5M4.5 9.5H7M4.5 14.5H7M17 9.5h2.5M17 14.5h2.5" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "trophy" && (
        <>
          <path d="M8 5h8v5a4 4 0 0 1-8 0V5Z" />
          <path d="M8 6H5.5v1.5A3 3 0 0 0 8 10.5M16 6h2.5v1.5a3 3 0 0 1-2.5 3" />
          <path d="M12 14v3M9 19.5h6" />
        </>
      )}
    </svg>
  );
}

const CARDS: ReadonlyArray<{
  num: string;
  bKey: ArenaKey;
  sKey: ArenaKey;
  glyph: "human" | "agent" | "trophy";
}> = [
  { num: "01", bKey: "s3.card1.b", sKey: "s3.card1.s", glyph: "human" },
  { num: "02", bKey: "s3.card2.b", sKey: "s3.card2.s", glyph: "agent" },
  { num: "03", bKey: "s3.card3.b", sKey: "s3.card3.s", glyph: "trophy" },
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
          className="arena-chrome arena-chrome--live text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase leading-[1.05] tracking-[-0.01em]"
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
          className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--arena-silver)] lg:text-base"
        >
          {t("s3.p")}
        </p>

        {/* Category cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CARDS.map(({ num, bKey, sKey, glyph }) => (
            <div
              key={bKey}
              data-reveal="scale"
              className="arena-panel flex flex-col gap-4 p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="arena-num text-xl font-black" aria-hidden>
                  {num}
                </span>
                <CardGlyph kind={glyph} />
              </div>
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
