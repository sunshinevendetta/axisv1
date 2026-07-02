"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

/* Times are literal (non-translated) values from
   public/tradingarena/arena-horizontal.html — do not localize.
   `vol` is a deterministic session volume profile (registration ramp →
   tournament peak → after-party cooldown), 100 = peak. OPEN/CLOSE are
   untranslated trading-jargon graphic labels. */
const ROWS: ReadonlyArray<{
  time: string;
  b: ArenaKey;
  s: ArenaKey;
  vol: number;
  tag?: "OPEN" | "CLOSE";
}> = [
  { time: "16:00", b: "s4.r1.b", s: "s4.r1.s", vol: 32, tag: "OPEN" },
  { time: "16:15", b: "s4.r2.b", s: "s4.r2.s", vol: 48 },
  { time: "16:30", b: "s4.r3.b", s: "s4.r3.s", vol: 100 },
  { time: "20:30", b: "s4.r4.b", s: "s4.r4.s", vol: 76 },
  { time: "21:00", b: "s4.r5.b", s: "s4.r5.s", vol: 54 },
  { time: "22:00", b: "s4.r6.b", s: "s4.r6.s", vol: 38, tag: "CLOSE" },
];

/* Deterministic session price path: vertical time axis (top = 16:00 open,
   bottom = 22:00 close), x = price. One down-leg is overlaid in red — market
   data, the knockout dip. */
const PRICE_PATH =
  "M30 0 L44 55 L26 105 L58 160 L40 210 L86 275 L52 330 L96 385 L70 440 L82 495 L60 545 L72 600";
const DIP_PATH = "M96 385 L70 440";

/* Slide 04 — Agenda as a TRADING SESSION. The 6 rows keep the drawn spine,
   each row carries a volume-profile bar, and a session price chart draws
   itself down the right rail with scroll. Markup defaults to the "final"
   fully-drawn state so reduced-motion users see the finished composition. */
export default function Slide04Agenda({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const agenda = root.querySelector<HTMLElement>("[data-agenda]");
    const spine = root.querySelector<HTMLElement>("[data-spine]");
    const price = root.querySelector<SVGPathElement>("[data-pricepath]");

    if (spine && agenda) {
      gsap.fromTo(
        spine,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: agenda,
            start: "top 78%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        },
      );
    }

    /* Price path draws in lockstep with the spine (pathLength normalized to 1). */
    if (price && agenda) {
      gsap.fromTo(
        price,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: agenda,
            start: "top 78%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        },
      );
    }

    gsap.utils
      .toArray<HTMLElement>(root.querySelectorAll("[data-node]"))
      .forEach((node) => {
        gsap.fromTo(
          node,
          {
            scale: 0.55,
            backgroundColor: "rgba(244, 245, 247, 0)",
            borderColor: "rgba(107, 111, 118, 0.55)",
            boxShadow: "0 0 0px rgba(244, 245, 247, 0)",
          },
          {
            scale: 1,
            backgroundColor: "#f4f5f7",
            borderColor: "#f4f5f7",
            boxShadow: "0 0 18px rgba(244, 245, 247, 0.55)",
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: node,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

    /* Volume-profile bars fill from the left as each row reveals. */
    gsap.utils
      .toArray<HTMLElement>(root.querySelectorAll("[data-vol]"))
      .forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
  });

  return (
    <SlideShell index={index} kicker={t("kicker.04")} id="slide-04">
      <div ref={ref}>
        <div data-reveal className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="arena-chrome arena-chrome--live text-[clamp(1.3rem,2.2vw,1.75rem)] font-black uppercase tracking-tight">
            {t("s4.h2")}
          </h2>
          <span
            aria-hidden
            className="border border-[var(--arena-line)] px-2 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.3em] text-[var(--arena-steel)]"
          >
            SESSION T+0 · 16:00–22:00
          </span>
        </div>

        <div data-agenda className="relative mt-10 sm:mt-12">
          {/* Spine rail: faint hairline base + bright chrome line drawn by scroll. */}
          <div
            aria-hidden
            className="absolute bottom-2 left-[6.5rem] top-2 w-px -translate-x-1/2 bg-[var(--arena-line)]"
          >
            <div
              data-spine
              className="h-full w-full origin-top bg-gradient-to-b from-[var(--arena-white)] via-[var(--arena-silver)] to-[var(--arena-steel)]"
            />
          </div>

          {/* Session price chart: draws top→bottom alongside the timeline. */}
          <svg
            aria-hidden
            viewBox="0 0 120 600"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-y-2 right-0 hidden w-40 lg:block xl:w-52"
          >
            {[100, 200, 300, 400, 500].map((y) => (
              <line
                key={y}
                x1="0"
                x2="120"
                y1={y}
                y2={y}
                stroke="var(--arena-line)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              data-pricepath
              d={PRICE_PATH}
              pathLength={1}
              strokeDasharray="1"
              fill="none"
              stroke="var(--arena-silver)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {/* The knockout down-leg — red as market data, never decoration. */}
            <path
              d={DIP_PATH}
              fill="none"
              stroke="var(--arena-red)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="space-y-8 sm:space-y-10 lg:pr-48 xl:pr-60">
            {ROWS.map((row) => (
              <li
                key={row.time}
                data-reveal
                className="grid grid-cols-[4.75rem_1.75rem_1fr] items-start gap-x-4"
              >
                <span className="arena-chrome pt-0.5 text-right text-xl font-black leading-none tracking-tight tabular-nums">
                  {row.time}
                </span>
                <span className="flex justify-center pt-[0.4rem]">
                  <span
                    data-node
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full border border-[var(--arena-white)] bg-[var(--arena-white)] shadow-[0_0_18px_rgba(244,245,247,0.55)]"
                  />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h3 className="text-base font-bold uppercase tracking-wide text-[var(--arena-white)] lg:text-lg">
                      {t(row.b)}
                    </h3>
                    {row.tag ? (
                      <span
                        aria-hidden
                        className="border border-[var(--arena-line)] px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold tracking-[0.3em] text-[var(--arena-white)]"
                      >
                        {row.tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--arena-steel)] lg:text-base">
                    {t(row.s)}
                  </p>
                  {/* Volume profile: thin horizontal bar, peak row in white. */}
                  <div aria-hidden className="mt-2.5 flex items-center gap-2">
                    <span className="font-mono text-[0.55rem] font-semibold tracking-[0.25em] text-[var(--arena-steel)]">
                      VOL
                    </span>
                    <span className="h-1 w-36 bg-[var(--arena-line)] sm:w-48">
                      <span
                        data-vol
                        className="block h-full origin-left"
                        style={{
                          width: `${row.vol}%`,
                          backgroundColor:
                            row.vol === 100 ? "var(--arena-white)" : "var(--arena-silver)",
                        }}
                      />
                    </span>
                    <span className="font-mono text-[0.55rem] tabular-nums tracking-[0.15em] text-[var(--arena-steel)]">
                      {row.vol}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SlideShell>
  );
}
