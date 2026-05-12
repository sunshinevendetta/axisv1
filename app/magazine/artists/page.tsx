import Link from "next/link";
import PillNav from "@/components/PillNav";
import Footer from "@/components/Footer";
import { artistGenreIndex, artistProfiles, musicArtistProfiles, visualArtistProfiles } from "@/src/content/artists";
import { magazineNavItems } from "@/src/lib/navigation";

function ArtistSection({
  title,
  eyebrow,
  description,
  artists,
}: {
  title: string;
  eyebrow: string;
  description: string;
  artists: typeof artistProfiles;
}) {
  return (
    <section className="border-t border-white/6 py-14 first:border-t-0 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.44em] text-white/22">{eyebrow}</p>
          <h2 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.25rem,3vw,2rem)] leading-[0.92] tracking-[-0.05em] text-white">
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-xs leading-6 tracking-wide text-white/36 sm:text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-px bg-white/6 sm:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => (
          <Link
            key={artist.slug}
            href={`/magazine/artists/${artist.slug}`}
            className="group bg-black p-6 transition-colors hover:bg-white/[0.02] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              {artist.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="h-10 w-10 border border-white/10 object-cover opacity-82 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center border border-white/10 text-sm uppercase tracking-wide text-white/28 transition-colors group-hover:border-white/20 group-hover:text-white/46">
                  {artist.name.charAt(0)}
                </div>
              )}
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/16">{artist.gridIndex}</span>
            </div>
            <h3 className="mt-6 text-sm leading-5 tracking-wide text-white/78 transition-colors group-hover:text-white/94">
              {artist.name}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {artist.artistTypes.map((type) => (
                <span
                  key={type}
                  className="border border-white/8 px-2 py-1 text-[7px] uppercase tracking-[0.24em] text-white/28"
                >
                  {type}
                </span>
              ))}
              {artist.fromEpisode ? (
                <span className="border border-white/8 px-2 py-1 text-[7px] uppercase tracking-[0.24em] text-white/28">
                  episode
                </span>
              ) : null}
            </div>
            <p className="mt-4 line-clamp-3 text-xs leading-6 tracking-wide text-white/38">
              {artist.shortBio}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function MagazineArtistsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <PillNav
          logo="/logo.png"
          logoAlt="AXIS logo"
          items={magazineNavItems}
          activeHref="/magazine/artists"
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#000"
          pillTextColor="#000"
        />
      </div>

      <main className="relative z-10 pt-20">
        <div className="border-b border-white/6 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/magazine"
                className="text-[9px] uppercase tracking-[0.36em] text-white/28 transition-colors hover:text-white/58"
              >
                ← Magazine
              </Link>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-white/18">Artists</span>
            </div>
            <span className="text-[8px] uppercase tracking-[0.36em] text-white/16">
              {artistProfiles.length} indexed
            </span>
          </div>
        </div>

        <div className="border-b border-white/6 px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-[8px] uppercase tracking-[0.48em] text-white/22">AXIS Hypermedia</p>
            <h1 className="mt-4 [font-family:var(--font-display)] text-[clamp(1.7rem,4vw,3rem)] leading-[0.88] tracking-[-0.06em] text-white">
              Artist Index
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 tracking-wide text-white/40 sm:text-[15px]">
              A magazine-native directory for artists across AXIS episodes and the broader archive. Music artists and visual artists live in the same index, with genre groupings generated only from real records already present in the directory.
            </p>

            {artistGenreIndex.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {artistGenreIndex.map((genre) => (
                  <span
                    key={genre.slug}
                    className="border border-white/8 px-2.5 py-1 text-[8px] uppercase tracking-[0.24em] text-white/28"
                  >
                    {genre.label} · {genre.count}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <section className="bg-black px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <ArtistSection
              title="Music Artists"
              eyebrow="Index 01"
              description="DJs, producers, sound artists, and live acts tied to episodes, transmissions, interviews, and the wider hypermedia archive."
              artists={musicArtistProfiles}
            />
            <ArtistSection
              title="Visual Artists"
              eyebrow="Index 02"
              description="Digital artists, painters, photographers, moving-image makers, and broader visual practices carried in the AXIS index."
              artists={visualArtistProfiles}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
