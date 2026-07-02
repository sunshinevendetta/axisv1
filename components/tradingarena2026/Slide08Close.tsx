"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SlideShell from "./SlideShell";
import { useReveal } from "./useReveal";
import type { SlideProps } from "./content";

gsap.registerPlugin(ScrollTrigger);

/* Equity curve — the pitch's trajectory. Mono line ending high, with one red
   drawdown dip mid-curve for realism (red = data, never decoration). */
const CURVE_D =
  "M0 118 C60 112 90 116 130 106 S210 88 250 92 S330 74 380 70 S460 58 500 62 " +
  "L540 88 L566 96 L590 78 S660 52 710 46 S800 34 850 30 S940 20 1000 16";
const DRAWDOWN_D = "M500 62 L540 88 L566 96 L590 78";

/* The close. Chrome statement, fine-print compliance note, then the final
   beat: an equity curve draws upward across the full width, a chrome hairline
   follows, and the AXIS mark settles in — a handshake, not a CTA. */
export default function Slide08Close({ t, index }: SlideProps) {
  const ref = useReveal<HTMLDivElement>(({ root, reduced }) => {
    if (reduced) return;

    const signoff = root.querySelector<HTMLElement>("[data-signoff]");
    const rule = root.querySelector<HTMLElement>("[data-rule]");
    const mark = root.querySelector<HTMLElement>("[data-wordmark]");
    const tag = root.querySelector<HTMLElement>("[data-tagline]");
    const curve = root.querySelector<SVGPathElement>("[data-curve]");
    const drawdown = root.querySelector<SVGPathElement>("[data-drawdown]");
    if (!signoff || !rule) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: signoff,
        start: "top 92%",
        toggleActions: "play none none reverse",
      },
    });

    if (curve) {
      const len = curve.getTotalLength();
      gsap.set(curve, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(curve, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" });
    }
    if (drawdown) {
      tl.from(drawdown, { autoAlpha: 0, duration: 0.5 }, "-=1.1");
    }
    tl.from(
      rule,
      { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "power3.inOut" },
      curve ? "-=0.9" : 0,
    );
    if (mark) {
      tl.from(mark, { autoAlpha: 0, y: 22, duration: 1.0 }, "-=0.6");
    }
    if (tag) {
      tl.from(tag, { autoAlpha: 0, y: 12, duration: 0.8 }, "-=0.65");
    }
  });

  return (
    <SlideShell index={index} kicker={t("kicker.08")} id="slide-08">
      <div ref={ref} className="flex flex-col gap-6 sm:gap-8">
        <h2
          data-reveal
          className="arena-chrome arena-chrome--live text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-3xl"
        >
          {t("s8.h2")}
        </h2>

        <p
          data-reveal
          className="max-w-3xl text-base font-semibold leading-snug text-[var(--arena-white)] lg:text-lg"
        >
          {t("s8.lead")}
        </p>

        <p
          data-reveal
          className="max-w-2xl text-sm leading-relaxed text-[var(--arena-silver)] lg:text-base"
        >
          {t("s8.p")}
        </p>

        <div data-reveal className="arena-panel max-w-2xl rounded-md px-5 py-4">
          <p className="text-xs leading-relaxed text-[var(--arena-steel)]">{t("s8.note")}</p>
        </div>

        {/* Final beat: equity curve + chrome rule + AXIS sign-off */}
        <div data-signoff className="mt-6 sm:mt-10">
          <svg
            viewBox="0 0 1000 140"
            className="h-24 w-full sm:h-28"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              data-curve
              d={CURVE_D}
              fill="none"
              stroke="#f4f5f7"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(244,245,247,0.45))" }}
            />
            <path
              data-drawdown
              d={DRAWDOWN_D}
              fill="none"
              stroke="var(--arena-red)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          </svg>

          <div
            data-rule
            className="mt-6 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(244,245,247,0.85) 18%, #ffffff 50%, rgba(244,245,247,0.85) 82%, transparent)",
              boxShadow: "0 0 18px rgba(244,245,247,0.35)",
            }}
          />
          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <span data-wordmark className="inline-block">
              <Image
                src="/logow.svg"
                alt="AXIS"
                width={150}
                height={109}
                className="h-auto w-[110px] sm:w-[150px]"
              />
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
