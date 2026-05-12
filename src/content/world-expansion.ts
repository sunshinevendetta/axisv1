export type WorldLink = {
  label: string;
  href?: string;
};

export type WorldSignal = {
  timestamp: string;
  text: string;
  link?: WorldLink;
};

export type ArtistWorldProfile = {
  slug: string;
  name: string;
  gridIndex: string;
  profilePage: string;
  summary: string;
  linkedEpisodes: WorldLink[];
  linkedArtifacts: WorldLink[];
  spaces: Array<{
    name: string;
    episode: string;
    note: string;
  }>;
  signals: WorldSignal[];
};

export const artistWorldProfiles: ArtistWorldProfile[] = [
  {
    slug: "cyberreality",
    name: "Cyberreality",
    gridIndex: "A-01",
    profilePage: "Inline dossier",
    summary: "Industrial drift, ambient tension, and spatial composition logic inside the AXIS orbit.",
    linkedEpisodes: [
      { label: "AXIS I" },
      { label: "HYPERBASS activation", href: "/magazine/mixtapes" },
    ],
    linkedArtifacts: [
      { label: "CYBEREALITY for HYPERBASS", href: "/magazine/mixtapes" },
      { label: "Composing in the Dark interview", href: "/magazine" },
    ],
    spaces: [
      { name: "Basement studio", episode: "AXIS I", note: "Activated listening environment tied to the first live set." },
    ],
    signals: [
      { timestamp: "2026-03-15", text: "Interview published in AXIS Journal.", link: { label: "Open Magazine", href: "/magazine" } },
      { timestamp: "2025-12-20", text: "Mixtape indexed in Grove transmission set.", link: { label: "Open Mixtapes", href: "/magazine/mixtapes" } },
    ],
  },
  {
    slug: "gasoiid",
    name: "Gasoiid",
    gridIndex: "A-02",
    profilePage: "Inline dossier",
    summary: "Bass-first transmission architecture routed through HYPERBASS RADIO and heavy kinetic energy.",
    linkedEpisodes: [
      { label: "AXIS II" },
    ],
    linkedArtifacts: [
      { label: "HYPERBASS RADIO — Final Mix", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Radio floor", episode: "AXIS II", note: "Activated transmission room tied to the second episode mix system." },
    ],
    signals: [
      { timestamp: "2026-01-18", text: "Final mix entered the transmission index.", link: { label: "Open Mixtapes", href: "/magazine/mixtapes" } },
    ],
  },
  {
    slug: "fiesta-soundsystem",
    name: "Fiesta Soundsystem",
    gridIndex: "A-03",
    profilePage: "Inline dossier",
    summary: "Warm system pressure, groove persistence, and optimistic drift inside the AXIS tape layer.",
    linkedEpisodes: [
      { label: "AXIS III" },
    ],
    linkedArtifacts: [
      { label: "Sunshine Mix", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Sun room", episode: "AXIS III", note: "Activated location for daytime-to-night transition energy." },
    ],
    signals: [
      { timestamp: "2026-02-08", text: "Sunshine Mix added to active transmissions.", link: { label: "Open Mixtapes", href: "/magazine/mixtapes" } },
    ],
  },
  {
    slug: "sunshine-vendetta",
    name: "Sunshine Vendetta",
    gridIndex: "A-04",
    profilePage: "Inline dossier",
    summary: "Diffuse synthesis, bedroom signal chains, and ambient-techno residue across episode and tape contexts.",
    linkedEpisodes: [
      { label: "AXIS III" },
      { label: "Episode III recap", href: "/magazine" },
    ],
    linkedArtifacts: [
      { label: "Bedroom Mixtape — Synthesis", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Warehouse main room", episode: "AXIS III", note: "Activated live zone described in the Episode III dispatch." },
      { name: "Bedroom synthesis room", episode: "AXIS III", note: "Standalone recording environment tied to the mixtape artifact." },
    ],
    signals: [
      { timestamp: "2026-02-20", text: "Episode III dispatch linked Sunshine Vendetta to the warehouse set.", link: { label: "Open Magazine", href: "/magazine" } },
      { timestamp: "2026-02-15", text: "Bedroom Mixtape indexed in active transmission stack.", link: { label: "Open Mixtapes", href: "/magazine/mixtapes" } },
    ],
  },
  {
    slug: "mami-pistola",
    name: "Mami Pistola",
    gridIndex: "A-05",
    profilePage: "Inline dossier",
    summary: "Field recordings, transit compression, and editorial sound selection folded into live AXIS environments.",
    linkedEpisodes: [
      { label: "AXIS III" },
      { label: "Transit Sounds interview", href: "/magazine" },
    ],
    linkedArtifacts: [
      { label: "Sounds Collected in Transit", href: "/magazine" },
      { label: "Episode III dispatch", href: "/magazine" },
    ],
    spaces: [
      { name: "Transit capture layer", episode: "AXIS III", note: "Activated sonic material sourced from airports, terminals, and buses." },
    ],
    signals: [
      { timestamp: "2026-02-10", text: "Interview published with field-recording notes.", link: { label: "Open Magazine", href: "/magazine" } },
      { timestamp: "2026-02-20", text: "Episode III dispatch confirmed closing-set presence.", link: { label: "Open Magazine", href: "/magazine" } },
    ],
  },
];

function normalizeArtistName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function findArtistWorldProfile(name: string) {
  return artistWorldProfiles.find((profile) => profile.slug === normalizeArtistName(name) || profile.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
}

// ── Platform / data source nodes ─────────────────────────────────────────────

export type PlatformNodeKind =
  | "data-source"
  | "event-layer"
  | "identity-layer"
  | "social-signal"
  | "physical-releases";

export type PlatformNode = {
  id: string;
  name: string;
  kind: PlatformNodeKind[];
  description: string;
  fields: string[];
  envKeys: string[];
  status: "active" | "pending-approval" | "future";
  pass: number;
};

export const platformNodes: PlatformNode[] = [
  {
    id: "youtube",
    name: "YouTube Data API v3",
    kind: ["data-source"],
    description: "Channel thumbnail, top videos by view count, latest uploads. Fallback when Spotify is unavailable.",
    fields: ["channelId", "videos", "latestUploads", "profileImage"],
    envKeys: ["YOUTUBE_API_KEY"],
    status: "active",
    pass: 3,
  },
  {
    id: "resident-advisor",
    name: "Resident Advisor",
    kind: ["data-source", "event-layer"],
    description: "Artist profiles, upcoming and past gigs, DJ rankings, promoter directory. Primary source for electronic music events.",
    fields: ["raId", "raSlug", "raBio", "raProfileImage", "upcomingGigs", "pastGigs", "allPromoterIds"],
    envKeys: [],
    status: "active",
    pass: 2,
  },
  {
    id: "discogs",
    name: "Discogs",
    kind: ["data-source", "physical-releases"],
    description: "Physical release history — vinyl, CD, cassette. Label history and collector data.",
    fields: ["discogsId", "vinylReleases"],
    envKeys: ["DISCOGS_TOKEN"],
    status: "active",
    pass: 4,
  },
  {
    id: "mixcloud",
    name: "Mixcloud",
    kind: ["data-source"],
    description: "DJ mixes and live sets. Essential for electronic artists not fully represented on Spotify.",
    fields: ["mixes"],
    envKeys: ["MIXCLOUD_CLIENT_ID"],
    status: "active",
    pass: 4,
  },
  {
    id: "knowledge-graph",
    name: "Google Knowledge Graph + Wikidata",
    kind: ["identity-layer"],
    description: "Canonical entity identity, Wikipedia bio, country of origin, formed year, band members, instruments, record labels.",
    fields: ["kgId", "wikidataId", "wikipediaBio", "countryOfOrigin", "formedYear", "recordLabels", "members", "instruments"],
    envKeys: ["GOOGLE_KG_API_KEY"],
    status: "active",
    pass: 2,
  },
  {
    id: "tiktok",
    name: "TikTok",
    kind: ["social-signal"],
    description: "Latest videos and oEmbed player for known TikTok URLs. Display API pending review.",
    fields: ["tiktokLatest", "tiktokEmbedHtml"],
    envKeys: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    status: "pending-approval",
    pass: 4,
  },
  {
    id: "meta",
    name: "Meta / Instagram + Facebook",
    kind: ["social-signal"],
    description: "Instagram public posts and Facebook public events. Feeds into artist activity signals.",
    fields: ["instagramPosts", "facebookEvents"],
    envKeys: ["META_APP_ID", "META_APP_SECRET", "META_APP_ACCESS_TOKEN"],
    status: "active",
    pass: 4,
  },
  {
    id: "bandcamp",
    name: "Bandcamp",
    kind: ["data-source"],
    description: "oEmbed player for Bandcamp releases detected via MusicBrainz URL relations.",
    fields: ["bandcampEmbed"],
    envKeys: [],
    status: "active",
    pass: 4,
  },
];

export function findPlatformNode(id: string): PlatformNode | undefined {
  return platformNodes.find((n) => n.id === id);
}

export function getPlatformNodesByKind(kind: PlatformNodeKind): PlatformNode[] {
  return platformNodes.filter((n) => n.kind.includes(kind));
}
