"use client";

import Image from "next/image";

type Props = {
  title: string;
  posterUrl?: string;
  message?: string;
  compact?: boolean;
};

export function EpisodeFallback({ title, posterUrl, message, compact = false }: Props) {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-black/50">
      <div className={`relative ${compact ? "aspect-square" : "aspect-[4/5] sm:aspect-square"}`}>
        {posterUrl ? (
          <Image src={posterUrl} alt={title} fill className="object-cover opacity-55" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2b2b2b,transparent_55%),linear-gradient(180deg,#111,#000)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-[9px] uppercase tracking-[0.32em] text-white/36">Episode Viewer</div>
          <div className="mt-2 text-xs leading-5 text-white/64">
            {message ?? "3D viewer unavailable for this episode asset."}
          </div>
        </div>
      </div>
    </div>
  );
}
