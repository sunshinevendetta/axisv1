"use client";

import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

const OPTIONS: ReadonlyArray<{
  id: "a" | "b";
  letter: string;
  h3: ArenaKey;
  items: ArenaKey[];
  reveal: "left" | "right";
  panelStyle: CSSProperties;
}> = [
  {
    id: "a",
    letter: "A",
    h3: "s6.a.h3",
    items: ["s6.a.li1", "s6.a.li2", "s6.a.li3", "s6.a.li4", "s6.a.li5"],
    reveal: "left",
    /* Lighter, chrome-edged panel. Inline style wins over .arena-panel. */
    panelStyle: {
      background:
        "linear-gradient(165deg, rgba(255,255,255,0.16), rgba(255,255,255,0.045) 45%, rgba(0,0,0,0.28))",
      borderColor: "rgba(244,245,247,0.38)",
    },
  },
  {
    id: "b",
    letter: "B",
    h3: "s6.b.h3",
    items: ["s6.b.li1", "s6.b.li2", "s6.b.li3", "s6.b.li4", "s6.b.li5"],
    reveal: "right",
    /* Darker, ink-heavy counterpart. */
    panelStyle: {
      background:
        "linear-gradient(165deg, rgba(255,255,255,0.04), rgba(0,0,0,0.52) 55%, rgba(0,0,0,0.72))",
      borderColor: "rgba(244,245,247,0.12)",
    },
  },
];

const ENGRAVED_LETTER: CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1px rgba(244,245,247,0.16)",
  letterSpacing: "-0.05em",
};

/* Slide 06 — the money slide. Two contrasting commercial panels split by a
   hairline seam: a decisive fork. Wrappers carry the directional reveal
   (x-axis); the panels themselves drift on y at different rates (scrubbed
   parallax), so the two transforms never fight. */
export default function Slide06Options({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const drift = (selector: string, fromY: number, toY: number) => {
      const el = root.querySelector<HTMLElement>(selector);
      if (!el) return;
      gsap.fromTo(
        el,
        { y: fromY },
        {
          y: toY,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    };

    drift('[data-option="a"]', 36, -18);
    drift('[data-option="b"]', 64, -32);
  });

  return (
    <SlideShell index={index} kicker={t("kicker.06")} id="slide-06">
      <div ref={ref}>
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live max-w-4xl text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
        >
          {t("s6.h2")}
        </h2>

        <div className="relative mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* The seam of the fork. */}
          <div
            aria-hidden
            className="absolute bottom-6 left-1/2 top-6 hidden w-px -translate-x-1/2 bg-[var(--arena-line)] lg:block"
          >
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--arena-silver)] bg-[var(--arena-black)]" />
          </div>

          {OPTIONS.map((option) => (
            <div key={option.id} data-reveal={option.reveal}>
              <article
                data-option={option.id}
                className="arena-panel relative h-full overflow-hidden p-7 sm:p-10"
                style={option.panelStyle}
              >
                {/* Engraved fork letter. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 right-3 select-none text-[9rem] font-black leading-none sm:-top-10 sm:text-[11rem]"
                  style={ENGRAVED_LETTER}
                >
                  {option.letter}
                </span>

                <h3 className="relative max-w-[85%] text-2xl font-black uppercase tracking-tight text-[var(--arena-white)] sm:text-3xl">
                  {t(option.h3)}
                </h3>

                <ul className="relative mt-8 divide-y divide-[var(--arena-line)]">
                  {option.items.map((key) => (
                    <li key={key} data-reveal className="flex items-start gap-4 py-3.5 sm:py-4">
                      <span
                        aria-hidden
                        className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--arena-silver)]"
                      />
                      <span className="text-sm leading-relaxed text-[var(--arena-silver)] sm:text-base">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          ))}
        </div>

        <p
          data-reveal
          className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-[var(--arena-steel)] sm:text-sm"
        >
          {t("s6.note")}
        </p>
      </div>
    </SlideShell>
  );
}
