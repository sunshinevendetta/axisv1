import rawEpisodeCatalog from "@/content/episodes.json";
import type { EpisodeAsset } from "@/src/types/episode";

export type EpisodeStatus = "open" | "locked";

export type EpisodeMeta = {
  es?: string;
  en?: string;
  music?: string[];
  allies?: string[];
  venue?: string;
  tags?: string[];
};

export type EpisodeCatalogEntry = {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  status: EpisodeStatus;
  season: number;
  year: number;
  startsAt: string;
  timezone: string;
  venueName: string;
  city: string;
  summary: string;
  description: string;
  meta?: EpisodeMeta;
  lumaEventId?: string;
  lumaUrl?: string;
  registryEventId?: number;
  assets: {
    sourceUri: string;
    glbUri: string;
    videoUri?: string;
    imageUri?: string;
    posterUri: string;
    meshTarget?: string;
    scale?: EpisodeAsset["scale"];
    position?: EpisodeAsset["position"];
    rotation?: EpisodeAsset["rotation"];
    ar?: EpisodeAsset["ar"];
  };
};

export const episodeCatalog = rawEpisodeCatalog as EpisodeCatalogEntry[];
