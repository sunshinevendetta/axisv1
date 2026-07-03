"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSiteLanguage } from "@/components/site-language";
import { makeT } from "./content";
import ArenaScene from "./ArenaScene";
import TickerTape from "./TickerTape";
import Slide01Hero from "./Slide01Hero";
import Slide02Concept from "./Slide02Concept";
import Slide03Categories from "./Slide03Categories";
import Slide04Agenda from "./Slide04Agenda";
import Slide05Venue from "./Slide05Venue";
import Slide06Options from "./Slide06Options";
import Slide07System from "./Slide07System";
import Slide08Close from "./Slide08Close";
import RulesDialog from "./RulesDialog";
import "./arena2026.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SLIDES = [
  Slide01Hero,
  Slide02Concept,
  Slide03Categories,
  Slide04Agenda,
  Slide05Venue,
  Slide06Options,
  Slide07System,
  Slide08Close,
] as const;

export default function ArenaDeck2026() {
  const { language } = useSiteLanguage();
  const t = useMemo(() => makeT(language), [language]);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const bar = progressRef.current;
      if (!root || !bar) return;

      gsap.to(bar, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="arena2026 relative min-h-screen antialiased">
      {/* Ambient 3D layer — fixed behind every slide. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <ArenaScene />
      </div>

      {/* Scroll progress rail. */}
      <div
        className="pointer-events-none fixed bottom-8 right-6 top-8 z-30 hidden w-px bg-[var(--arena-line)] sm:block"
        aria-hidden
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-top scale-y-0 bg-gradient-to-b from-[var(--arena-silver)] to-[var(--arena-steel)]"
        />
      </div>

      <main className="relative z-10">
        {SLIDES.map((Slide, i) => (
          <Slide key={i} t={t} language={language} index={i + 1} />
        ))}
      </main>

      <RulesDialog />
      <TickerTape />
    </div>
  );
}
