"use client";

import Link from "next/link";

export default function HomeCollectSection() {
  return (
    <section id="collect" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">

          {/* Left — explanation */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">On-Site</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Collect App
            </h2>

            <p className="mt-8 text-sm leading-7 text-white/44 sm:text-[15px] sm:leading-8 max-w-xl">
              At every live AXIS episode, NFC tags are activated across the venue. Tap your phone to any tag to enter the collect area — a real-time surface for episode-bound artifacts, limited editions, and access keys.
            </p>
            <p className="mt-5 text-sm leading-7 text-white/44 sm:text-[15px] sm:leading-8 max-w-xl">
              Each tag links directly to the item it represents. No app to download. Wallet-native, on-chain delivery.
            </p>

            {/* How it works — 3 steps */}
            <div className="mt-10 grid gap-px bg-white/6 sm:grid-cols-3 max-w-xl">
              {[
                { step: "01", label: "Arrive at a AXIS episode" },
                { step: "02", label: "Find and tap an NFC tag" },
                { step: "03", label: "Collect your artifact on-chain" },
              ].map(({ step, label }) => (
                <div key={step} className="flex flex-col gap-3 bg-black px-5 py-5">
                  <span className="[font-family:var(--font-display)] text-lg tracking-[-0.04em] text-white/18">{step}</span>
                  <span className="text-[11px] leading-5 tracking-wide text-white/48">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/arapp/collect"
                className="inline-flex items-center gap-3 border border-white/14 px-8 py-3.5 text-[10px] uppercase tracking-[0.38em] text-white/52 transition-all hover:border-white/28 hover:text-white/82"
              >
                Visit Collect Area
                <span className="text-white/28">↗</span>
              </Link>
            </div>
          </div>

          {/* Right — visual indicator */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center border border-white/8 sm:h-80 sm:w-80">
              {/* Pulsing rings */}
              <div className="absolute inset-0 animate-ping border border-white/[0.04] [animation-duration:3s]" />
              <div className="absolute inset-4 animate-ping border border-white/[0.06] [animation-duration:3s] [animation-delay:0.5s]" />
              <div className="absolute inset-8 animate-ping border border-white/[0.08] [animation-duration:3s] [animation-delay:1s]" />

              {/* Center */}
              <div className="relative flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center border border-white/16">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-[8px] uppercase tracking-[0.44em] text-white/22">NFC</span>
                <span className="text-[7px] uppercase tracking-[0.32em] text-white/14">Tap to collect</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
