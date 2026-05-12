import rawMagazine from "@/content/magazine.json";
import rawMixtapes from "@/content/mixtapes.json";
import {
  collectiblesCatalog,
  type ARAppCollectMetadata,
  type ARAppCollectStatus,
} from "@/src/content/collectibles";
import {
  artistProfiles,
  findArtistProfile,
  type ArtistProfile,
} from "@/src/content/artists";
import { episodeCatalog, type EpisodeCatalogEntry } from "@/src/content/episodes";
import type { MagazineArticle } from "@/src/types/magazine";
import type { Mixtape } from "@/src/types/mixtape";
import type {
  AxisGraph,
  AxisGraphNode,
  AxisGraphSite,
  AxisNodeRelationKey,
  AxisNodesFile,
  AxisRouteIndexFile,
} from "@/src/types/graph";

export type {
  AxisGraph,
  AxisGraphNode,
  AxisGraphNodeType,
  AxisGraphSite,
  AxisNodeRelationKey,
  AxisNodesFile,
  AxisRouteIndexFile,
} from "@/src/types/graph";

const GRAPH_VERSION = "1.0.0";
const SITE: AxisGraphSite = {
  primaryDomain: "axis.show",
  canonicalDomain: "axis.show",
  brand: {
    primary: "AXIS",
    legacy: ["AXIS", "Axis"],
    tagline: "UNEXPECTED ART EXPERIENCES",
  },
};

const magazineArticles = rawMagazine as MagazineArticle[];
const mixtapes = rawMixtapes as Mixtape[];

const ROMAN_NUMERALS: Record<number, string> = {
  1: "i",
  2: "ii",
  3: "iii",
  4: "iv",
  5: "v",
  6: "vi",
  7: "vii",
  8: "viii",
  9: "ix",
  10: "x",
  11: "xi",
  12: "xii",
};

function addUnique(values: string[] | undefined, value: string): string[] {
  if (!value) return values ?? [];
  if (!values) return [value];
  return values.includes(value) ? values : [...values, value];
}

function addRelation(
  nodes: Record<string, AxisGraphNode>,
  sourceId: string,
  key: AxisNodeRelationKey,
  targetId: string,
) {
  const source = nodes[sourceId];
  if (!source || !targetId || !nodes[targetId]) return;
  source.relations[key] = addUnique(source.relations[key], targetId);
}

function connectBidirectional(
  nodes: Record<string, AxisGraphNode>,
  sourceId: string,
  sourceKey: AxisNodeRelationKey,
  targetId: string,
  targetKey: AxisNodeRelationKey,
) {
  addRelation(nodes, sourceId, sourceKey, targetId);
  addRelation(nodes, targetId, targetKey, sourceId);
}

function articleText(article: MagazineArticle): string {
  return [
    article.title,
    article.subtitle,
    article.excerpt,
    ...article.content.map((block) => block.text),
  ]
    .join(" ")
    .toLowerCase();
}

function episodeMentionsArticle(
  article: MagazineArticle,
  episode: EpisodeCatalogEntry,
): boolean {
  const haystack = articleText(article);
  const numericEpisode = `episode ${episode.id}`;
  const romanEpisode = `episode ${ROMAN_NUMERALS[episode.id] ?? ""}`;
  return [
    episode.slug,
    episode.title.toLowerCase(),
    episode.shortTitle.toLowerCase(),
    numericEpisode,
    romanEpisode,
  ].some((candidate) => candidate && haystack.includes(candidate));
}

function deriveArtistIds(names: string[]): string[] {
  return names
    .map((name) => findArtistProfile(name)?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `artist:${slug}`);
}

function buildEpisodeNode(episode: EpisodeCatalogEntry): AxisGraphNode {
  return {
    id: `episode:${episode.slug}`,
    type: "episode",
    slug: episode.slug,
    title: episode.title,
    summary: episode.summary,
    description: episode.description,
    surfaces: {
      canonical: `/arapp/collect/${episode.slug}`,
      web: [`/arapp/collect/${episode.slug}`],
      ar: [`/arapp/collect/${episode.slug}`],
    },
    media: {
      cover: episode.assets.posterUri,
      image: episode.assets.imageUri,
      video: episode.assets.videoUri,
      model: episode.assets.glbUri,
    },
    event: {
      date: episode.startsAt,
      timezone: episode.timezone,
      venue: episode.venueName,
      city: episode.city,
    },
    attributes: {
      season: episode.season,
      number: episode.id,
      status: episode.status,
      tags: episode.meta?.tags ?? [],
      music: episode.meta?.music ?? [],
      allies: episode.meta?.allies ?? [],
    },
    actions: {
      primary: {
        label: episode.status === "open" ? "Collect Episode" : "View Episode",
        type: "collect",
        target: `/arapp/collect/${episode.slug}`,
      },
    },
    relations: {
      artists: [],
      articles: [],
      drops: [],
      transmissions: [],
      related: [],
      next: [],
    },
  };
}

function buildDropNode(
  episode: EpisodeCatalogEntry,
  token: {
    tokenId: number;
    status: ARAppCollectStatus;
    remaining: number;
    metadata: ARAppCollectMetadata;
  },
  contractAddress?: string,
): AxisGraphNode {
  return {
    id: `drop:${episode.slug}:${token.tokenId}`,
    type: "drop",
    slug: `${episode.slug}-${token.tokenId}`,
    title: token.metadata.name,
    summary: token.metadata.description || episode.summary,
    description: token.metadata.description || episode.description,
    surfaces: {
      canonical: `/arapp/collect/${episode.slug}/${token.tokenId}`,
      web: [`/arapp/collect/${episode.slug}/${token.tokenId}`],
      ar: [`/arapp/collect/${episode.slug}/${token.tokenId}`],
    },
    media: {
      cover: token.metadata.image,
      image: token.metadata.image,
      video:
        token.metadata.properties?.mediaKind === "video"
          ? token.metadata.animation_url
          : undefined,
      model: token.metadata.properties?.model || undefined,
    },
    token: {
      contract: contractAddress,
      tokenId: String(token.tokenId),
      claimable: token.status === "live" || token.status === "member-access",
      status: token.status,
      remaining: token.remaining,
    },
    attributes: {
      edition: token.metadata.properties?.edition ?? "",
      artist: token.metadata.properties?.artist ?? "",
      episode: episode.slug,
      mediaKind: token.metadata.properties?.mediaKind ?? "",
    },
    actions: {
      primary: {
        label: "Collect Artifact",
        type: "collect",
        target: `/arapp/collect/${episode.slug}/${token.tokenId}`,
      },
    },
    relations: {
      episode: `episode:${episode.slug}`,
      artists: [],
      related: [],
      next: [],
    },
  };
}

function buildArtistNode(artist: ArtistProfile): AxisGraphNode {
  return {
    id: `artist:${artist.slug}`,
    type: "artist",
    slug: artist.slug,
    title: artist.name,
    summary: artist.shortBio || artist.summary,
    description: artist.summary,
    surfaces: {
      canonical: `/magazine/artists/${artist.slug}`,
      web: [`/magazine/artists/${artist.slug}`],
    },
    media: {
      cover: artist.coverImage ?? undefined,
      image: artist.profileImage ?? undefined,
    },
    attributes: {
      artistTypes: artist.artistTypes,
      genres: artist.genres,
      tags: artist.tags,
      featured: artist.featured,
    },
    actions: {
      primary: {
        label: "View Artist",
        type: "read",
        target: `/magazine/artists/${artist.slug}`,
      },
    },
    relations: {
      episodes: [],
      articles: [],
      drops: [],
      transmissions: [],
      related: [],
      next: [],
    },
  };
}

function buildArticleNode(article: MagazineArticle): AxisGraphNode {
  return {
    id: `article:${article.slug}`,
    type: "article",
    slug: article.slug,
    title: article.title,
    summary: article.excerpt,
    description: article.subtitle,
    surfaces: {
      web: ["/magazine"],
    },
    media: {
      image: article.image_url,
      cover: article.image_url,
    },
    attributes: {
      axis: article.axis ?? "",
      category: article.category,
      contentType: article.contentType ?? "",
      mode: article.mode ?? "",
      frame: article.frame ?? "",
      persona: article.persona ?? "",
      author: article.author,
      authorRole: article.authorRole,
      date: article.date,
      readTime: article.readTime,
      tags: article.tags,
      monetization: article.monetization ?? [],
    },
    actions: {
      primary: {
        label: "Read Article",
        type: "read",
        target: "/magazine",
      },
    },
    relations: {
      artists: [],
      episodes: [],
      related: [],
      next: [],
    },
  };
}

function buildTransmissionNode(mixtape: Mixtape): AxisGraphNode {
  return {
    id: `transmission:${mixtape.slug}`,
    type: "transmission",
    slug: mixtape.slug,
    title: mixtape.title,
    summary: mixtape.description,
    description: mixtape.description,
    surfaces: {
      canonical: `/magazine/mixtapes`,
      web: ["/magazine/mixtapes"],
    },
    media: {
      audio: mixtape.audioUrl,
      cover: mixtape.artworkUrl,
      image: mixtape.artworkUrl,
    },
    attributes: {
      date: mixtape.date,
      duration: mixtape.duration,
      episodeNumber: mixtape.episodeNumber,
      tags: mixtape.tags,
      artist: mixtape.artist,
    },
    actions: {
      primary: {
        label: "Listen",
        type: "listen",
        target: "/magazine/mixtapes",
      },
    },
    relations: {
      artists: [],
      episodes: [],
      related: [],
      next: [],
    },
  };
}

function buildMembershipNode(): AxisGraphNode {
  return {
    id: "membership:axis",
    type: "membership",
    slug: "membership",
    title: "AXIS Membership",
    summary: "Membership is the key to AXIS episodes, collectibles, editorial, and member access.",
    description: "One identity across AXIS episodes, members-only drops, magazine access, and AR objects.",
    surfaces: {
      canonical: "/membership",
      web: ["/membership", "/members"],
    },
    actions: {
      primary: {
        label: "Join Membership",
        type: "join",
        target: "/membership",
      },
    },
    relations: {
      related: [],
      next: [],
    },
  };
}

function compileGraphNodes(): Record<string, AxisGraphNode> {
  const nodes: Record<string, AxisGraphNode> = {};

  nodes["membership:axis"] = buildMembershipNode();

  for (const episode of episodeCatalog) {
    nodes[`episode:${episode.slug}`] = buildEpisodeNode(episode);
  }

  for (const artist of artistProfiles) {
    nodes[`artist:${artist.slug}`] = buildArtistNode(artist);
  }

  for (const article of magazineArticles) {
    nodes[`article:${article.slug}`] = buildArticleNode(article);
  }

  for (const mixtape of mixtapes) {
    nodes[`transmission:${mixtape.slug}`] = buildTransmissionNode(mixtape);
  }

  for (const episodeEntry of collectiblesCatalog.episodes) {
    const episode = episodeCatalog.find((entry) => entry.slug === episodeEntry.slug);
    if (!episode) continue;

    for (const token of episodeEntry.tokens) {
      const dropNode = buildDropNode(episode, token, episodeEntry.contractAddress);
      nodes[dropNode.id] = dropNode;
    }
  }

  return nodes;
}

function wireCompiledGraph(nodes: Record<string, AxisGraphNode>) {
  for (const episode of episodeCatalog) {
    const episodeId = `episode:${episode.slug}`;
    const artistIds = deriveArtistIds(episode.meta?.music ?? []);
    for (const artistId of artistIds) {
      connectBidirectional(nodes, episodeId, "artists", artistId, "episodes");
    }
  }

  for (const article of magazineArticles) {
    const articleId = `article:${article.slug}`;
    const linkedArtistIds = deriveArtistIds(article.linkedArtists ?? []);
    for (const artistId of linkedArtistIds) {
      connectBidirectional(nodes, articleId, "artists", artistId, "articles");
    }

    for (const episode of episodeCatalog) {
      if (episodeMentionsArticle(article, episode)) {
        connectBidirectional(nodes, articleId, "episodes", `episode:${episode.slug}`, "articles");
      }
    }
  }

  for (const mixtape of mixtapes) {
    const transmissionId = `transmission:${mixtape.slug}`;
    const episode = episodeCatalog.find((entry) => entry.id === mixtape.episodeNumber);
    if (episode) {
      connectBidirectional(
        nodes,
        transmissionId,
        "episodes",
        `episode:${episode.slug}`,
        "transmissions",
      );
    }

    const artist = findArtistProfile(mixtape.artist);
    if (artist) {
      connectBidirectional(
        nodes,
        transmissionId,
        "artists",
        `artist:${artist.slug}`,
        "transmissions",
      );
    }
  }

  for (const episodeEntry of collectiblesCatalog.episodes) {
    const episodeId = `episode:${episodeEntry.slug}`;
    for (const token of episodeEntry.tokens) {
      const dropId = `drop:${episodeEntry.slug}:${token.tokenId}`;
      connectBidirectional(nodes, dropId, "related", episodeId, "drops");

      const artistName = token.metadata.properties?.artist;
      const artist = artistName ? findArtistProfile(artistName) : null;
      if (artist) {
        connectBidirectional(nodes, dropId, "artists", `artist:${artist.slug}`, "drops");
      }
    }
  }

  for (const episode of episodeCatalog) {
    const currentId = `episode:${episode.slug}`;
    const nextEpisode = episodeCatalog.find((entry) => entry.id === episode.id + 1);
    if (nextEpisode) {
      addRelation(nodes, currentId, "next", `episode:${nextEpisode.slug}`);
    }
    addRelation(nodes, currentId, "related", "membership:axis");
    addRelation(nodes, "membership:axis", "related", currentId);
  }

  for (const artist of artistProfiles) {
    const artistId = `artist:${artist.slug}`;
    for (const similarName of artist.similar) {
      const similar = findArtistProfile(similarName);
      if (similar) {
        connectBidirectional(nodes, artistId, "related", `artist:${similar.slug}`, "related");
      }
    }
  }

  for (const node of Object.values(nodes)) {
    const next = node.relations.next ?? [];
    if (next.length > 0) continue;

    const fallbacks = [
      ...(node.relations.related ?? []),
      ...(node.relations.episodes ?? []),
      ...(node.relations.artists ?? []),
      ...(node.relations.drops ?? []),
      ...(node.relations.transmissions ?? []),
      ...(node.relations.articles ?? []),
    ].filter((value, index, array) => value !== node.id && array.indexOf(value) === index);

    node.relations.next = fallbacks.slice(0, 3);
  }
}

function buildRouteIndex(nodes: Record<string, AxisGraphNode>): AxisRouteIndexFile {
  const routes: Record<string, string> = {};
  const canonical: Record<string, string> = {};

  for (const node of Object.values(nodes)) {
    const canonicalRoute = node.surfaces?.canonical ?? node.surfaces?.web?.[0];
    if (canonicalRoute) {
      canonical[node.id] = canonicalRoute;
    }

    for (const route of node.surfaces?.web ?? []) {
      if (!route.includes("#")) {
        routes[route] = node.id;
      }
    }

    for (const route of node.surfaces?.ar ?? []) {
      if (!route.includes("#")) {
        routes[route] = node.id;
      }
    }
  }

  return {
    version: GRAPH_VERSION,
    generatedAt: new Date().toISOString(),
    routes,
    canonical,
  };
}

export function buildAxisGraph(): AxisGraph {
  const nodes = compileGraphNodes();
  wireCompiledGraph(nodes);
  const generatedAt = new Date().toISOString();
  const routeIndex = buildRouteIndex(nodes);

  return {
    version: GRAPH_VERSION,
    generatedAt,
    site: SITE,
    nodes,
    routes: routeIndex.routes,
    canonical: routeIndex.canonical,
  };
}

export function buildAxisGraphFiles(): {
  nodesFile: AxisNodesFile;
  routeIndexFile: AxisRouteIndexFile;
} {
  const graph = buildAxisGraph();

  return {
    nodesFile: {
      version: graph.version,
      generatedAt: graph.generatedAt,
      site: graph.site,
      nodes: graph.nodes,
    },
    routeIndexFile: {
      version: graph.version,
      generatedAt: graph.generatedAt,
      routes: graph.routes,
      canonical: graph.canonical,
    },
  };
}

