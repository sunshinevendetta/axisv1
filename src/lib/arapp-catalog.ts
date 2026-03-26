export type ARAppDropStatus = "live" | "member-access" | "coming-soon" | "sold-out";

export type ARAppDrop = {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  priceUsd: number;
  edition: string;
  remaining: number;
  status: ARAppDropStatus;
  image: string;
  /** Path to the ERC-1155 collectible GLB inside public/assets/3d/episodeN/ */
  model: string;
  episode: number;
  format: string;
  surface: string;
  delivery: string;
  summary: string;
  utilities: string[];
  chips: string[];
};

export const arappCollection = {
  title: "AXIS Augmented Reality",
  eyebrow: "Next Episode Commerce Layer",
  season: "Episode Next",
  description:
    "A marketplace-style drop surface for the next AXIS episode: collectible AR unlocks, scene-bound editions, and wallet-native access products designed to feel premium before the first live release even lands.",
  launchWindow:
    "Collector preview mode is live now. Commerce handoff can be enabled as soon as Coinbase credentials are configured.",
};

export const arappDrops: ARAppDrop[] = [
  {
    id: "ep1-0",
    title: "Portal Pass // Prism Entry",
    subtitle: "The core entry collectible for the AR scene release.",
    artist: "AXIS System",
    priceUsd: 45,
    edition: "Open for episode window",
    remaining: 188,
    status: "live",
    image: "/ep3.webp",
    model: "/assets/3d/episode1/ep1-0.glb",
    episode: 1,
    format: "Dynamic AR access collectible",
    surface: "Scene unlock + collector badge",
    delivery: "Instant wallet delivery after claim",
    summary:
      "Designed as the first-access key for the ARApp chapter. It unlocks the launch scene, collector role framing, and the first release channel.",
    utilities: [
      "Unlocks the first AR scene pack",
      "Marks collector wallet for future drops",
      "Includes launch badge metadata",
    ],
    chips: ["AR", "Access", "Live"],
  },
  {
    id: "ep1-1",
    title: "Signal Fragment // Edition 01",
    subtitle: "A fixed-edition visual fragment from the episode world build.",
    artist: "AXIS Studio",
    priceUsd: 85,
    edition: "222 editions",
    remaining: 94,
    status: "member-access",
    image: "/ep1-5.webp",
    model: "/assets/3d/episode1/ep1-1.glb",
    episode: 1,
    format: "Edition collectible",
    surface: "Still + animated metadata layers",
    delivery: "Claim window opens after wallet verification",
    summary:
      "This release is aimed at collector wallets first. It behaves like a limited scene fragment with access-first pricing and richer metadata treatment.",
    utilities: [
      "Priority access for holder wallets",
      "Upgradeable metadata layer",
      "Eligible for event-side unlock campaigns",
    ],
    chips: ["Limited", "Members", "Priority"],
  },
  {
    id: "ep2-0",
    title: "After Room Skin // Wearable Shell",
    subtitle: "A cosmetic layer intended for future in-scene identity expression.",
    artist: "AXIS x Guests",
    priceUsd: 65,
    edition: "333 editions",
    remaining: 333,
    status: "coming-soon",
    image: "/ep1.webp",
    model: "/assets/3d/episode2/ep2-0.glb",
    episode: 2,
    format: "Wearable skin",
    surface: "Avatar-linked cosmetic",
    delivery: "Queued for the second release wave",
    summary:
      "A wearable-ready visual shell planned for the next drop wave. It is visible now so the storefront already feels like a living collection rather than a single-button launch page.",
    utilities: [
      "Reserved for the next wave",
      "Future avatar-surface integration",
      "Pairs with Portal Pass holders",
    ],
    chips: ["Wearable", "Soon", "Cosmetic"],
  },
  {
    id: "ep2-1",
    title: "Archive Poster // Black Room Print",
    subtitle: "A collector-facing archive piece tied to the release campaign.",
    artist: "AXIS Archive",
    priceUsd: 120,
    edition: "64 signed copies",
    remaining: 0,
    status: "sold-out",
    image: "/poster.jpg",
    model: "/assets/3d/episode2/ep2-1.glb",
    episode: 2,
    format: "Archive collectible",
    surface: "Poster + provenance layer",
    delivery: "Archived release",
    summary:
      "Included as a sold-out anchor item so the marketplace already shows depth, scarcity, and release history from day one.",
    utilities: [
      "Archived sold-out marker",
      "Reference for scarcity pacing",
      "Signals collection depth",
    ],
    chips: ["Archive", "Sold Out", "Reference"],
  },
];

export function getARAppDropById(id: string) {
  return arappDrops.find((drop) => drop.id === id);
}

export const STORE_EPISODE_CONFIG = [
  { slug: "episode-1", label: "Episode 1", number: 1 },
  { slug: "episode-2", label: "Episode 2", number: 2 },
] as const;

export type StoreEpisodeSlug = typeof STORE_EPISODE_CONFIG[number]["slug"];

export function getStoreEpisodeBySlug(slug: string) {
  return STORE_EPISODE_CONFIG.find((e) => e.slug === slug);
}

export function getDropsByEpisode(episodeNumber: number): ARAppDrop[] {
  return arappDrops.filter((d) => d.episode === episodeNumber);
}
