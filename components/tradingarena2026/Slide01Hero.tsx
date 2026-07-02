"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Slide 01 — the opener. Monumental liquid-chrome "Trading Arena" with a
   mount-time cinematic build (no scroll dependency): hairline rules draw in,
   the headline rises out of a clipping mask, the sub and statement lines fade
   up, then a looping scroll cue appears. A scrubbed exit parallax fades the
   whole stack as the user scrolls on. Translated strings stay in single
   wrappers so language swaps happen in place. */
export default function Slide01Hero({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const q = gsap.utils.selector(root);

    /* Entrance — plays on mount, not on scroll. */
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(
      q("[data-hero-rule]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: "power3.inOut", stagger: 0.15 },
      0,
    )
      .fromTo(
        q("[data-hero-h1]"),
        { yPercent: 115 },
        { yPercent: 0, duration: 1.5 },
        0.2,
      )
      .fromTo(
        q("[data-hero-lead]"),
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 1.1 },
        0.8,
      )
      .fromTo(
        q("[data-hero-line]"),
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.18 },
        1,
      )
      .fromTo(
        q("[data-hero-cue]"),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.9, ease: "power2.out" },
        1.6,
      );

    /* Scroll cue: a light dot endlessly travels down its hairline track. */
    gsap.fromTo(
      q("[data-hero-cue-dot]"),
      { y: -14 },
      {
        y: 56,
        duration: 1.7,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.45,
        delay: 1.8,
      },
    );

    /* Exit parallax: the hero recedes and dims as the deck scrolls on. */
    const section = root.closest("section");
    if (section) {
      gsap.to(root, {
        yPercent: -10,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom 25%",
          scrub: true,
        },
      });
    }
  });

  return (
    <SlideShell index={index} kicker={t("kicker.01")} id="slide-01">
      <div ref={ref} className="flex flex-col">
        {/* Top hairline */}
        <div
          data-hero-rule
          aria-hidden
          className="h-px origin-left bg-gradient-to-r from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        {/* Monumental chrome headline inside a clipping mask */}
        <div className="mt-10 overflow-hidden pb-3 sm:mt-14">
          <h1
            data-hero-h1
            className="arena-chrome arena-chrome--live text-[clamp(3.4rem,11.5vw,9.5rem)] font-black uppercase leading-[0.92] tracking-[-0.035em]"
          >
            {t("s1.h1")}
          </h1>
        </div>

        {/* Lead */}
        <p
          data-hero-lead
          className="mt-8 max-w-3xl text-xl font-light leading-snug text-[var(--arena-silver)] sm:text-2xl lg:text-3xl"
        >
          {t("s1.lead")}
        </p>

        {/* Statement lines */}
        <div className="mt-10 flex max-w-3xl flex-col gap-5 border-l border-[var(--arena-line)] pl-6">
          <p
            data-hero-line
            className="text-base leading-relaxed text-[var(--arena-steel)] sm:text-lg"
          >
            <strong className="font-semibold text-[var(--arena-white)]">
              {t("s1.p1.strong")}
            </strong>
            <span>{t("s1.p1.rest")}</span>
          </p>
          <p
            data-hero-line
            className="text-base leading-relaxed text-[var(--arena-steel)] sm:text-lg"
          >
            <strong className="font-semibold text-[var(--arena-white)]">
              {t("s1.p2.strong")}
            </strong>
            <span>{t("s1.p2.rest")}</span>
          </p>
        </div>

        {/* Bottom hairline */}
        <div
          data-hero-rule
          aria-hidden
          className="mt-12 h-px origin-right bg-gradient-to-l from-[var(--arena-silver)] via-[var(--arena-line)] to-transparent"
        />

        {/* Scroll cue — purely visual, no copy needed */}
        <div
          data-hero-cue
          aria-hidden
          className="pointer-events-none mt-14 flex flex-col items-center gap-3 self-center"
        >
          <span className="relative block h-14 w-px overflow-hidden bg-[var(--arena-line)]">
            <span
              data-hero-cue-dot
              className="absolute left-0 top-0 block h-3.5 w-px bg-[var(--arena-white)]"
            />
          </span>
          <span className="block h-1.5 w-1.5 rotate-45 border-b border-r border-[var(--arena-steel)]" />
        </div>
      </div>
    </SlideShell>
  );
}
