export type ARAppCollectStatus = "live" | "member-access" | "coming-soon" | "sold-out";

export type ARAppCollectTrait = {
  trait_type: string;
  value: string;
};

export type ARAppCollectMetadataProperties = {
  artist: string;
  subtitle: string;
  edition: string;
  format: string;
  surface: string;
  delivery: string;
  utilities: string[];
  chips: string[];
  model: string;
};

export type ARAppCollectMetadata = {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  attributes: ARAppCollectTrait[];
  properties?: Partial<ARAppCollectMetadataProperties>;
};

export type ARAppCollectToken = {
  tokenId: number;
  slug: string;
  episode: number;
  status: ARAppCollectStatus;
  remaining: number;
  metadata: ARAppCollectMetadata;
};

// ─── Episode configuration ────────────────────────────────────────────────────

export type EpisodeConfig = {
  slug: string;       // e.g. "episode-1"
  label: string;      // e.g. "Episode 1"
  number: number;
  tokenIds: number[];
};

export const EPISODE_CONFIG: EpisodeConfig[] = [
  { slug: "episode-1", label: "Episode 1", number: 1, tokenIds: [0, 1] },
  { slug: "episode-2", label: "Episode 2", number: 2, tokenIds: [2, 3] },
];

export function getEpisodeBySlug(slug: string): EpisodeConfig | undefined {
  return EPISODE_CONFIG.find((e) => e.slug === slug);
}

export type ARAppCollectDrop = {
  id: string;
  tokenId: number;
  episode: number;
  episodeSlug: string;
  title: string;
  subtitle: string;
  artist: string;
  edition: string;
  remaining: number;
  status: ARAppCollectStatus;
  image: string;
  model: string;
  format: string;
  surface: string;
  delivery: string;
  summary: string;
  utilities: string[];
  chips: string[];
  attributes: ARAppCollectTrait[];
};

export const arappCollectCollection = {
  title: "SPECTRA Collect",
  eyebrow: "ERC-1155 Metadata Registry",
  season: "Episode Next",
  description:
    "Metadata-driven ERC-1155 artwork claims for the current SPECTRA episode collection.",
  launchWindow:
    "Collect pages should render from the same token metadata URI payloads that wallets and marketplaces resolve.",
};

export const arappCollectTokens: ARAppCollectToken[] = [
  {
    tokenId: 0,
    slug: "ep1-t0",
    episode: 1,
    status: "live",
    remaining: 188,
    metadata: {
      name: "Portal Pass",
      description:
        "Core entry collectible for the AR scene release. The metadata payload is the source of truth for storefront copy, token identity, and traits.",
      image: "/ep3.webp",
      animation_url: "/assets/3d/episode1/ep1-t0.glb",
      external_url: "/arapp/collect/episode-1/0",
      attributes: [
        { trait_type: "Artist", value: "SPECTRA System" },
        { trait_type: "Edition", value: "Open for episode window" },
        { trait_type: "Format", value: "Dynamic AR access collectible" },
        { trait_type: "Surface", value: "Scene unlock + collector badge" },
        { trait_type: "Claim Status", value: "live" },
      ],
      properties: {
        artist: "SPECTRA System",
        subtitle: "The core entry collectible for the AR scene release.",
        edition: "Open for episode window",
        format: "Dynamic AR access collectible",
        surface: "Scene unlock + collector badge",
        delivery: "Instant wallet delivery after claim",
        utilities: [
          "Unlocks the first AR scene pack",
          "Marks collector wallet for future drops",
          "Includes launch badge metadata",
        ],
        chips: ["AR", "Access", "Live"],
        model: "/assets/3d/episode1/ep1-t0.glb",
      },
    },
  },
  {
    tokenId: 1,
    slug: "ep1-t1",
    episode: 1,
    status: "member-access",
    remaining: 94,
    metadata: {
      name: "Signal Fragment",
      description:
        "Fixed-edition visual fragment from the episode world build. Metadata carries the real artwork name, status, and collectible traits.",
      image: "/ep1-5.webp",
      animation_url: "/assets/3d/episode1/ep1-t1.glb",
      external_url: "/arapp/collect/episode-1/1",
      attributes: [
        { trait_type: "Artist", value: "SPECTRA Studio" },
        { trait_type: "Edition", value: "222 editions" },
        { trait_type: "Format", value: "Edition collectible" },
        { trait_type: "Surface", value: "Still + animated metadata layers" },
        { trait_type: "Claim Status", value: "member-access" },
      ],
      properties: {
        artist: "SPECTRA Studio",
        subtitle: "A fixed-edition visual fragment from the episode world build.",
        edition: "222 editions",
        format: "Edition collectible",
        surface: "Still + animated metadata layers",
        delivery: "Claim window opens after wallet verification",
        utilities: [
          "Priority access for holder wallets",
          "Upgradeable metadata layer",
          "Eligible for event-side unlock campaigns",
        ],
        chips: ["Limited", "Members", "Priority"],
        model: "/assets/3d/episode1/ep1-t1.glb",
      },
    },
  },
  {
    tokenId: 2,
    slug: "ep2-t0",
    episode: 2,
    status: "coming-soon",
    remaining: 333,
    metadata: {
      name: "After Room Skin",
      description:
        "A cosmetic layer intended for future in-scene identity expression. The token metadata should drive the upcoming release details.",
      image: "/ep1.webp",
      animation_url: "/assets/3d/episode2/ep2-t0.glb",
      external_url: "/arapp/collect/episode-2/2",
      attributes: [
        { trait_type: "Artist", value: "SPECTRA x Guests" },
        { trait_type: "Edition", value: "333 editions" },
        { trait_type: "Format", value: "Wearable skin" },
        { trait_type: "Surface", value: "Avatar-linked cosmetic" },
        { trait_type: "Claim Status", value: "coming-soon" },
      ],
      properties: {
        artist: "SPECTRA x Guests",
        subtitle: "A cosmetic layer intended for future in-scene identity expression.",
        edition: "333 editions",
        format: "Wearable skin",
        surface: "Avatar-linked cosmetic",
        delivery: "Queued for the second release wave",
        utilities: [
          "Reserved for the next wave",
          "Future avatar-surface integration",
          "Pairs with Portal Pass holders",
        ],
        chips: ["Wearable", "Soon", "Cosmetic"],
        model: "/assets/3d/episode2/ep2-t0.glb",
      },
    },
  },
  {
    tokenId: 3,
    slug: "ep2-t1",
    episode: 2,
    status: "sold-out",
    remaining: 0,
    metadata: {
      name: "Archive Poster",
      description:
        "Collector-facing archive piece tied to the release campaign. The sold-out state should still be expressed from metadata, not hardcoded page text.",
      image: "/poster.jpg",
      animation_url: "/assets/3d/episode2/ep2-t1.glb",
      external_url: "/arapp/collect/episode-2/3",
      attributes: [
        { trait_type: "Artist", value: "SPECTRA Archive" },
        { trait_type: "Edition", value: "64 signed copies" },
        { trait_type: "Format", value: "Archive collectible" },
        { trait_type: "Surface", value: "Poster + provenance layer" },
        { trait_type: "Claim Status", value: "sold-out" },
      ],
      properties: {
        artist: "SPECTRA Archive",
        subtitle: "A collector-facing archive piece tied to the release campaign.",
        edition: "64 signed copies",
        format: "Archive collectible",
        surface: "Poster + provenance layer",
        delivery: "Archived release",
        utilities: [
          "Archived sold-out marker",
          "Reference for scarcity pacing",
          "Signals collection depth",
        ],
        chips: ["Archive", "Sold Out", "Reference"],
        model: "/assets/3d/episode2/ep2-t1.glb",
      },
    },
  },
];

export function getARAppCollectTokenBySlug(slug: string) {
  return arappCollectTokens.find((token) => token.slug === slug);
}

export function getARAppCollectTokenByTokenId(tokenId: number) {
  return arappCollectTokens.find((token) => token.tokenId === tokenId);
}

export function buildARAppCollectMetadata(token: ARAppCollectToken) {
  return token.metadata;
}

function getTraitValue(metadata: ARAppCollectMetadata, traitType: string) {
  return metadata.attributes.find((trait) => trait.trait_type === traitType)?.value;
}

function resolveMetadataProperties(token: ARAppCollectToken) {
  const properties = token.metadata.properties ?? {};

  return {
    artist: properties.artist ?? getTraitValue(token.metadata, "Artist") ?? "Unknown Artist",
    subtitle: properties.subtitle ?? token.metadata.description,
    edition: properties.edition ?? getTraitValue(token.metadata, "Edition") ?? "Open edition",
    format: properties.format ?? getTraitValue(token.metadata, "Format") ?? "Collectible",
    surface: properties.surface ?? getTraitValue(token.metadata, "Surface") ?? "Digital object",
    delivery: properties.delivery ?? "Delivered to wallet after claim",
    utilities: properties.utilities ?? [],
    chips: properties.chips ?? [],
    model: properties.model ?? token.metadata.animation_url,
  };
}

export function toARAppCollectDrop(token: ARAppCollectToken): ARAppCollectDrop {
  const episodeSlug = `episode-${token.episode}`;
  const properties = resolveMetadataProperties(token);
  return {
    id: token.slug,
    tokenId: token.tokenId,
    episode: token.episode,
    episodeSlug,
    title: token.metadata.name,
    subtitle: properties.subtitle,
    artist: properties.artist,
    edition: properties.edition,
    remaining: token.remaining,
    status: token.status,
    image: token.metadata.image,
    model: properties.model,
    format: properties.format,
    surface: properties.surface,
    delivery: properties.delivery,
    summary: token.metadata.description,
    utilities: properties.utilities,
    chips: properties.chips,
    attributes: token.metadata.attributes,
  };
}

export function getARAppCollectDropBySlug(slug: string) {
  const token = getARAppCollectTokenBySlug(slug);
  return token ? toARAppCollectDrop(token) : undefined;
}

export function getARAppCollectDrops() {
  return arappCollectTokens.map(toARAppCollectDrop);
}

export function getTokensByEpisode(episodeSlug: string): ARAppCollectToken[] {
  const config = getEpisodeBySlug(episodeSlug);
  if (!config) return [];
  return arappCollectTokens.filter((t) => config.tokenIds.includes(t.tokenId));
}

export function getDropsByEpisode(episodeSlug: string): ARAppCollectDrop[] {
  return getTokensByEpisode(episodeSlug).map(toARAppCollectDrop);
}

export function getARAppCollectDropByTokenId(tokenId: number): ARAppCollectDrop | undefined {
  const token = getARAppCollectTokenByTokenId(tokenId);
  return token ? toARAppCollectDrop(token) : undefined;
}
