"use client";

import { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Mixtape } from "./types";
import type { AudioMeta } from "./hooks/useAllMetadata";

const HydraBackground = dynamic(() => import("./HydraBackground"), { ssr: false });
const MixtapeDisc = dynamic(() => import("./MixtapeDisc"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  mixtapes: Mixtape[];
  selected: number;
  playing: boolean;
  onSelect: (idx: number) => void;
  metaMap: Record<number, AudioMeta>;
};

export default function MixtapeSelector({
  mixtapes,
  selected,
  playing,
  onSelect,
  metaMap,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => onSelect(Math.max(0, selected - 1)), [selected, onSelect]);
  const next = useCallback(
    () => onSelect(Math.min(mixtapes.length - 1, selected + 1)),
    [selected, mixtapes.length, onSelect],
  );

  // Scroll active row into view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${selected}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const mix = mixtapes[selected];
  const meta = metaMap[selected];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]" style={{ minHeight: 480 }}>

      {/* ══ LEFT — Hydra bg + 3D disc ═══════════════════════════════════════ */}
      <div
        className="relative overflow-hidden border-b border-white/6 lg:border-b-0 lg:border-r"
        style={{ minHeight: 320 }}
      >
        {/* Subtle scan-line texture */}
        <div className="mixtape-scanlines pointer-events-none absolute inset-0" style={{ zIndex: 5 }} />

        {/* Layer 0 — Hydra generative visual */}
        <HydraBackground sketchIndex={mix.sketchIndex} playing={playing} />

        {/* Layer 1 — radial vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
            zIndex: 1,
          }}
        />

        {/* Layer 2 — 3D disc (transparent canvas) */}
        <MixtapeDisc
          accentColor={mix.accentColor}
          mixtapeIndex={selected}
          coverArtUrl={meta?.coverArt}
        />

        {/* Layer 3 — PSX corner brackets */}
        <div
          className="pointer-events-none absolute inset-5 sm:inset-6"
          style={{ zIndex: 6 }}
        >
          <div className="mixtape-corner absolute top-0 left-0 h-5 w-5 border-t border-l border-white/20" />
          <div className="mixtape-corner absolute top-0 right-0 h-5 w-5 border-t border-r border-white/20" />
          <div className="mixtape-corner absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/20" />
          <div className="mixtape-corner absolute bottom-0 right-0 h-5 w-5 border-b border-r border-white/20" />
        </div>

        {/* Layer 4 — artist / episode label at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 pb-5"
          style={{ zIndex: 7 }}
        >
          <p className="text-[8px] uppercase tracking-[0.46em] text-white/35">
            {meta?.artist ?? mix.artist}
          </p>
          <p className="text-[7px] uppercase tracking-[0.32em] text-white/18">{mix.episode}</p>
        </div>

        {/* Playing pulse indicator — top left */}
        {playing && (
          <div
            className="absolute top-5 left-5 flex items-center gap-2"
            style={{ zIndex: 8 }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
            <span className="text-[6px] uppercase tracking-[0.4em] text-white/28">Live</span>
          </div>
        )}
      </div>

      {/* ══ RIGHT — PSX selection list ══════════════════════════════════════ */}
      <div className="flex flex-col">

        {/* Header row */}
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-3.5">
          <span className="text-[8px] uppercase tracking-[0.46em] text-white/22">
            Select Transmission
          </span>
          <span className="tabular-nums text-[8px] uppercase tracking-[0.34em] text-white/16">
            {selected + 1}&thinsp;/&thinsp;{mixtapes.length}
          </span>
        </div>

        {/* List */}
        <div ref={listRef} className="scrollbar-none flex-1 overflow-y-auto">
          {mixtapes.map((m, i) => {
            const isActive = i === selected;
            const mMeta = metaMap[i];
            return (
              <button
                key={m.id}
                data-idx={i}
                onClick={() => onSelect(i)}
                className={`group relative flex w-full items-center gap-3 border-b border-white/[0.045] px-5 py-3.5 text-left transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.042] mixtape-row-active"
                    : "hover:bg-white/[0.016]"
                }`}
              >
                {/* Active accent line */}
                {isActive && (
                  <span className="mixtape-active-line absolute inset-y-0 left-0 w-[2px]" />
                )}

                {/* PSX cursor */}
                <span
                  className={`flex-none text-[9px] text-white/55 transition-all duration-200 ${
                    isActive ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                  }`}
                >
                  ▶
                </span>

                {/* Number */}
                <span className="flex-none tabular-nums text-[9px] tracking-[0.28em] text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Thumbnail — cover art or accent swatch */}
                {mMeta?.coverArt ? (
                  <img
                    src={mMeta.coverArt}
                    alt=""
                    className="h-8 w-8 flex-none object-cover opacity-70 transition-opacity group-hover:opacity-88"
                    style={{ filter: "grayscale(15%)" }}
                  />
                ) : (
                  <span
                    className="h-8 w-8 flex-none border border-white/6"
                    style={{ background: m.color }}
                  />
                )}

                {/* Track info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs leading-tight tracking-wide transition-colors duration-200 ${
                      isActive
                        ? "text-white/85"
                        : "text-white/38 group-hover:text-white/60"
                    }`}
                  >
                    {mMeta?.title ?? m.title}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] uppercase tracking-[0.28em] text-white/24">
                    {mMeta?.artist ?? m.artist}
                  </p>
                </div>

                {/* Episode badge (hidden on xs) */}
                <span className="hidden flex-none border border-white/8 px-1.5 py-px text-[7px] uppercase tracking-[0.20em] text-white/18 sm:inline">
                  {m.episode}
                </span>
              </button>
            );
          })}
        </div>

        {/* PSX nav footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
          <div className="flex gap-5">
            <button
              onClick={prev}
              disabled={selected === 0}
              className="text-[8px] uppercase tracking-[0.34em] text-white/24 transition-colors hover:text-white/54 disabled:opacity-20"
            >
              ↑ Prev
            </button>
            <button
              onClick={next}
              disabled={selected === mixtapes.length - 1}
              className="text-[8px] uppercase tracking-[0.34em] text-white/24 transition-colors hover:text-white/54 disabled:opacity-20"
            >
              ↓ Next
            </button>
          </div>
          <span className="text-[7px] uppercase tracking-[0.30em] text-white/12">
            ↑ ↓ or arrow keys
          </span>
        </div>
      </div>

    </div>
  );
}
