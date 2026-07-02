"use client";

import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

/* Asymmetric editorial grid on lg (3 columns):
   01 Cuarto Rosa is the 2x2 feature; 02/03 stack beside it; 04 + 05 close
   the composition on the last row. Reveal directions oppose across the seam. */
const CARDS: ReadonlyArray<{
  num: string;
  b: ArenaKey;
  s: ArenaKey;
  className: string;
  reveal: "left" | "right" | "up" | "scale";
  featured?: boolean;
}> = [
  { num: "01", b: "s5.f1.b", s: "s5.f1.s", className: "lg:col-span-2 lg:row-span-2", reveal: "left", featured: true },
  { num: "02", b: "s5.f2.b", s: "s5.f2.s", className: "", reveal: "right" },
  { num: "03", b: "s5.f3.b", s: "s5.f3.s", className: "", reveal: "right" },
  { num: "04", b: "s5.f4.b", s: "s5.f4.s", className: "", reveal: "up" },
  { num: "05", b: "s5.f5.b", s: "s5.f5.s", className: "lg:col-span-2", reveal: "scale" },
];

/* Slide 05 — Venue. Five metallic facility panels. The reveal transform runs
   on an outer wrapper so the CSS hover lift on the inner panel is never
   overridden by GSAP's inline transform. */
export default function Slide05Venue({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker={t("kicker.05")} id="slide-05">
      <div ref={ref}>
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live max-w-4xl text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
        >
          {t("s5.h2")}
        </h2>

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.num} data-reveal={card.reveal} className={card.className}>
              <article
                className={[
                  "arena-panel group relative h-full overflow-hidden",
                  "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-2",
                  card.featured
                    ? "flex flex-col justify-between p-8 sm:p-10 lg:min-h-[26rem]"
                    : "p-6 sm:p-7",
                ].join(" ")}
              >
                {/* Specular sweep on hover. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <span
                  aria-hidden
                  className="block text-xs font-semibold tracking-[0.4em] text-[var(--arena-steel)]"
                >
                  {card.num}
                </span>

                <div className={card.featured ? "mt-16 sm:mt-24" : "mt-6"}>
                  <h3
                    className={
                      card.featured
                        ? "arena-chrome text-3xl font-black uppercase tracking-tight sm:text-4xl"
                        : "text-xl font-bold uppercase tracking-wide text-[var(--arena-white)]"
                    }
                  >
                    {t(card.b)}
                  </h3>
                  <p
                    className={[
                      "leading-relaxed text-[var(--arena-steel)]",
                      card.featured ? "mt-4 max-w-md text-base sm:text-lg" : "mt-2 text-sm",
                    ].join(" ")}
                  >
                    {t(card.s)}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
