"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { EpisodeCanvas } from "@/components/episodes/EpisodeCanvas";
import { EpisodeFallback } from "@/components/episodes/EpisodeFallback";
import { ARSessionButton } from "@/components/episodes/ARSessionButton";
import type { EpisodeAsset } from "@/src/types/episode";

type Props = {
  asset?: EpisodeAsset;
  title: string;
};

function hasRenderableAsset(asset?: EpisodeAsset) {
  return Boolean(asset?.modelUrl);
}

export function EpisodeViewer({ asset, title }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setPlaying(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!asset?.modelUrl) return;
    useGLTF.preload(asset.modelUrl);
  }, [asset?.modelUrl]);

  const canRender = hasRenderableAsset(asset);
  const showPlayOverlay = canRender && !playing && !videoFailed && Boolean(asset?.videoUrl);
  const overlayLabel = useMemo(() => {
    if (!asset?.videoUrl) return "3D episode object";
    return videoReady ? "Pause texture" : "Play texture";
  }, [asset?.videoUrl, videoReady]);

  if (!canRender) {
    return <EpisodeFallback title={title} posterUrl={asset?.posterUrl} compact />;
  }

  return (
    <div ref={containerRef} className="relative aspect-square overflow-hidden border border-white/8 bg-black/60">
      <EpisodeCanvas
        asset={asset!}
        playing={playing}
        visible={isVisible}
        arActive={arActive}
        onVideoReadyChange={(ready) => {
          setVideoReady(ready);
          if (!ready && !asset?.videoUrl) {
            setVideoFailed(false);
          }
        }}
        onVideoError={() => {
          setVideoFailed(true);
          setPlaying(false);
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />

      {showPlayOverlay && (
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          className="absolute inset-x-4 bottom-4 z-10 border border-white/16 bg-black/48 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-white/12"
        >
          <div className="text-[9px] uppercase tracking-[0.28em] text-white/40">Episode Surface</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/88">{overlayLabel}</div>
        </button>
      )}

      {!asset?.videoUrl && (
        <div className="absolute inset-x-4 bottom-4 z-10 border border-white/12 bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/52 backdrop-blur-sm">
          3D model active. No video texture file found for this episode yet.
        </div>
      )}

      {videoFailed && (
        <div className="absolute inset-x-4 bottom-4 z-10 border border-white/12 bg-black/45 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/52 backdrop-blur-sm">
          Video texture unavailable. Showing poster texture fallback.
        </div>
      )}

      {asset?.ar?.enabled && <ARSessionButton onSessionChange={setArActive} />}
    </div>
  );
}
