"use client";

import EpisodesCards from "./EpisodesCards";
import PrismaticBurstBackground from "./backgrounds/EpisodesBackground";

export default function EpisodesSection() {
  return (
    <section id="episodes" className="relative isolate min-h-screen overflow-hidden bg-black">
      <PrismaticBurstBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.4)_34%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.92)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-28 pb-20 sm:pt-32">
        <div className="max-w-3xl px-6 text-center">
          <h2
            className="text-[clamp(1.6rem,4vw,3.25rem)] uppercase leading-[0.9] tracking-[0.00em] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Episodes
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
            Unexpected experiences. Unusual places. <br /> Get on the guestlist for the next one or relive the lastest.
          </p>
        </div>

        <EpisodesCards />
      </div>
    </section>
  );
}
