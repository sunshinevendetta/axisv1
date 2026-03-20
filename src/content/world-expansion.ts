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
    summary: "Industrial drift, ambient tension, and spatial composition logic inside the SPECTRA orbit.",
    linkedEpisodes: [
      { label: "SPECTRA I" },
      { label: "HYPERBASS activation", href: "/magazine/mixtapes" },
    ],
    linkedArtifacts: [
      { label: "CYBEREALITY for HYPERBASS", href: "/magazine/mixtapes" },
      { label: "Composing in the Dark interview", href: "/magazine" },
    ],
    spaces: [
      { name: "Basement studio", episode: "SPECTRA I", note: "Activated listening environment tied to the first live set." },
    ],
    signals: [
      { timestamp: "2026-03-15", text: "Interview published in Spectra Journal.", link: { label: "Open Magazine", href: "/magazine" } },
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
      { label: "SPECTRA II" },
    ],
    linkedArtifacts: [
      { label: "HYPERBASS RADIO — Final Mix", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Radio floor", episode: "SPECTRA II", note: "Activated transmission room tied to the second episode mix system." },
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
    summary: "Warm system pressure, groove persistence, and optimistic drift inside the SPECTRA tape layer.",
    linkedEpisodes: [
      { label: "SPECTRA III" },
    ],
    linkedArtifacts: [
      { label: "Sunshine Mix", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Sun room", episode: "SPECTRA III", note: "Activated location for daytime-to-night transition energy." },
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
      { label: "SPECTRA III" },
      { label: "Episode III recap", href: "/magazine" },
    ],
    linkedArtifacts: [
      { label: "Bedroom Mixtape — Synthesis", href: "/magazine/mixtapes" },
    ],
    spaces: [
      { name: "Warehouse main room", episode: "SPECTRA III", note: "Activated live zone described in the Episode III dispatch." },
      { name: "Bedroom synthesis room", episode: "SPECTRA III", note: "Standalone recording environment tied to the mixtape artifact." },
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
    summary: "Field recordings, transit compression, and editorial sound selection folded into live SPECTRA environments.",
    linkedEpisodes: [
      { label: "SPECTRA III" },
      { label: "Transit Sounds interview", href: "/magazine" },
    ],
    linkedArtifacts: [
      { label: "Sounds Collected in Transit", href: "/magazine" },
      { label: "Episode III dispatch", href: "/magazine" },
    ],
    spaces: [
      { name: "Transit capture layer", episode: "SPECTRA III", note: "Activated sonic material sourced from airports, terminals, and buses." },
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
