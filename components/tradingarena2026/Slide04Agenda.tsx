"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { ArenaKey, SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

/* Times are literal (non-translated) values from
   public/tradingarena/arena-horizontal.html — do not localize. */
const ROWS: ReadonlyArray<{ time: string; b: ArenaKey; s: ArenaKey }> = [
  { time: "16:00", b: "s4.r1.b", s: "s4.r1.s" },
  { time: "16:15", b: "s4.r2.b", s: "s4.r2.s" },
  { time: "16:30", b: "s4.r3.b", s: "s4.r3.s" },
  { time: "20:30", b: "s4.r4.b", s: "s4.r4.s" },
  { time: "21:00", b: "s4.r5.b", s: "s4.r5.s" },
  { time: "22:00", b: "s4.r6.b", s: "s4.r6.s" },
];

/* Slide 04 — Agenda. Vertical timeline: engraved chrome times, a hairline
   spine that draws downward with scroll (scrubbed scaleY), and nodes that
   ignite as each row reveals. Markup defaults to the "final" lit state so
   reduced-motion users see the finished composition. */
export default function Slide04Agenda({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const agenda = root.querySelector<HTMLElement>("[data-agenda]");
    const spine = root.querySelector<HTMLElement>("[data-spine]");

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
  });

  return (
    <SlideShell index={index} kicker={t("kicker.04")} id="slide-04">
      <div ref={ref}>
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
        >
          {t("s4.h2")}
        </h2>

        <div data-agenda className="relative mt-12 sm:mt-16">
          {/* Spine rail: faint hairline base + bright chrome line drawn by scroll. */}
          <div
            aria-hidden
            className="absolute bottom-2 left-[7.5rem] top-2 w-px -translate-x-1/2 bg-[var(--arena-line)]"
          >
            <div
              data-spine
              className="h-full w-full origin-top bg-gradient-to-b from-[var(--arena-white)] via-[var(--arena-silver)] to-[var(--arena-steel)]"
            />
          </div>

          <ol className="space-y-9 sm:space-y-11">
            {ROWS.map((row) => (
              <li
                key={row.time}
                data-reveal
                className="grid grid-cols-[5.5rem_2rem_1fr] items-start gap-x-4"
              >
                <span className="arena-chrome pt-0.5 text-right text-xl font-black leading-none tracking-tight tabular-nums sm:text-2xl">
                  {row.time}
                </span>
                <span className="flex justify-center pt-[0.45rem]">
                  <span
                    data-node
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full border border-[var(--arena-white)] bg-[var(--arena-white)] shadow-[0_0_18px_rgba(244,245,247,0.55)]"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold uppercase tracking-wide text-[var(--arena-white)] sm:text-xl">
                    {t(row.b)}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--arena-steel)] sm:text-base">
                    {t(row.s)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SlideShell>
  );
}
