"use client";

import { useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

type OptionId = "a" | "b";

const OPTIONS: ReadonlyArray<{
  id: OptionId;
  letter: string;
  ref: string;
  h3: ArenaKey;
  items: ArenaKey[];
  reveal: "left" | "right";
  panelStyle: CSSProperties;
  /* Cost-structure allocation — decorative data, mono fills. */
  alloc: Array<{ label: string; pct: number; tone: string }>;
}> = [
  {
    id: "a",
    letter: "A",
    ref: "REF 2026-A",
    h3: "s6.a.h3",
    items: ["s6.a.li1", "s6.a.li2", "s6.a.li3", "s6.a.li4", "s6.a.li5"],
    reveal: "left",
    /* Lighter, chrome-edged panel. Inline style wins over .arena-panel. */
    panelStyle: {
      background:
        "linear-gradient(165deg, rgba(255,255,255,0.16), rgba(255,255,255,0.045) 45%, rgba(0,0,0,0.28))",
    },
    alloc: [
      { label: "VENUE", pct: 34, tone: "#e6e8ec" },
      { label: "DRINKS", pct: 26, tone: "#aeb3bb" },
      { label: "FOOD", pct: 18, tone: "#7d828a" },
      { label: "STAFF", pct: 14, tone: "#565b63" },
      { label: "NIGHT", pct: 8, tone: "#3a3e45" },
    ],
  },
  {
    id: "b",
    letter: "B",
    ref: "REF 2026-B",
    h3: "s6.b.h3",
    items: ["s6.b.li1", "s6.b.li2", "s6.b.li3", "s6.b.li4", "s6.b.li5"],
    reveal: "right",
    /* Darker, ink-heavy counterpart. */
    panelStyle: {
      background:
        "linear-gradient(165deg, rgba(255,255,255,0.04), rgba(0,0,0,0.52) 55%, rgba(0,0,0,0.72))",
    },
    alloc: [
      { label: "VENUE", pct: 46, tone: "#e6e8ec" },
      { label: "SPONSORS", pct: 34, tone: "#8d939b" },
      { label: "STAFF", pct: 20, tone: "#4a4e56" },
    ],
  },
];

const ENGRAVED_LETTER: CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1px rgba(244,245,247,0.16)",
  letterSpacing: "-0.05em",
};

/* Slide 06 — the money slide. Two commercial routes as interactive ORDER
   TICKETS split by a hairline seam: tap/click a ticket to weigh it — the
   selected route sharpens, the other recedes. Wrappers carry the directional
   reveal (x-axis); the panels drift on y at different rates (scrubbed
   parallax), so the two transforms never fight. */
export default function Slide06Options({ t, index }: SlideProps) {
  const [selected, setSelected] = useState<OptionId | null>(null);

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
          className="arena-chrome arena-chrome--live max-w-4xl text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase tracking-tight"
        >
          {t("s6.h2")}
        </h2>

        <div className="relative mt-10 grid gap-6 sm:mt-12 lg:grid-cols-2 lg:gap-12">
          {/* The seam of the fork. */}
          <div
            aria-hidden
            className="absolute bottom-6 left-1/2 top-6 hidden w-px -translate-x-1/2 bg-[var(--arena-line)] lg:block"
          >
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--arena-silver)] bg-[var(--arena-black)]" />
          </div>

          {OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            const isDimmed = selected !== null && !isSelected;
            return (
              <div key={option.id} data-reveal={option.reveal}>
                <article
                  data-option={option.id}
                  onClick={() => setSelected(isSelected ? null : option.id)}
                  className={[
                    "arena-panel relative h-full cursor-pointer overflow-hidden p-6 sm:p-8",
                    "transition-[opacity,border-color,box-shadow] duration-500",
                    isDimmed ? "opacity-55" : "opacity-100",
                  ].join(" ")}
                  style={{
                    ...option.panelStyle,
                    borderColor: isSelected
                      ? "rgba(244,245,247,0.65)"
                      : option.id === "a"
                        ? "rgba(244,245,247,0.38)"
                        : "rgba(244,245,247,0.12)",
                    boxShadow: isSelected ? "0 0 42px rgba(244,245,247,0.12)" : "none",
                  }}
                >
                  {/* Engraved fork letter. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-3 right-3 select-none text-[4rem] font-black leading-none sm:text-[5rem]"
                    style={ENGRAVED_LETTER}
                  >
                    {option.letter}
                  </span>

                  {/* Ticket header. */}
                  <div className="relative flex items-center justify-between border-b border-[var(--arena-line)] pb-3 font-mono text-[0.6rem] tracking-[0.24em] text-[var(--arena-steel)]">
                    <span>ORDER TICKET</span>
                    <span className="flex items-center gap-3">
                      {option.ref}
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(isSelected ? null : option.id);
                        }}
                        className={[
                          "border px-2 py-0.5 tracking-[0.24em] transition-colors duration-300",
                          isSelected
                            ? "border-[var(--arena-white)] bg-[var(--arena-white)] text-[var(--arena-black)]"
                            : "border-[var(--arena-line)] text-[var(--arena-silver)] hover:border-[var(--arena-silver)]",
                        ].join(" ")}
                      >
                        {isSelected ? "FILLED" : "SELECT"}
                      </button>
                    </span>
                  </div>

                  <h3 className="relative mt-5 max-w-[85%] text-base font-black uppercase tracking-tight text-[var(--arena-white)] sm:text-lg">
                    {t(option.h3)}
                  </h3>

                  <ul className="relative mt-5 divide-y divide-[var(--arena-line)]">
                    {option.items.map((key) => (
                      <li key={key} data-reveal className="flex items-start gap-4 py-3 sm:py-3.5">
                        <span
                          aria-hidden
                          className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--arena-silver)]"
                        />
                        <span className="text-sm leading-relaxed text-[var(--arena-silver)]">
                          {t(key)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Cost-structure allocation bar — decorative data. */}
                  <div className="relative mt-6 font-mono text-[0.55rem] tracking-[0.18em] text-[var(--arena-steel)]">
                    <div className="mb-2 flex justify-between">
                      <span>ALLOC</span>
                      <span>100%</span>
                    </div>
                    <div className="flex h-1.5 w-full gap-px overflow-hidden">
                      {option.alloc.map((seg) => (
                        <div
                          key={seg.label}
                          className="h-full transition-[filter] duration-500"
                          style={{
                            width: `${seg.pct}%`,
                            background: seg.tone,
                            filter: isSelected ? "brightness(1.25)" : "brightness(0.8)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {option.alloc.map((seg) => (
                        <span key={seg.label} className="flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5"
                            style={{ background: seg.tone }}
                          />
                          {seg.label} {seg.pct}%
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
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
