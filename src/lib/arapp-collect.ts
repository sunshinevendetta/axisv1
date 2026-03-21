import {
  collectiblesCatalog,
  type ARAppCollectMetadata,
  type ARAppCollectMetadataProperties,
  type ARAppCollectStatus,
  type ARAppCollectTrait,
} from "@/src/content/collectibles";
import { episodeCatalog } from "@/src/content/episodes";

export type ARAppCollectToken = {
  tokenId: number;
  slug: string;
  episode: number;
  episodeSlug: string;
  status: ARAppCollectStatus;
  remaining: number;
  metadata: ARAppCollectMetadata;
};

// ─── Episode configuration ────────────────────────────────────────────────────

export type EpisodeConfig = {
  slug: string;
  label: string;
  number: number;
  claimOpen: boolean;
  chainId?: number;
  contractAddress?: string;
  tokenIds: number[];
};

function resolveEffectiveStatus(status: ARAppCollectStatus, claimOpen: boolean): ARAppCollectStatus {
  if (claimOpen) {
    return status === "coming-soon" ? "live" : status;
  }

  if (status === "live" || status === "member-access") {
    return "coming-soon";
  }

  return status;
}

export const EPISODE_CONFIG: EpisodeConfig[] = episodeCatalog.map((episode) => {
  const configuredEpisode = collectiblesCatalog.episodes.find((entry) => entry.slug === episode.slug);

  return {
    slug: episode.slug,
    label: `Episode ${episode.id}`,
    number: episode.id,
    claimOpen: configuredEpisode?.claimOpen ?? false,
    chainId: configuredEpisode?.chainId,
    contractAddress: configuredEpisode?.contractAddress,
    tokenIds: configuredEpisode?.tokens.map((token) => token.tokenId) ?? [],
  };
});

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
  mediaKind: string;
  format: string;
  surface: string;
  delivery: string;
  summary: string;
  utilities: string[];
  chips: string[];
  attributes: ARAppCollectTrait[];
};

export const arappCollectCollection = {
  ...collectiblesCatalog.collection,
};

export const arappCollectTokens: ARAppCollectToken[] = collectiblesCatalog.episodes.flatMap((episode) =>
  episode.tokens.map((token) => ({
    tokenId: token.tokenId,
    slug: `${episode.slug}-${token.tokenId}`,
    episode: Number(episode.slug.replace("episode-", "")),
    episodeSlug: episode.slug,
    status: resolveEffectiveStatus(token.status, episode.claimOpen),
    remaining: token.remaining,
    metadata: {
      ...token.metadata,
      attributes: token.metadata.attributes.map((attribute) =>
        attribute.trait_type === "Claim Status"
          ? { ...attribute, value: resolveEffectiveStatus(token.status, episode.claimOpen) }
          : attribute,
      ),
    },
  })),
);

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
    mediaKind: properties.mediaKind ?? "",
  };
}

export function toARAppCollectDrop(token: ARAppCollectToken): ARAppCollectDrop {
  const properties = resolveMetadataProperties(token);
  return {
    id: token.slug,
    tokenId: token.tokenId,
    episode: token.episode,
    episodeSlug: token.episodeSlug,
    title: token.metadata.name,
    subtitle: properties.subtitle,
    artist: properties.artist,
    edition: properties.edition,
    remaining: token.remaining,
    status: token.status,
    image: token.metadata.image,
    model: properties.model,
    mediaKind: properties.mediaKind,
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
