"use client";

import Link from "next/link";
import { useSiteLanguage } from "@/components/site-language";
import type { Mixtape } from "@/components/magazine/mixtapes/types";
import { getSiteCopy } from "@/src/lib/site-translations";

type Props = {
  mixtapes: Mixtape[];
  onTrackSelect?: (mixtape: Mixtape) => void;
  activeMixtapeId?: number | null;
  isPlaying?: boolean;
};

export default function HomeMixtapesSection({ mixtapes, onTrackSelect, activeMixtapeId, isPlaying }: Props) {
  const { language } = useSiteLanguage();
  const copy = getSiteCopy(language);
  const displayed = mixtapes.slice(0, 5);

  return (
    <section id="mixtapes" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">{copy.mixtapes.eyebrow}</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              {copy.mixtapes.title}
            </h2>
          </div>
          <Link
            href="/magazine/mixtapes"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            {copy.mixtapes.all}
          </Link>
        </div>

        <div className="divide-y divide-white/6">
          {displayed.map((mix, i) => {
            const isActive = activeMixtapeId === mix.id;
            return (
              <button
                key={mix.id}
                type="button"
                onClick={() => onTrackSelect?.(mix)}
                className={`group flex w-full items-center gap-5 py-5 text-left transition-all duration-200 hover:bg-white/[0.015] sm:gap-7 ${
                  isActive ? "bg-white/[0.025]" : ""
                }`}
              >
                <div className="w-8 flex-none text-center">
                  {isActive && isPlaying ? (
                    <span className="inline-flex h-4 items-end gap-[3px]">
                      <span className="w-[3px] animate-[eq1_0.8s_ease-in-out_infinite] rounded-sm bg-white/70" style={{ height: "60%" }} />
                      <span className="w-[3px] animate-[eq2_0.8s_ease-in-out_infinite_0.1s] rounded-sm bg-white/70" style={{ height: "100%" }} />
                      <span className="w-[3px] animate-[eq1_0.8s_ease-in-out_infinite_0.2s] rounded-sm bg-white/70" style={{ height: "40%" }} />
                    </span>
                  ) : (
                    <span className={`text-[10px] tabular-nums transition-colors ${isActive ? "text-white/60" : "text-white/18 group-hover:text-white/36"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm leading-5 tracking-wide transition-colors ${isActive ? "text-white" : "text-white/68 group-hover:text-white/90"}`}>
                    {mix.title}
                  </div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/28">
                    {mix.artist} · {mix.episode}
                  </div>
                </div>

                <div className="hidden items-center gap-4 sm:flex">
                  {mix.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[8px] uppercase tracking-[0.24em] text-white/18">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[10px] tabular-nums text-white/22">{mix.duration}</span>
                </div>

                <div className={`flex-none text-[10px] transition-opacity ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-30"}`}>
                  {isActive && isPlaying ? "||" : "▶"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 border-t border-white/6 pt-6">
          <p className="text-[9px] uppercase tracking-[0.32em] text-white/18">
            {copy.mixtapes.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
