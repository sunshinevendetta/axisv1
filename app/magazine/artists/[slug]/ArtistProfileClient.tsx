"use client";

import { useState } from "react";
import Link from "next/link";
import PillNav from "@/components/PillNav";
import Footer from "@/components/Footer";
import type { ArtistProfile } from "@/src/content/artists";
import type { PillNavItem } from "@/components/PillNav";

// ─── Bio Drawer ──────────────────────────────────────────────────────────────

function BioDrawer({
  artist,
  open,
  onClose,
}: {
  artist: ArtistProfile;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto border-t border-white/12 bg-black px-6 pb-10 pt-6 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[480px] sm:border-t-0 sm:border-l sm:pt-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] uppercase tracking-[0.44em] text-white/22">Artist Profile</p>
            <h2 className="mt-2 [font-family:var(--font-display)] text-2xl leading-[0.9] tracking-[-0.05em] text-white">
              {artist.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 shrink-0 text-[10px] uppercase tracking-[0.3em] text-white/32 transition-colors hover:text-white/70"
          >
            Close
          </button>
        </div>

        {artist.profileImage ? (
          <img
            src={artist.profileImage}
            alt={artist.name}
            className="mb-6 h-48 w-full object-cover opacity-88"
          />
        ) : null}

        <p className="text-sm leading-7 tracking-wide text-white/60">{artist.summary}</p>

        {artist.genres.length > 0 ? (
          <div className="mt-6">
            <div className="mb-2 text-[8px] uppercase tracking-[0.34em] text-white/22">Genres</div>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((g) => (
                <span key={g} className="border border-white/8 px-2 py-1 text-[8px] uppercase tracking-[0.24em] text-white/40">
                  {g}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {artist.similar.length > 0 ? (
          <div className="mt-6">
            <div className="mb-2 text-[8px] uppercase tracking-[0.34em] text-white/22">Similar Artists</div>
            <div className="flex flex-wrap gap-2">
              {artist.similar.map((name) => (
                <span key={name} className="border border-white/6 px-2 py-1 text-[8px] tracking-wide text-white/32">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {artist.externalLinks.length > 0 ? (
          <div className="mt-6">
            <div className="mb-2 text-[8px] uppercase tracking-[0.34em] text-white/22">Links</div>
            <div className="flex flex-col gap-1.5">
              {artist.externalLinks.map((link) => (
                <a
                  key={`${link.label}-${link.href ?? ""}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] uppercase tracking-[0.28em] text-white/38 transition-colors hover:text-white/72"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {artist.latestTracks.length > 0 ? (
          <div className="mt-6">
            <div className="mb-3 text-[8px] uppercase tracking-[0.34em] text-white/22">Top Tracks</div>
            <div className="space-y-1.5">
              {artist.latestTracks.map((track) => (
                <a
                  key={track.url}
                  href={track.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-white/6 px-3 py-2 transition-colors hover:border-white/14 hover:bg-white/[0.02]"
                >
                  <span className="text-xs tracking-wide text-white/62">{track.name}</span>
                  <span className="text-[8px] tracking-wide text-white/22">
                    {track.playcount.toLocaleString()} plays
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ArtistProfileClient({
  artist,
  relatedArtists,
  allArtists,
  navItems,
}: {
  artist: ArtistProfile;
  relatedArtists: ArtistProfile[];
  allArtists: ArtistProfile[];
  navItems: PillNavItem[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="spectra logo"
          items={navItems}
          activeHref="/magazine/artists"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <BioDrawer artist={artist} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="relative z-10 px-4 pt-24 pb-28 sm:px-6">
        <div className="mx-auto max-w-[760px]">
          <Link
            href="/magazine/artists"
            className="mb-14 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/28 transition-colors hover:text-white/60"
          >
            <span>←</span> artists
          </Link>

          <div className="mb-8 flex flex-wrap items-center gap-2.5">
            {artist.artistTypes.map((type) => (
              <span
                key={type}
                className="border border-white/12 px-2.5 py-1 text-[8px] uppercase tracking-[0.4em] text-white/46"
              >
                {type}
              </span>
            ))}
            {artist.fromEpisode ? (
              <span className="border border-white/12 px-2.5 py-1 text-[8px] uppercase tracking-[0.4em] text-white/46">
                Episode-linked
              </span>
            ) : null}
            <span className="text-[9px] uppercase tracking-[0.32em] text-white/20">{artist.gridIndex}</span>
          </div>

          {artist.profileImage ? (
            <div className="mb-8 overflow-hidden border border-white/10 bg-white/[0.03]">
              <img
                src={artist.profileImage}
                alt={artist.name}
                className="h-[260px] w-full object-cover opacity-88 sm:h-[340px]"
              />
            </div>
          ) : null}

          <h1 className="mb-5 [font-family:var(--font-display)] text-[clamp(1.8rem,4.5vw,3.4rem)] leading-[0.86] tracking-[-0.06em] text-white">
            {artist.name}
          </h1>
          <p className="max-w-2xl text-base leading-7 tracking-wide text-white/46 sm:text-[17px] sm:leading-8">
            {artist.summary}
          </p>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[7px] uppercase tracking-[0.5em] text-white/16">SPECTRA© Artist Profile</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Metadata grid */}
          <div className="grid gap-px bg-white/6 sm:grid-cols-3">
            <div className="bg-black p-5">
              <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Genres</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {artist.genres.length > 0 ? artist.genres.map((genre) => (
                  <span
                    key={genre}
                    className="border border-white/8 px-2 py-1 text-[8px] uppercase tracking-[0.24em] text-white/34"
                  >
                    {genre}
                  </span>
                )) : <span className="text-xs tracking-wide text-white/24">No genre data yet.</span>}
              </div>
            </div>
            <div className="bg-black p-5">
              <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Links</div>
              <div className="mt-3 space-y-2">
                {artist.externalLinks.length > 0 ? artist.externalLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.href ?? ""}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[9px] uppercase tracking-[0.28em] text-white/38 transition-colors hover:text-white/72"
                  >
                    {link.label} ↗
                  </a>
                )) : <span className="text-xs tracking-wide text-white/24">No links in this record.</span>}
              </div>
            </div>
            <div className="bg-black p-5">
              <div className="text-[8px] uppercase tracking-[0.34em] text-white/22">Profile</div>
              <div className="mt-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="text-[9px] uppercase tracking-[0.28em] text-white/38 transition-colors hover:text-white/72"
                >
                  {artist.profilePageLabel} →
                </button>
              </div>
            </div>
          </div>

          {/* Cover arts / releases */}
          {artist.coverArts.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/32">Releases</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {artist.coverArts.map((album) => (
                  <a
                    key={album.url}
                    href={album.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.name}
                        className="aspect-square w-full object-cover opacity-72 transition-opacity group-hover:opacity-100"
                      />
                    ) : (
                      <div className="aspect-square w-full border border-white/8 bg-white/[0.04]" />
                    )}
                    <div className="mt-1.5 line-clamp-1 text-[8px] leading-4 tracking-wide text-white/30 transition-colors group-hover:text-white/60">
                      {album.name}
                    </div>
                    {album.releaseDate ? (
                      <div className="mt-0.5 text-[7px] tracking-wide text-white/18">
                        {album.releaseDate.slice(0, 4)}
                        {album.releaseType ? ` · ${album.releaseType}` : ""}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {/* Top tracks */}
          {artist.latestTracks.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="mb-4 text-[10px] uppercase tracking-[0.32em] text-white/32">Top Tracks</div>
              <div className="space-y-1.5">
                {artist.latestTracks.map((track, i) => (
                  <a
                    key={track.url}
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 border border-white/6 px-4 py-2.5 transition-colors hover:border-white/14 hover:bg-white/[0.02]"
                  >
                    <span className="w-4 shrink-0 text-[8px] text-white/18">{i + 1}</span>
                    <span className="flex-1 text-sm tracking-wide text-white/62">{track.name}</span>
                    <span className="shrink-0 text-[8px] tracking-wide text-white/22">
                      {track.playcount.toLocaleString()} plays ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {artist.zoraEmbeds.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/32">Zora Highlights</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {artist.zoraEmbeds.map((embed) => (
                  <a
                    key={embed.id}
                    href={embed.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group border border-white/8 bg-white/[0.02] transition-colors hover:border-white/16 hover:bg-white/[0.03]"
                  >
                    {embed.image ? (
                      <img
                        src={embed.image}
                        alt={embed.title}
                        className="h-44 w-full object-cover opacity-84 transition-opacity group-hover:opacity-100"
                      />
                    ) : (
                      <div className="h-44 w-full bg-white/[0.03]" />
                    )}
                    <div className="p-4">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-white/24">Zora</div>
                      <div className="mt-2 text-sm leading-5 tracking-wide text-white/78">{embed.title}</div>
                      {embed.description ? (
                        <div className="mt-2 line-clamp-3 text-xs leading-5 tracking-wide text-white/36">
                          {embed.description}
                        </div>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {artist.linkedEpisodes.length > 0 ? (
            <section className="mt-14 border border-white/8 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/32">Episodes</div>
              <div className="mt-5 space-y-3">
                {artist.linkedEpisodes.map((entry) =>
                  entry.href ? (
                    <Link
                      key={`${entry.label}-${entry.href}`}
                      href={entry.href}
                      className="block text-sm leading-6 text-white/68 underline decoration-white/16 underline-offset-4 transition-colors hover:text-white"
                    >
                      {entry.label}
                    </Link>
                  ) : (
                    <div key={entry.label} className="text-sm leading-6 text-white/62">
                      {entry.label}
                    </div>
                  )
                )}
              </div>
            </section>
          ) : null}

          {artist.linkedArtifacts.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/32">Works & Mentions</div>
              <div className="mt-5 space-y-3">
                {artist.linkedArtifacts.map((entry) =>
                  entry.href ? (
                    <Link
                      key={`${entry.label}-${entry.href}`}
                      href={entry.href}
                      className="block text-sm leading-6 text-white/68 underline decoration-white/16 underline-offset-4 transition-colors hover:text-white"
                    >
                      {entry.label}
                    </Link>
                  ) : (
                    <div key={entry.label} className="text-sm leading-6 text-white/62">
                      {entry.label}
                    </div>
                  )
                )}
              </div>
            </section>
          ) : null}

          {artist.spaces.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/32">Spaces</div>
              <div className="mt-5 space-y-3">
                {artist.spaces.map((space) => (
                  <div key={`${space.name}-${space.episode}`} className="border border-white/8 px-4 py-3">
                    <div className="text-sm text-white/78">{space.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/28">{space.episode}</div>
                    <div className="mt-2 text-sm leading-6 text-white/52">{space.note}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {artist.signals.length > 0 ? (
            <section className="mt-10 border border-white/8 p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/32">Activity</div>
              <div className="mt-5 space-y-3">
                {artist.signals.map((signal) => (
                  <div key={`${signal.timestamp}-${signal.text}`} className="border border-white/8 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">{signal.timestamp}</div>
                    <div className="mt-2 text-sm leading-6 text-white/64">{signal.text}</div>
                    {signal.link?.href ? (
                      <Link
                        href={signal.link.href}
                        className="mt-2 inline-block text-[9px] uppercase tracking-[0.28em] text-white/34 transition-colors hover:text-white/72"
                      >
                        {signal.link.label} ↗
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Similar artists from Last.fm — cross-linked if in our index */}
          {artist.similar.length > 0 ? (
            <section className="mt-14 border-t border-white/8 pt-10">
              <div className="mb-5 text-[10px] uppercase tracking-[0.36em] text-white/28">Similar Artists</div>
              <div className="flex flex-wrap gap-2">
                {artist.similar.map((name) => {
                  const linked = allArtists.find(
                    (p) =>
                      p.name.toLowerCase() === name.toLowerCase() ||
                      p.aliases.some((a) => a.toLowerCase() === name.toLowerCase()),
                  );
                  return linked ? (
                    <Link
                      key={name}
                      href={`/magazine/artists/${linked.slug}`}
                      className="border border-white/10 px-3 py-1.5 text-[9px] tracking-wide text-white/48 transition-colors hover:border-white/24 hover:text-white/78"
                    >
                      {name} ↗
                    </Link>
                  ) : (
                    <span
                      key={name}
                      className="border border-white/6 px-3 py-1.5 text-[9px] tracking-wide text-white/28"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Related artists from index */}
          {relatedArtists.length > 0 ? (
            <section className="mt-14 border-t border-white/8 pt-10">
              <div className="mb-6 text-[10px] uppercase tracking-[0.36em] text-white/28">Also in the Index</div>
              <div className="grid gap-px bg-white/6 sm:grid-cols-3">
                {relatedArtists.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/magazine/artists/${entry.slug}`}
                    className="bg-black p-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="text-[8px] uppercase tracking-[0.28em] text-white/18">{entry.gridIndex}</div>
                    <div className="mt-3 text-sm tracking-wide text-white/72">{entry.name}</div>
                    <div className="mt-2 line-clamp-2 text-xs leading-5 tracking-wide text-white/34">
                      {entry.shortBio}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
