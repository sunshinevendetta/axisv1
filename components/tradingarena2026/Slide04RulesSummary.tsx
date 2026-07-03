"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

/* The six operating constraints that define the league, each cross-referenced
   to the article of the Official Rulebook that governs it. Refs are league
   jargon (untranslated); rows deep-link into the rulebook page anchors. */
const RULES: ReadonlyArray<{
  bKey: ArenaKey;
  sKey: ArenaKey;
  ref: string;
  hash: string;
}> = [
  { bKey: "s4r.r1.b", sKey: "s4r.r1.s", ref: "ART 10", hash: "#article-10" },
  { bKey: "s4r.r2.b", sKey: "s4r.r2.s", ref: "ART 36–42", hash: "#article-36" },
  { bKey: "s4r.r3.b", sKey: "s4r.r3.s", ref: "ART 07", hash: "#article-7" },
  { bKey: "s4r.r4.b", sKey: "s4r.r4.s", ref: "ART 54", hash: "#article-54" },
  { bKey: "s4r.r5.b", sKey: "s4r.r5.s", ref: "ART 43–44", hash: "#article-43" },
  { bKey: "s4r.r6.b", sKey: "s4r.r6.s", ref: "ART 02", hash: "#article-2" },
];

/* Slide — Rules summary. One slide, six constraints, styled as an official
   term sheet: numbered rows with hairline dividers and article refs that jump
   straight into the full regulations. The deck stays concise; the rulebook
   carries the detail. */
export default function Slide04RulesSummary({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker={t("kicker.rules")} id="slide-rules">
      <div
        ref={ref}
        className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center"
      >
        <div>
          <h2
            data-reveal
            className="arena-chrome arena-chrome--live text-[clamp(1.35rem,2.4vw,2rem)] font-black uppercase leading-tight tracking-tight"
          >
            {t("s4r.h2")}
          </h2>
          <div
            data-reveal
            aria-hidden
            className="mt-6 h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
          />
          <p
            data-reveal
            className="mt-7 max-w-xl text-sm leading-relaxed text-[var(--arena-silver)] lg:text-base"
          >
            {t("s4r.p")}
          </p>
          <blockquote
            data-reveal
            className="mt-7 border-l border-[var(--arena-line)] pl-5 text-sm leading-relaxed text-[var(--arena-steel)]"
          >
            {t("s4r.note")}
          </blockquote>
          <Link
            data-reveal
            className="arena-rulebook-inline-link mt-8 inline-flex items-center gap-2"
            href="/tradingarena2026/rules"
          >
            <span>{t("s4r.open")}</span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {/* Term sheet — six governing constraints as an official document. */}
        <div data-reveal="scale" className="arena-panel tal-sheet">
          <div className="tal-sheet-head" aria-hidden>
            <span>OFFICIAL REGULATIONS · SUMMARY</span>
            <span>V 1.0</span>
          </div>
          <ul className="tal-sheet-rows">
            {RULES.map(({ bKey, sKey, ref: artRef, hash }, i) => (
              <li key={bKey}>
                <Link
                  className="tal-sheet-row"
                  href={`/tradingarena2026/rules${hash}`}
                >
                  <span className="tal-sheet-num" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="tal-sheet-copy">
                    <strong>{t(bKey)}</strong>
                    <small>{t(sKey)}</small>
                  </span>
                  <span className="tal-sheet-ref">
                    <span>{artRef}</span>
                    <FiArrowUpRight aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideShell>
  );
}
