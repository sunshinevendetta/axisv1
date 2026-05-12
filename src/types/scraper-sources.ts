/**
 * scraper-sources.ts
 *
 * Registry of all data sources used by the artist scraper pipeline.
 * Each entry describes the source name, its role in the pipeline pass,
 * auth requirements, and current status.
 *
 * This is the single source of truth for what the scraper can pull from.
 * The scraper implementation lives in tools/artist-scraper/.
 */

export type ScraperSourceStatus = "active" | "pending" | "disabled";

export type ScraperSourceAuthKind =
  | "api-key"       // standard API key / token passed in headers or query params
  | "oauth"         // OAuth2 client credentials flow
  | "none";         // no auth required (public endpoint / oEmbed)

export type ScraperSourceAuth = {
  kind: ScraperSourceAuthKind;
  /** Environment variable name(s) required for this source. Empty if kind is "none". */
  envKeys: string[];
};

export type ScraperSource = {
  /** Human-readable name displayed in HQ panels and logs. */
  name: string;
  /** Kebab-case identifier matching the scraper module name. */
  id: string;
  /** Role of this source in the data pipeline. */
  role: string;
  /** Which scraper pass this source runs in (1–5). */
  pass: number;
  /** What data field(s) it populates on ArtistMediaCacheEntry. */
  fields: string[];
  /** Authentication requirements. */
  auth: ScraperSourceAuth;
  /** Whether this source is currently active in the pipeline. */
  status: ScraperSourceStatus;
  /** Notes about limitations or pending work. */
  notes?: string;
};

// ── Core identity sources (Pass 1) ────────────────────────────────────────────

export const SCRAPER_SOURCES_PASS1: ScraperSource[] = [
  {
    name: "Last.fm",
    id: "lastfm",
    role: "Bio, tags, genres, similar artists, listener count, mbid bridge",
    pass: 1,
    fields: ["summary", "tags", "genres", "similar", "related"],
    auth: { kind: "api-key", envKeys: ["LASTFM_API_KEY"] },
    status: "active",
  },
  {
    name: "MusicBrainz",
    id: "musicbrainz",
    role: "Structured social + streaming links (Instagram, SoundCloud, etc.)",
    pass: 1,
    fields: ["links"],
    auth: { kind: "none", envKeys: [] },
    status: "active",
    notes: "Requires mbid from Last.fm. Rate-limited to 1100ms per artist.",
  },
];

// ── Knowledge graph + event sources (Pass 2) ──────────────────────────────────

export const SCRAPER_SOURCES_PASS2: ScraperSource[] = [
  {
    name: "Google Knowledge Graph",
    id: "knowledge-graph",
    role: "Canonical name, Wikipedia bio, entity image, Wikidata ID, country, formed year",
    pass: 2,
    fields: ["kgId", "wikidataId", "countryOfOrigin", "formedYear", "recordLabels", "members", "instruments"],
    auth: { kind: "api-key", envKeys: ["GOOGLE_KG_API_KEY"] },
    status: "active",
  },
  {
    name: "Wikidata SPARQL",
    id: "wikidata",
    role: "Country of origin, formed year, genres, record labels, members, instruments",
    pass: 2,
    fields: ["wikidataId", "countryOfOrigin", "formedYear", "recordLabels", "members", "instruments"],
    auth: { kind: "none", envKeys: [] },
    status: "active",
    notes: "Queried via the Wikidata ID returned by the Knowledge Graph step. No key required.",
  },
  {
    name: "Resident Advisor GraphQL",
    id: "ra",
    role: "Artist profile, bio, city, upcoming + past gigs, promoter IDs",
    pass: 2,
    fields: ["raId", "raSlug", "raBio", "raProfileImage", "raUrl", "upcomingGigs", "pastGigs"],
    auth: { kind: "none", envKeys: [] },
    status: "active",
    notes: "Delay 1000ms per artist. Pass 2C fetches all collected promoter entities in bulk.",
  },
];

// ── Media sources (Pass 3) ─────────────────────────────────────────────────────

export const SCRAPER_SOURCES_PASS3: ScraperSource[] = [
  {
    name: "Spotify Web API",
    id: "spotify",
    role: "Profile image (primary), top tracks, recent releases, genres, follower count",
    pass: 3,
    fields: ["profileImage", "tracks", "releases"],
    auth: { kind: "oauth", envKeys: ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"] },
    status: "active",
  },
  {
    name: "YouTube Data API v3",
    id: "youtube",
    role: "Channel image, top videos, latest uploads (Spotify fallback for tracks/releases)",
    pass: 3,
    fields: ["channelId", "videos"],
    auth: { kind: "api-key", envKeys: ["YOUTUBE_API_KEY"] },
    status: "active",
  },
];

// ── Social + physical release sources (Pass 4) ────────────────────────────────

export const SCRAPER_SOURCES_PASS4: ScraperSource[] = [
  {
    name: "Discogs API",
    id: "discogs",
    role: "Vinyl and physical release history",
    pass: 4,
    fields: ["discogsId", "vinylReleases"],
    auth: { kind: "api-key", envKeys: ["DISCOGS_TOKEN"] },
    status: "active",
  },
  {
    name: "Mixcloud API",
    id: "mixcloud",
    role: "DJ mixes and sets",
    pass: 4,
    fields: ["mixes"],
    auth: { kind: "api-key", envKeys: ["MIXCLOUD_CLIENT_ID"] },
    status: "active",
  },
  {
    name: "TikTok oEmbed",
    id: "tiktok",
    role: "oEmbed embed HTML; Display API for video feed (pending approval)",
    pass: 4,
    fields: ["tiktokLatest", "tiktokEmbedHtml"],
    auth: { kind: "api-key", envKeys: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"] },
    status: "active",
    notes: "oEmbed is keyless. Display API requires TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET and app approval.",
  },
  {
    name: "Meta Graph API",
    id: "meta",
    role: "Instagram posts, Facebook public events",
    pass: 4,
    fields: ["instagramPosts", "facebookEvents"],
    auth: { kind: "api-key", envKeys: ["META_APP_ID", "META_APP_ACCESS_TOKEN"] },
    status: "active",
  },
  {
    name: "Bandcamp oEmbed",
    id: "bandcamp",
    role: "Embeddable player HTML for Bandcamp artist pages",
    pass: 4,
    fields: ["bandcampEmbed"],
    auth: { kind: "none", envKeys: [] },
    status: "active",
    notes: "Requires a known Bandcamp URL in the artist links[] array.",
  },
];

// ── All sources flat list ─────────────────────────────────────────────────────

export const ALL_SCRAPER_SOURCES: ScraperSource[] = [
  ...SCRAPER_SOURCES_PASS1,
  ...SCRAPER_SOURCES_PASS2,
  ...SCRAPER_SOURCES_PASS3,
  ...SCRAPER_SOURCES_PASS4,
];

/** Lookup a source entry by its id. */
export function findScraperSource(id: string): ScraperSource | undefined {
  return ALL_SCRAPER_SOURCES.find((source) => source.id === id);
}
