"use client";

import Shuffle from "./Shuffle";
import EpisodesCards from "./EpisodesCards";
import PrismaticBurstBackground from "./backgrounds/PrismaticBurstBackground";

export default function EpisodesSection() {
  return (
    <section
      id="episodes"
      className="w-full min-h-screen flex flex-col items-center justify-start pt-32 pb-20 overflow-x-hidden relative"
    >
      <PrismaticBurstBackground />

      <Shuffle
        text="episodes"
        shuffleDirection="right"
        duration={0.4}
        animationMode="evenodd"
        shuffleTimes={1}
        ease="power3.out"
        stagger={0.03}
        threshold={0.1}
        triggerOnce={true}
        triggerOnHover={false}
        respectReducedMotion={true}
      />

      <EpisodesCards />
    </section>
  );
}
