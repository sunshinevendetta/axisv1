"use client";

import Shuffle from "./Shuffle";
import EpisodesCards from "./EpisodesCards";
import PrismaticBurstBackground from "./backgrounds/EpisodesBackground";

export default function EpisodesSection() {
  return (
    <section id="episodes" className="relative isolate min-h-screen overflow-hidden bg-black">
      <PrismaticBurstBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.4)_34%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.92)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-28 pb-20 sm:pt-32">
        <div className="px-6 text-center">
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
            tag="h2"
          />
        </div>

        <EpisodesCards />
      </div>
    </section>
  );
}
