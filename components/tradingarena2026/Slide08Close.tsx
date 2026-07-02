"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

/* The close. Monumental chrome statement, fine-print compliance note, then a
   final beat: a chrome hairline draws across the full width and the AXIS
   wordmark settles in underneath — a handshake, not a CTA. */
export default function Slide08Close({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const signoff = root.querySelector<HTMLElement>("[data-signoff]");
    const rule = root.querySelector<HTMLElement>("[data-rule]");
    const mark = root.querySelector<HTMLElement>("[data-wordmark]");
    const tag = root.querySelector<HTMLElement>("[data-tagline]");
    if (!signoff || !rule) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: signoff,
        start: "top 92%",
        toggleActions: "play none none reverse",
      },
    });

    tl.from(rule, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.6,
      ease: "power3.inOut",
    });
    if (mark) {
      tl.from(
        mark,
        { autoAlpha: 0, y: 26, letterSpacing: "0.6em", duration: 1.1 },
        "-=0.7",
      );
    }
    if (tag) {
      tl.from(tag, { autoAlpha: 0, y: 14, duration: 0.9 }, "-=0.75");
    }
  });

  return (
    <SlideShell index={index} kicker={t("kicker.08")} id="slide-08">
      <div ref={ref} className="flex flex-col gap-8 sm:gap-10">
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-6xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl"
        >
          {t("s8.h2")}
        </h2>

        <p
          data-reveal
          className="max-w-3xl text-2xl font-semibold leading-snug text-[var(--arena-white)] sm:text-3xl"
        >
          {t("s8.lead")}
        </p>

        <p
          data-reveal
          className="max-w-2xl text-base leading-relaxed text-[var(--arena-silver)] sm:text-lg"
        >
          {t("s8.p")}
        </p>

        <div data-reveal className="arena-panel max-w-2xl rounded-md px-5 py-4">
          <p className="text-xs leading-relaxed text-[var(--arena-steel)]">
            {t("s8.note")}
          </p>
        </div>

        {/* Final beat: chrome rule + wordmark sign-off */}
        <div data-signoff className="mt-8 sm:mt-14">
          <div
            data-rule
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(244,245,247,0.85) 18%, #ffffff 50%, rgba(244,245,247,0.85) 82%, transparent)",
              boxShadow: "0 0 18px rgba(244,245,247,0.35)",
            }}
          />
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
            <span
              data-wordmark
              className="arena-chrome inline-block text-3xl font-black tracking-[0.22em] sm:text-4xl"
            >
              AXIS
            </span>
            <span
              data-tagline
              className="inline-block text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-[var(--arena-steel)]"
            >
              Trading Arena — 2026
            </span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
