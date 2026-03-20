import { episodeCatalog, type EpisodeCatalogEntry, type EpisodeMeta } from "@/src/content/episodes";
import type { EpisodeAsset } from "@/src/types/episode";

export type { EpisodeMeta };

export type EpisodeCard = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  status: "open" | "locked";
  year: number;
  image: string;
  description: string;
  startsAt: string;
  timezone: string;
  handle?: string;
  lumaEvent?: string;
  lumaUrl?: string;
  registryEventId?: number;
  summary: string;
  venueName: string;
  city: string;
  meta?: EpisodeMeta;
  viewerAsset?: EpisodeAsset;
};

export type EpisodeTrait = {
  trait_type: string;
  value: string;
};

export type EpisodeMetadata = {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  attributes: EpisodeTrait[];
};

function formatEpisodeDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

function formatEpisodeDateLabel(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function getEpisodeCatalog() {
  return episodeCatalog;
}

export function getEpisodeBySlug(slug: string) {
  return episodeCatalog.find((episode) => episode.slug === slug);
}

export function getUpcomingEpisodes(): EpisodeCatalogEntry[] {
  const now = Date.now();
  return episodeCatalog
    .filter((ep) => new Date(ep.startsAt).getTime() > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function getNextUpcomingEpisode(): EpisodeCatalogEntry | undefined {
  return getUpcomingEpisodes()[0];
}

export function getEpisodeFromCatalog(catalog: EpisodeCatalogEntry[], slug: string) {
  return catalog.find((episode) => episode.slug === slug);
}

export function resolveEpisodeImageUri(episode: EpisodeCatalogEntry) {
  return episode.assets.imageUri ?? episode.assets.posterUri;
}

export function toEpisodeCard(episode: EpisodeCatalogEntry): EpisodeCard {
  return {
    id: episode.id,
    slug: episode.slug,
    title: episode.shortTitle,
    subtitle: formatEpisodeDate(episode.startsAt),
    status: episode.status,
    year: episode.year,
    image: resolveEpisodeImageUri(episode),
    description: episode.description,
    startsAt: episode.startsAt,
    timezone: episode.timezone,
    handle: episode.status === "locked" ? "locked" : "",
    lumaEvent: episode.lumaEventId,
    lumaUrl: episode.lumaUrl,
    registryEventId: episode.registryEventId,
    summary: episode.summary,
    venueName: episode.venueName,
    city: episode.city,
    meta: episode.meta,
    viewerAsset: {
      id: episode.slug,
      modelUrl: episode.assets.glbUri,
      videoUrl: episode.assets.videoUri,
      posterUrl: episode.assets.imageUri ?? episode.assets.posterUri,
      meshTarget: episode.assets.meshTarget,
      scale: episode.assets.scale,
      position: episode.assets.position,
      rotation: episode.assets.rotation,
      ar: episode.assets.ar,
    },
  };
}

export function getEpisodeCards() {
  return episodeCatalog.map(toEpisodeCard);
}

export function getEpisodeCardsFromCatalog(catalog: EpisodeCatalogEntry[]) {
  return catalog.map(toEpisodeCard);
}

export function buildEpisodeTraits(episode: EpisodeCatalogEntry): EpisodeTrait[] {
  return [
    { trait_type: "Event", value: episode.title },
    { trait_type: "Date", value: formatEpisodeDateLabel(episode.startsAt) },
    { trait_type: "Season", value: `Season ${episode.season}` },
    { trait_type: "Episode", value: `Episode ${episode.id}` },
    { trait_type: "Venue", value: episode.venueName },
    { trait_type: "City", value: episode.city },
    { trait_type: "Status", value: episode.status },
    { trait_type: "Timezone", value: episode.timezone },
  ];
}

export function buildEpisodeMetadata(episode: EpisodeCatalogEntry): EpisodeMetadata {
  return {
    name: episode.title,
    description: episode.description,
    image: resolveEpisodeImageUri(episode),
    animation_url: episode.assets.glbUri,
    external_url: episode.lumaUrl ?? `/episodes/${episode.slug}`,
    attributes: buildEpisodeTraits(episode),
  };
}

export function buildEpisodeRegistryPayload(episode: EpisodeCatalogEntry) {
  return {
    name: episode.title,
    metadataURI: `/api/episodes/${episode.slug}/metadata`,
    active: episode.status === "open",
  };
}

export function buildEpisodeAutomationSnapshot(episode: EpisodeCatalogEntry) {
  return {
    ...toEpisodeCard(episode),
    startsAt: episode.startsAt,
    timezone: episode.timezone,
    description: episode.description,
    sourceUri: episode.assets.sourceUri,
    glbUri: episode.assets.glbUri,
    imageUri: resolveEpisodeImageUri(episode),
    registry: buildEpisodeRegistryPayload(episode),
    metadata: buildEpisodeMetadata(episode),
  };
}

export function buildEpisodeAutomationSnapshotFromCatalog(catalog: EpisodeCatalogEntry[]) {
  return catalog.map(buildEpisodeAutomationSnapshot);
}
