"use client";

import Link from "next/link";
import type { ArtistProfile } from "@/src/content/artists";

type Props = {
  artists: ArtistProfile[];
  musicCount: number;
  visualCount: number;
  genreLabels: string[];
};

export default function HomeArtistsSection({ artists, musicCount, visualCount, genreLabels }: Props) {
  return (
    <section id="artists" className="border-t border-white/6 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.44em] text-white/28">World Expansion</div>
            <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.88] tracking-[-0.05em] text-white">
              Artists
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 tracking-wide text-white/42">
              Artist index split across music and visual practices, sourced from the magazine archive and the broader SPECTRA orbit.
            </p>
          </div>
          <Link
            href="/magazine/artists"
            className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/60"
          >
            all profiles ↗
          </Link>
        </div>

        <div className="mb-8 grid gap-px bg-white/6 sm:grid-cols-3">
          <div className="bg-black p-5 sm:p-6">
            <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Music Artists</div>
            <div className="mt-2 [font-family:var(--font-display)] text-2xl leading-none tracking-[-0.04em] text-white/88">
              {musicCount}
            </div>
          </div>
          <div className="bg-black p-5 sm:p-6">
            <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Visual Artists</div>
            <div className="mt-2 [font-family:var(--font-display)] text-2xl leading-none tracking-[-0.04em] text-white/88">
              {visualCount}
            </div>
          </div>
          <div className="bg-black p-5 sm:p-6">
            <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Live Genres</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {genreLabels.map((genre) => (
                <span
                  key={genre}
                  className="border border-white/8 px-2 py-1 text-[8px] uppercase tracking-[0.24em] text-white/34"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/6 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
            <Link
              key={artist.slug}
              href={`/magazine/artists/${artist.slug}`}
              className="group flex flex-col gap-3 bg-black p-6 text-left transition-colors hover:bg-white/[0.025] sm:p-8"
            >
              {artist.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="h-10 w-10 border border-white/10 object-cover opacity-82 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center border border-white/10 text-sm uppercase tracking-wide text-white/30 transition-colors group-hover:border-white/22 group-hover:text-white/52">
                  {artist.name.charAt(0)}
                </div>
              )}

              <div className="text-[8px] uppercase tracking-[0.32em] text-white/20">
                {artist.gridIndex}
              </div>

              <div className="text-sm leading-5 tracking-wide text-white/68 transition-colors group-hover:text-white/92">
                {artist.name}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {artist.artistTypes.map((type) => (
                  <span
                    key={type}
                    className="border border-white/8 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.22em] text-white/26"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="line-clamp-2 text-xs leading-5 tracking-wide text-white/36">
                {artist.shortBio}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-white/6 pt-6">
          <p className="text-[9px] uppercase tracking-[0.32em] text-white/18">
            Music and visual profiles are indexed from real artist records only. No placeholder genres, no empty shells.
          </p>
        </div>
      </div>
    </section>
  );
}
