"use client";

import { useEffect, useState } from "react";

// Target: SPECTRA 4.0 — 21 March 2026, 18:00 CST (UTC-6)
const TARGET_DATE = new Date("2026-03-21T18:00:00-06:00");

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(): TimeLeft {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownSection() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center bg-black px-6 py-24 text-center">
      <p className="mb-4 text-[9px] uppercase tracking-[0.45em] text-white/32">
        next episode
      </p>

      <h2
        className="text-[clamp(1.4rem,4vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        SPECTRA 4.0
      </h2>

      <p className="mt-3 text-[9px] uppercase tracking-[0.42em] text-white/42">
        21 · 03 · 2026 · CDMX
      </p>

      <div className="mt-12 flex items-end gap-6 sm:gap-12">
        {(
          [
            { value: timeLeft.days, label: "DAYS" },
            { value: timeLeft.hours, label: "HRS" },
            { value: timeLeft.minutes, label: "MIN" },
            { value: timeLeft.seconds, label: "SEC" },
          ] as const
        ).map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="text-[clamp(2rem,6vw,4rem)] leading-none tabular-nums tracking-tight text-white">
              {mounted ? pad(value) : "00"}
            </span>
            <span className="text-[8px] uppercase tracking-[0.32em] text-white/30">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
