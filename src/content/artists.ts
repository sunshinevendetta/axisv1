import rawVisualArtists from "@/public/data/artists.json";
import rawMusicArtists from "@/content/music-artists.json";
import rawArtistZoraCache from "@/content/artist-zora-cache.json";
import rawArtistMediaCache from "@/content/artist-media-cache.json";
import type { ArtistZoraCache, ArtistZoraEmbed } from "@/src/lib/artist-store";

export type ArtistType = "music" | "visual";

export type ArtistLink = {
  label: string;
  href?: string;
};

export type ArtistSocialLink = {
  platform: string;  // "instagram" | "twitter" | "spotify" | "soundcloud" | "bandcamp" | "youtube" | "apple-music" | "deezer" | "tidal" | "discogs" | "website" | etc.
  url: string;
};

// Track — from Spotify (primary source)
export type ArtistTrack = {
  id: string;
  name: string;
  popularity: number;       // 0–100
  durationMs: number;
  previewUrl: string | null;
  url: string;              // Spotify link
  albumName: string;
  albumCover: string | null;
};

export type ArtistAlbum = {
  name: string;
  coverImage: string | null;
  url: string;
  releaseDate?: string;
  releaseType?: string;
};

type ArtistMediaCacheEntry = {
  slug: string;
  profileImage: string | null;
  // tracks may be old Last.fm shape { name, playcount, url } or new Spotify shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tracks: any[];
  releases: Array<{
    id: string;
    name: string;
    releaseDate: string;
    releaseType: string;
    coverImage: string | null;
    url: string;
  }>;
  albums: ArtistAlbum[];
  related?: string[];
};

const artistMediaCache = rawArtistMediaCache as Record<string, ArtistMediaCacheEntry>;

export type ArtistSignal = {
  timestamp: string;
  text: string;
  link?: ArtistLink;
};

export type ArtistSpace = {
  name: string;
  episode: string;
  note: string;
};

export type ArtistProfile = {
  slug: string;
  name: string;
  artistTypes: ArtistType[];
  gridIndex: string;
  profilePageLabel: string;
  summary: string;
  shortBio: string;
  profileImage: string | null;
  coverImage: string | null;
  externalLinks: ArtistLink[];
  genres: string[];
  tags: string[];
  similar: string[];
  latestTracks: ArtistTrack[];
  coverArts: ArtistAlbum[];
  featured: boolean;
  fromEpisode: boolean;
  linkedEpisodes: ArtistLink[];
  linkedArtifacts: ArtistLink[];
  spaces: ArtistSpace[];
  signals: ArtistSignal[];
  aliases: string[];
  zoraHandle: string | null;
  zoraProfileUrl: string | null;
  zoraAvatar: string | null;
  zoraEmbeds: ArtistZoraEmbed[];
};

type VisualArtistSource = {
  name: string;
  image?: string;
  bio: string;
  link?: string;
};

type MusicArtistSource = {
  name: string;
  aliases?: string[];
  artistTypes: ArtistType[];
  gridIndex?: string;
  profilePageLabel?: string;
  summary: string;
  genres?: string[];
  tags?: string[];
  featured?: boolean;
  linkedEpisodes?: ArtistLink[];
  linkedArtifacts?: ArtistLink[];
  spaces?: ArtistSpace[];
  signals?: ArtistSignal[];
  // Scraper-populated fields
  mbid?: string;                // MusicBrainz ID — internal, used for re-fetching
  similar?: string[];           // Similar artist names from Last.fm
  links?: ArtistSocialLink[];   // Structured social + streaming links from MusicBrainz
};

const artistZoraCache = rawArtistZoraCache as ArtistZoraCache;

function slugifyArtist(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeHostLabel(href: string) {
  try {
    const hostname = new URL(href).hostname.replace(/^www\./, "");
    return hostname.split(".")[0] ?? "Link";
  } catch {
    return "External";
  }
}

function extractZoraHandle(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!url.hostname.includes("zora.co")) return null;
    const matched = url.pathname.match(/\/@([^/?#]+)/);
    return matched?.[1] ?? null;
  } catch {
    return null;
  }
}

function dedupeLinks(values: ArtistLink[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = `${value.label}|${value.href ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortProfiles(a: ArtistProfile, b: ArtistProfile) {
  return a.name.localeCompare(b.name);
}

const musicArtists = (rawMusicArtists as MusicArtistSource[]).map((artist, index) => ({
  slug: slugifyArtist(artist.name),
  name: artist.name,
  artistTypes: artist.artistTypes,
  gridIndex: artist.gridIndex ?? `A-${String(index + 1).padStart(2, "0")}`,
  profilePageLabel: artist.profilePageLabel ?? "Mini profile",
  summary: artist.summary,
  shortBio: artist.summary,
  profileImage: null,
  coverImage: null,
  externalLinks: (artist.links ?? []).map((l) => ({ label: l.platform, href: l.url })),
  genres: artist.genres ?? [],
  tags: artist.tags ?? [],
  similar: artist.similar ?? [],
  latestTracks: [],
  coverArts: [],
  featured: artist.featured ?? true,
  fromEpisode: true,
  linkedEpisodes: artist.linkedEpisodes ?? [],
  linkedArtifacts: artist.linkedArtifacts ?? [],
  spaces: artist.spaces ?? [],
  signals: artist.signals ?? [],
  aliases: artist.aliases ?? [],
  zoraHandle: null,
  zoraProfileUrl: null,
  zoraAvatar: null,
  zoraEmbeds: [],
})) satisfies ArtistProfile[];

const visualArtists = (rawVisualArtists as VisualArtistSource[]).map((artist, index) => ({
  slug: slugifyArtist(artist.name),
  name: artist.name,
  artistTypes: [artist.name === "Sunshine Vendetta" ? "music" : null, "visual"].filter(
    (value): value is ArtistType => Boolean(value),
  ),
  gridIndex: `V-${String(index + 1).padStart(2, "0")}`,
  profilePageLabel: "Mini profile",
  summary: artist.bio,
  shortBio: artist.bio,
  profileImage: artist.image ?? null,
  coverImage: artist.image ?? null,
  externalLinks: artist.link ? [{ label: normalizeHostLabel(artist.link), href: artist.link }] : [],
  genres: [],
  tags: [],
  similar: [],
  latestTracks: [],
  coverArts: [],
  featured: false,
  fromEpisode: false,
  linkedEpisodes: [],
  linkedArtifacts: [],
  spaces: [],
  signals: [],
  aliases: [],
  zoraHandle: extractZoraHandle(artist.link),
  zoraProfileUrl: extractZoraHandle(artist.link) ? artist.link ?? null : null,
  zoraAvatar: null,
  zoraEmbeds: [],
})) satisfies ArtistProfile[];

function mergeProfiles(base: ArtistProfile, incoming: ArtistProfile): ArtistProfile {
  return {
    ...base,
    artistTypes: dedupeStrings([...base.artistTypes, ...incoming.artistTypes]) as ArtistType[],
    summary: base.fromEpisode ? base.summary : incoming.summary,
    shortBio: base.fromEpisode ? base.shortBio : incoming.shortBio,
    profileImage: base.profileImage ?? incoming.profileImage,
    coverImage: base.coverImage ?? incoming.coverImage,
    externalLinks: dedupeLinks([...base.externalLinks, ...incoming.externalLinks]),
    genres: dedupeStrings([...base.genres, ...incoming.genres]),
    tags: dedupeStrings([...base.tags, ...incoming.tags]),
    similar: base.similar.length > 0 ? base.similar : incoming.similar,
    latestTracks: base.latestTracks.length > 0 ? base.latestTracks : incoming.latestTracks,
    coverArts: base.coverArts.length > 0 ? base.coverArts : incoming.coverArts,
    featured: base.featured || incoming.featured,
    fromEpisode: base.fromEpisode || incoming.fromEpisode,
    linkedEpisodes: [...base.linkedEpisodes, ...incoming.linkedEpisodes],
    linkedArtifacts: [...base.linkedArtifacts, ...incoming.linkedArtifacts],
    spaces: [...base.spaces, ...incoming.spaces],
    signals: [...base.signals, ...incoming.signals],
    aliases: dedupeStrings([...base.aliases, ...incoming.aliases]),
    zoraHandle: base.zoraHandle ?? incoming.zoraHandle,
    zoraProfileUrl: base.zoraProfileUrl ?? incoming.zoraProfileUrl,
    zoraAvatar: base.zoraAvatar ?? incoming.zoraAvatar,
    zoraEmbeds: base.zoraEmbeds.length > 0 ? base.zoraEmbeds : incoming.zoraEmbeds,
  };
}

const artistMap = new Map<string, ArtistProfile>();

for (const artist of [...musicArtists, ...visualArtists]) {
  const current = artistMap.get(artist.slug);
  artistMap.set(artist.slug, current ? mergeProfiles(current, artist) : artist);
}

const rawArtistProfiles = Array.from(artistMap.values()).sort(sortProfiles);
const enrichedArtistProfiles = rawArtistProfiles.map((artist) => {
  const zoraRecord = artistZoraCache[artist.slug];
  const mediaRecord = artistMediaCache[artist.slug];
  const zoraLinks = zoraRecord?.profile?.socials.map((social) => ({
    label: social.label,
    href: social.href,
  })) ?? [];
  const zoraAvatar = zoraRecord?.profile?.avatar ?? null;
  const profileImage = zoraAvatar ?? mediaRecord?.profileImage ?? artist.profileImage;

  return {
    ...artist,
    profileImage,
    coverImage: zoraAvatar ?? artist.coverImage ?? profileImage,
    latestTracks: mediaRecord?.tracks ?? artist.latestTracks,
    // Spotify releases are date-sorted and accurate — use them if available, fall back to Last.fm albums
    coverArts: mediaRecord?.releases?.length
      ? mediaRecord.releases.map((r) => ({
          name: r.name,
          coverImage: r.coverImage,
          url: r.url,
          releaseDate: r.releaseDate,
          releaseType: r.releaseType,
        }))
      : (mediaRecord?.albums ?? artist.coverArts),
    externalLinks: dedupeLinks([
      ...artist.externalLinks,
      ...zoraLinks,
    ]),
    zoraHandle: zoraRecord?.profile?.handle ?? artist.zoraHandle,
    zoraProfileUrl:
      zoraRecord?.profile?.handle
        ? `https://zora.co/@${zoraRecord.profile.handle}`
        : artist.zoraProfileUrl,
    zoraAvatar,
    zoraEmbeds: zoraRecord?.embeds ?? artist.zoraEmbeds,
    shortBio: zoraRecord?.profile?.bio ?? artist.shortBio,
  };
});

export const artistProfiles = enrichedArtistProfiles;

export const featuredArtistProfiles = artistProfiles.slice(0, 8);

export const musicArtistProfiles = artistProfiles
  .filter((artist) => artist.artistTypes.includes("music"))
  .sort(sortProfiles);

export const visualArtistProfiles = artistProfiles
  .filter((artist) => artist.artistTypes.includes("visual"))
  .sort(sortProfiles);

export const artistGenreIndex = Array.from(
  musicArtistProfiles.reduce((acc, artist) => {
    for (const genre of artist.genres) {
      const key = genre.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, {
          slug: slugifyArtist(key),
          label: genre,
          artistSlugs: [],
        });
      }
      acc.get(key)?.artistSlugs.push(artist.slug);
    }
    return acc;
  }, new Map<string, { slug: string; label: string; artistSlugs: string[] }>()),
)
  .map(([, value]) => ({ ...value, count: value.artistSlugs.length }))
  .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

export const artistTypeIndex = [
  {
    slug: "music",
    label: "Music Artists",
    count: musicArtistProfiles.length,
  },
  {
    slug: "visual",
    label: "Visual Artists",
    count: visualArtistProfiles.length,
  },
];

export function findArtistProfile(value: string) {
  const normalized = slugifyArtist(value);
  return artistProfiles.find((artist) => {
    if (artist.slug === normalized) return true;
    if (artist.name.toLowerCase() === value.trim().toLowerCase()) return true;
    return artist.aliases.some((alias) => slugifyArtist(alias) === normalized);
  }) ?? null;
}

export function getArtistHref(value: string) {
  const artist = findArtistProfile(value);
  return artist ? `/magazine/artists/${artist.slug}` : "/magazine/artists";
}
