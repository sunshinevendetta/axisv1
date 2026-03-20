"use client";

import Link from "next/link";
import type { ArtistWorldProfile } from "@/src/content/world-expansion";

type Props = {
  artists: ArtistWorldProfile[];
  onOpenArtist?: (name: string) => void;
};

// Placeholder slots — shown when we have fewer than 8 confirmed artists
const GRID_SLOTS = 8;

export default function HomeArtistsSection({ artists, onOpenArtist }: Props) {
  const placeholderCount = Math.max(0, GRID_SLOTS - artists.length);
  const placeholders = Array.from({ length: placeholderCount });

  return (
    <section id="artists" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">World Expansion</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Artists
            </h2>
          </div>
          <Link
            href="/magazine"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            all profiles ↗
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-px bg-white/6 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
            <button
              key={artist.slug}
              type="button"
              onClick={() => onOpenArtist?.(artist.name)}
              className="group flex flex-col gap-3 bg-black p-6 text-left transition-colors hover:bg-white/[0.025] sm:p-8"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center border border-white/10 text-sm uppercase tracking-wide text-white/30 transition-colors group-hover:border-white/22 group-hover:text-white/52">
                {artist.name.charAt(0)}
              </div>

              {/* Index */}
              <div className="text-[8px] uppercase tracking-[0.32em] text-white/20">
                {artist.gridIndex}
              </div>

              {/* Name */}
              <div className="text-sm leading-5 tracking-wide text-white/68 transition-colors group-hover:text-white/92">
                {artist.name}
              </div>

              {/* Episodes */}
              <div className="text-[8px] uppercase tracking-[0.24em] text-white/22">
                {artist.linkedEpisodes.map((e) => e.label).join(" · ")}
              </div>
            </button>
          ))}

          {/* Placeholder slots */}
          {placeholders.map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="flex flex-col gap-3 bg-black p-6 sm:p-8"
            >
              <div className="h-10 w-10 border border-white/[0.04]" />
              <div className="h-2 w-6 bg-white/[0.04]" />
              <div className="h-3 w-20 bg-white/[0.04]" />
              <div className="h-2 w-14 bg-white/[0.03]" />
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/6 pt-6">
          <p className="text-[9px] uppercase tracking-[0.32em] text-white/18">
            Music · Visual · Digital — profiles added continuously
          </p>
        </div>

      </div>
    </section>
  );
}
