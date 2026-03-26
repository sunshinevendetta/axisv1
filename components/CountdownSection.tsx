"use client";

import { useCallback, useEffect, useState } from "react";

export type CountdownEpisode = {
  title: string;
  startsAtISO: string;
  city: string;
};

type CountdownProps = {
  episodes: CountdownEpisode[];
};

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: number): TimeLeft | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;
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

function formatCountdownDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd} · ${mm} · ${yyyy}`;
}

function findCurrentEpisode(episodes: CountdownEpisode[]): CountdownEpisode | undefined {
  const now = Date.now();
  return episodes.find((ep) => {
    const t = new Date(ep.startsAtISO).getTime();
    return !isNaN(t) && t > now;
  });
}

export default function CountdownSection({ episodes }: CountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<CountdownEpisode | undefined>(() => findCurrentEpisode(episodes));
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  const tick = useCallback(() => {
    const ep = findCurrentEpisode(episodes);
    if (!ep) {
      setCurrent(undefined);
      setTimeLeft(null);
      return;
    }
    if (ep !== current) setCurrent(ep);
    setTimeLeft(getTimeLeft(new Date(ep.startsAtISO).getTime()));
  }, [episodes, current]);

  useEffect(() => {
    setMounted(true);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (!current || !timeLeft) {
    return (
      <section className="flex flex-col items-center justify-center bg-black px-6 py-24 text-center">
        <p className="text-[9px] uppercase tracking-[0.45em] text-white/32">
          next episode loading
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center bg-black px-6 py-24 text-center">
      <p className="mb-4 text-[9px] uppercase tracking-[0.45em] text-white/32">
        next episode
      </p>

      <h2
        className="text-[clamp(1.4rem,4vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {current.title}
      </h2>

      <p className="mt-3 text-[9px] uppercase tracking-[0.42em] text-white/42">
        {formatCountdownDate(current.startsAtISO)} · {current.city}
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
