"use client";

import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

type GlyphKind = "stage" | "ops" | "drinks" | "rooms" | "dj";

/* Small mono facility glyphs — venue as infrastructure, not decoration. */
function FacilityGlyph({ kind, large }: { kind: GlyphKind; large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${large ? "h-8 w-8" : "h-5 w-5"} text-[var(--arena-silver)]`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "stage" && (
        <>
          <rect x="3.5" y="5" width="17" height="11" rx="1.2" />
          <path d="M7 19h10M12 16v3M7 9l3 3 2.5-2 4.5 3" />
        </>
      )}
      {kind === "ops" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4.5V7M12 17v2.5M4.5 12H7M17 12h2.5M6.7 6.7l1.8 1.8M15.5 15.5l1.8 1.8M17.3 6.7l-1.8 1.8M8.5 15.5l-1.8 1.8" />
        </>
      )}
      {kind === "drinks" && (
        <>
          <path d="M6 4.5h12l-5 7v6" />
          <path d="M9.5 20.5h5M8.2 7.5h7.6" />
        </>
      )}
      {kind === "rooms" && (
        <>
          <path d="M4 20V6l8-2.5V20M12 20h8v-9l-8-2" />
          <path d="M7 9.5h2M7 13h2M15 12.5h2M15 16h2" />
        </>
      )}
      {kind === "dj" && (
        <>
          <circle cx="8" cy="13" r="3.5" />
          <circle cx="16" cy="13" r="3.5" />
          <circle cx="8" cy="13" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="16" cy="13" r="0.8" fill="currentColor" stroke="none" />
          <path d="M5 7h14" />
        </>
      )}
    </svg>
  );
}

/* Asymmetric editorial grid on lg (3 columns):
   01 Main room is the 2x2 feature; 02/03 stack beside it; 04 + 05 close
   the composition on the last row. Reveal directions oppose across the seam. */
const CARDS: ReadonlyArray<{
  num: string;
  b: ArenaKey;
  s: ArenaKey;
  glyph: GlyphKind;
  className: string;
  reveal: "left" | "right" | "up" | "scale";
  featured?: boolean;
}> = [
  { num: "01", b: "s5.f1.b", s: "s5.f1.s", glyph: "stage", className: "lg:col-span-2 lg:row-span-2", reveal: "left", featured: true },
  { num: "02", b: "s5.f2.b", s: "s5.f2.s", glyph: "ops", className: "", reveal: "right" },
  { num: "03", b: "s5.f3.b", s: "s5.f3.s", glyph: "drinks", className: "", reveal: "right" },
  { num: "04", b: "s5.f4.b", s: "s5.f4.s", glyph: "rooms", className: "", reveal: "up" },
  { num: "05", b: "s5.f5.b", s: "s5.f5.s", glyph: "dj", className: "lg:col-span-2", reveal: "scale" },
];

/* Slide 05 — Venue. Five metallic facility panels with capacity data on the
   feature card. The reveal transform runs on an outer wrapper so the CSS
   hover lift on the inner panel is never overridden by GSAP's transform. */
export default function Slide05Venue({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <SlideShell index={index} kicker={t("kicker.05")} id="slide-05">
      <div ref={ref}>
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live max-w-4xl text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase tracking-tight"
        >
          {t("s5.h2")}
        </h2>

        <div className="mt-10 grid gap-5 sm:mt-12 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.num} data-reveal={card.reveal} className={card.className}>
              <article
                className={[
                  "arena-panel group relative h-full overflow-hidden",
                  "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-2",
                  card.featured
                    ? "flex flex-col justify-between p-8 sm:p-10 lg:min-h-[22rem]"
                    : "p-6 sm:p-7",
                ].join(" ")}
              >
                {/* Specular sweep on hover. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className="block text-xs font-semibold tracking-[0.4em] text-[var(--arena-steel)]"
                  >
                    {card.num}
                  </span>
                  <FacilityGlyph kind={card.glyph} large={card.featured} />
                </div>

                <div className={card.featured ? "mt-10 sm:mt-14" : "mt-5"}>
                  <h3
                    className={
                      card.featured
                        ? "arena-chrome text-lg font-black uppercase tracking-tight sm:text-xl"
                        : "text-base font-bold uppercase tracking-wide text-[var(--arena-white)]"
                    }
                  >
                    {t(card.b)}
                  </h3>
                  <p
                    className={[
                      "leading-relaxed text-[var(--arena-steel)]",
                      card.featured ? "mt-3 max-w-md text-sm lg:text-base" : "mt-2 text-sm",
                    ].join(" ")}
                  >
                    {t(card.s)}
                  </p>

                  {/* Capacity readout — data, not decoration. */}
                  {card.featured && (
                    <div className="mt-8 font-mono text-[0.62rem] tracking-[0.22em] text-[var(--arena-steel)]">
                      <div className="flex items-baseline justify-between">
                        <span>CAP</span>
                        <span className="text-sm font-bold tracking-normal text-[var(--arena-white)]">
                          250
                        </span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden bg-[var(--arena-line)]">
                        <div
                          className="h-full w-[83%] bg-gradient-to-r from-[var(--arena-steel)] to-[var(--arena-silver)]"
                          data-reveal="left"
                        />
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span>16:00 OPEN</span>
                        <span>22:00 CLOSE</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
