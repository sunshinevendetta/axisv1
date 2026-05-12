import type { ARAppCollectStatus } from "@/src/content/collectibles";

export type AxisGraphNodeType =
  | "episode"
  | "artist"
  | "article"
  | "transmission"
  | "drop"
  | "membership"
  | "space"
  | "org"
  // ── Platform / data source node types ──────────────────────────────────────
  | "platform-video"          // YouTube
  | "platform-event"          // Resident Advisor (events + profiles)
  | "platform-physical"       // Discogs (vinyl / physical releases)
  | "platform-mix"            // Mixcloud (DJ sets / mixes)
  | "platform-identity"       // Knowledge Graph / Wikidata (canonical identity)
  | "platform-social"         // TikTok, Meta/Instagram (social signal)
  | "platform-music";         // Bandcamp (music storefront)

export type AxisNodeRelationKey =
  | "articles"
  | "artists"
  | "drops"
  | "episodes"
  | "memberships"
  | "related"
  | "spaces"
  | "transmissions"
  | "next"
  // ── Platform connection types ────────────────────────────────────────────
  | "youtube-channel"         // artist → YouTube channel node
  | "ra-profile"              // artist → RA profile node
  | "ra-event"                // artist → RA event (date, venue, city)
  | "ra-promoter"             // artist → RA promoter entity
  | "discogs-release"         // artist → Discogs physical release
  | "mixcloud-set"            // artist → Mixcloud mix/set
  | "wikidata-entity";        // artist → Wikidata / Knowledge Graph entity

export type AxisNodeRelations = {
  parent?: string;
  episode?: string;
  artist?: string;
} & Partial<Record<AxisNodeRelationKey, string[]>>;

export type AxisNodeAction = {
  label: string;
  type: "collect" | "listen" | "read" | "visit" | "join";
  target: string;
};

export type AxisNodeSurfaceMap = {
  canonical?: string;
  web?: string[];
  ar?: string[];
};

export type AxisNodeMedia = {
  cover?: string;
  image?: string;
  audio?: string;
  video?: string;
  model?: string;
};

export type AxisGraphNodeAttributes = Record<
  string,
  string | number | boolean | string[]
>;

export type AxisGraphNodeToken = {
  contract?: string;
  tokenId?: string;
  claimable?: boolean;
  status?: ARAppCollectStatus;
  remaining?: number;
};

export type AxisGraphNodeEvent = {
  date?: string;
  timezone?: string;
  venue?: string;
  city?: string;
};

export type AxisGraphNodeActions = {
  primary?: AxisNodeAction;
};

export type AxisGraphNode = {
  id: string;
  type: AxisGraphNodeType;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  surfaces?: AxisNodeSurfaceMap;
  media?: AxisNodeMedia;
  token?: AxisGraphNodeToken;
  event?: AxisGraphNodeEvent;
  attributes?: AxisGraphNodeAttributes;
  actions?: AxisGraphNodeActions;
  relations: AxisNodeRelations;
};

export type AxisGraphSite = {
  primaryDomain: string;
  canonicalDomain: string;
  brand: {
    primary: string;
    legacy: string[];
    tagline: string;
  };
};

export type AxisNodesFile = {
  version: string;
  generatedAt: string;
  site: AxisGraphSite;
  nodes: Record<string, AxisGraphNode>;
};

export type AxisRouteIndexFile = {
  version: string;
  generatedAt: string;
  routes: Record<string, string>;
  canonical: Record<string, string>;
};

export type AxisGraph = {
  version: string;
  generatedAt: string;
  site: AxisGraphSite;
  nodes: Record<string, AxisGraphNode>;
  routes: Record<string, string>;
  canonical: Record<string, string>;
};
