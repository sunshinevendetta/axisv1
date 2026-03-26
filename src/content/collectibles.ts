import rawCollectiblesCatalog from "@/content/episode-collectibles.json";

export type ARAppCollectStatus = "live" | "member-access" | "coming-soon" | "sold-out";

export type ARAppCollectTrait = {
  trait_type: string;
  value: string;
};

export type ARAppCollectMetadataProperties = {
  artist: string;
  title?: string;
  episode?: string;
  date?: string;
  mediaKind?: string;
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

export type EpisodeCollectibleTokenRecord = {
  tokenId: number;
  status: ARAppCollectStatus;
  remaining: number;
  metadata: ARAppCollectMetadata;
};

export type EpisodeCollectibleRecord = {
  slug: string;
  claimOpen: boolean;
  chainId?: number;
  contractAddress?: string;
  baseUri?: string;
  collectionMetadataUri?: string;
  nfcBaseUrl?: string;
  tokens: EpisodeCollectibleTokenRecord[];
};

export type EpisodeCollectiblesCatalog = {
  collection: {
    title: string;
    eyebrow: string;
    season: string;
    description: string;
    launchWindow: string;
  };
  episodes: EpisodeCollectibleRecord[];
};

export const collectiblesCatalog = rawCollectiblesCatalog as EpisodeCollectiblesCatalog;
