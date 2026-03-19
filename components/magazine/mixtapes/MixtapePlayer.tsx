"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mixtape } from "./types";
import type { AudioMeta } from "./hooks/useAllMetadata";

type Props = {
  mixtape: Mixtape;
  meta: AudioMeta | null;
  onPlayStateChange: (playing: boolean) => void;
};

function fmtTime(s: number): string {
  if (!s || isNaN(s) || !isFinite(s)) return "—:——";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function MixtapePlayer({ mixtape, meta, onPlayStateChange }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.82);
  const [loading, setLoading] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);

  // Reset on mixtape change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = mixtape.audioUrl;
    audio.load();
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setLoading(false);
    onPlayStateChange(false);
  }, [mixtape.id, mixtape.audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      setLoading(true);
      audio.play().catch(() => setLoading(false));
    }
  }, [playing]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };

  const displayTitle = meta?.title ?? mixtape.title;
  const displayArtist = meta?.artist ?? mixtape.artist;
  const coverArt = meta?.coverArt;

  return (
    <div className="flex flex-col">

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={mixtape.audioUrl}
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a) return;
          setCurrentTime(a.currentTime);
          setProgress(a.duration ? a.currentTime / a.duration : 0);
        }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a) setDuration(a.duration);
          setLoading(false);
        }}
        onPlay={() => { setPlaying(true); setLoading(false); onPlayStateChange(true); }}
        onPause={() => { setPlaying(false); onPlayStateChange(false); }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrentTime(0);
          onPlayStateChange(false);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />

      {/* ── Main player row ──────────────────────────────────────────────── */}
      {/* Desktop: single horizontal bar. Mobile: stacked sections. */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">

        {/* Track info — cover art + title + artist */}
        <div className="flex min-w-0 items-center gap-4 border-b border-white/6 px-6 py-4 lg:w-[220px] lg:flex-none lg:border-b-0 lg:border-r">
          {coverArt ? (
            <img
              src={coverArt}
              alt=""
              className="h-10 w-10 flex-none object-cover opacity-80"
            />
          ) : (
            <span
              className="h-10 w-10 flex-none border border-white/8"
              style={{ background: mixtape.color }}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[7px] uppercase tracking-[0.44em] text-white/18">
              Now Playing
            </p>
            <p className="truncate text-xs leading-tight tracking-wide text-white/82">
              {displayTitle}
            </p>
            <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.26em] text-white/36">
              {displayArtist}
            </p>
          </div>
        </div>

        {/* Progress bar + time */}
        <div className="flex flex-1 flex-col justify-center border-b border-white/6 px-6 py-5 lg:border-b-0 lg:border-r">
          <div
            className="group relative h-px w-full cursor-pointer bg-white/10"
            onClick={seek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/45 transition-none"
              style={{ width: `${progress * 100}%` }}
            />
            {/* Scrub thumb */}
            <div
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75 opacity-0 shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-opacity group-hover:opacity-100"
              style={{ left: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="tabular-nums text-[8px] tracking-wide text-white/22">
              {fmtTime(currentTime)}
            </span>
            <span className="tabular-nums text-[8px] tracking-wide text-white/22">
              {fmtTime(duration)}
            </span>
          </div>
        </div>

        {/* Play / pause + equalizer + state */}
        <div className="flex items-center gap-5 border-b border-white/6 px-6 py-4 lg:flex-none lg:border-b-0 lg:border-r">
          <button
            onClick={togglePlay}
            disabled={loading}
            className="flex h-10 w-10 flex-none items-center justify-center border border-white/16 text-white transition-all hover:border-white/38 hover:shadow-[0_0_14px_rgba(255,255,255,0.08)] disabled:opacity-40"
            aria-label={playing ? "Pause" : "Play"}
          >
            {loading ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white/70" />
            ) : (
              <span className="text-xs">{playing ? "⏸" : "▶"}</span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {playing && (
              <div className="flex h-4 items-end gap-px">
                {[1, 2, 3, 4, 3].map((h, i) => (
                  <span
                    key={i}
                    className="inline-block w-0.5 rounded-sm bg-white/45"
                    style={{
                      height: `${h * 3}px`,
                      animation: `equalizerBar ${0.5 + i * 0.08}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <span className="text-[8px] uppercase tracking-[0.36em] text-white/20">
              {loading ? "Loading…" : playing ? "Transmitting" : "Ready"}
            </span>
          </div>
        </div>

        {/* Volume + meta badges */}
        <div className="flex items-center justify-between gap-6 px-6 py-4 lg:flex-none lg:gap-8">
          <div className="flex items-center gap-2.5">
            <span className="text-[7px] uppercase tracking-[0.34em] text-white/18">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-px w-16 cursor-pointer appearance-none bg-white/12 accent-white/50"
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="border border-white/8 px-1.5 py-px text-[7px] uppercase tracking-[0.20em] text-white/18">
              {mixtape.episode}
            </span>
            <p className="text-[7px] uppercase tracking-[0.28em] text-white/12">
              Grove · Base
            </p>
          </div>
        </div>

      </div>

      {/* ── Tracklist (collapsible) ──────────────────────────────────────── */}
      {mixtape.tracklist.length > 0 && (
        <div className="border-t border-white/5 px-6 py-4">
          <button
            onClick={() => setShowTracklist((v) => !v)}
            className="text-[9px] uppercase tracking-[0.34em] text-white/26 transition-colors hover:text-white/52"
          >
            {showTracklist ? "Tracklist −" : "Tracklist +"}
          </button>
          {showTracklist && (
            <div className="mt-4 space-y-2">
              {mixtape.tracklist.map((track, i) => (
                <p key={i} className="text-xs leading-5 tracking-wide text-white/32">
                  {track}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tags ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {mixtape.tags.map((tag) => (
            <span
              key={tag}
              className="border border-white/6 px-2 py-0.5 text-[7px] uppercase tracking-[0.22em] text-white/18"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes equalizerBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
