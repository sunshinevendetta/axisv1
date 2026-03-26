"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Mixtape } from "@/components/magazine/mixtapes/types";

type Props = {
  mixtape: Mixtape | null;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
};

function fmtTime(s: number): string {
  if (!s || isNaN(s) || !isFinite(s)) return "—:——";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function HomePersistentPlayer({ mixtape, isPlaying, onPlayStateChange }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevIdRef = useRef<number | null>(null);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => { setLoading(false); onPlayStateChange(true); };
    const onPause = () => onPlayStateChange(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [onPlayStateChange]);

  // Track change → load + auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !mixtape) return;
    const wasSwitch = prevIdRef.current !== null && prevIdRef.current !== mixtape.id;
    prevIdRef.current = mixtape.id;
    audio.pause();
    audio.src = mixtape.audioUrl;
    audio.load();
    setProgress(0); setCurrentTime(0); setDuration(0);
    if (wasSwitch) {
      setLoading(true);
      audio.play().catch(() => setLoading(false));
    }
  }, [mixtape?.id, mixtape?.audioUrl]);

  // Sync external play/pause commands
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && audio.paused) audio.play().catch(() => {});
    if (!isPlaying && !audio.paused) audio.pause();
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !mixtape) return;
    if (audio.paused) {
      if (!audio.src) { audio.src = mixtape.audioUrl; audio.load(); }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [mixtape]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  }, []);

  if (!mixtape) return null;

  return (
    <div
      className={`fixed inset-x-0 z-[100] border-t border-white/10 bg-[rgba(5,5,7,0.96)] backdrop-blur-xl transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ bottom: "32px" }}
    >
      {/* Scrubber */}
      <div
        className="h-px w-full cursor-pointer bg-white/8 hover:bg-white/14"
        onClick={seek}
      >
        <div
          className="h-full bg-white/40 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:gap-6 sm:px-6">
        {/* Play / pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-8 w-8 flex-none items-center justify-center border border-white/14 text-[11px] text-white/60 transition-colors hover:border-white/28 hover:text-white/90"
        >
          {loading ? (
            <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white/40 border-t-transparent" />
          ) : isPlaying ? (
            "▌▌"
          ) : (
            "▶"
          )}
        </button>

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] uppercase tracking-[0.28em] text-white/62">
            {mixtape.title}
          </div>
          <div className="truncate text-[9px] uppercase tracking-[0.24em] text-white/28">
            {mixtape.artist} · {mixtape.episode}
          </div>
        </div>

        {/* Time */}
        <div className="hidden tabular-nums text-[10px] text-white/28 sm:block">
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </div>

        {/* Open in mixtapes */}
        <Link
          href="/magazine/mixtapes"
          className="hidden text-[8px] uppercase tracking-[0.32em] text-white/22 transition-colors hover:text-white/52 sm:block"
        >
          mixtapes ↗
        </Link>

        {/* Hide / show toggle */}
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          className="flex-none text-[9px] uppercase tracking-[0.28em] text-white/22 transition-colors hover:text-white/52"
          aria-label="Toggle player"
        >
          {hidden ? "show" : "hide"}
        </button>
      </div>
    </div>
  );
}
