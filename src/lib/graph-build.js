import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const GRAPH_VERSION = "1.0.0";

const sourcePaths = [
  "content/episodes.json",
  "content/episode-collectibles.json",
  "content/music-artists.json",
  "public/data/artists.json",
  "content/magazine.json",
  "content/mixtapes.json",
  "data/articles/index.json",
];

const outputPaths = [
  "content/graph/nodes.json",
  "content/graph/route-index.json",
];

function repoPath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readJson(relativePath, fallback) {
  try {
    return JSON.parse(await readFile(repoPath(relativePath), "utf8"));
  } catch (error) {
    if (fallback !== undefined && error && error.code === "ENOENT") {
      return fallback;
    }
    throw new Error(`Failed to read ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstText(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function relationIdsFromArtistNames(names) {
  return asArray(names)
    .map((name) => `artist:${slugify(name)}`)
    .filter((id) => id !== "artist:");
}

function addNode(nodes, node) {
  if (!node.id || nodes[node.id]) {
    return;
  }
  nodes[node.id] = node;
}

function buildMembershipNode(episodes) {
  const episodeIds = episodes.map((episode) => `episode:${episode.slug}`);
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
      primary: { label: "Join Membership", type: "join", target: "/membership" },
    },
    relations: {
      related: episodeIds,
      next: episodeIds.slice(0, 3),
    },
  };
}

function buildEpisodeNode(episode) {
  const canonical = `/arapp/collect/${episode.slug}`;
  return {
    id: `episode:${episode.slug}`,
    type: "episode",
    slug: episode.slug,
    title: episode.title,
    summary: episode.summary,
    description: episode.description,
    surfaces: {
      canonical,
      web: [canonical],
      ar: [canonical],
    },
    media: {
      cover: episode.assets?.imageUri ?? episode.assets?.posterUri,
      image: episode.assets?.imageUri ?? episode.assets?.posterUri,
      video: episode.assets?.videoUri,
      model: episode.assets?.glbUri,
    },
    attributes: {
      status: episode.status,
      season: episode.season,
      year: episode.year,
      startsAt: episode.startsAt,
      timezone: episode.timezone,
      venueName: episode.venueName,
      city: episode.city,
      tags: episode.meta?.tags ?? [],
      music: episode.meta?.music ?? [],
      allies: episode.meta?.allies ?? [],
    },
    actions: {
      primary: { label: "Collect Episode", type: "collect", target: canonical },
    },
    relations: {
      membership: ["membership:axis"],
      artists: relationIdsFromArtistNames(episode.meta?.music),
      related: [],
    },
  };
}

function buildArtistNodes(musicArtists, visualArtists, mediaCache, zoraCache) {
  const artists = new Map();

  for (const artist of asArray(visualArtists)) {
    const slug = slugify(artist.name);
    if (!slug) continue;
    artists.set(slug, {
      id: `artist:${slug}`,
      type: "artist",
      slug,
      title: artist.name,
      summary: firstText(artist.bio, artist.name),
      description: firstText(artist.bio, artist.name),
      surfaces: {
        canonical: `/magazine/artists/${slug}`,
        web: [`/magazine/artists/${slug}`],
      },
      media: {
        cover: artist.image,
        image: artist.image,
      },
      attributes: {
        artistTypes: ["visual"],
        genres: [],
        tags: [],
        featured: false,
      },
      actions: {
        primary: { label: "View Artist", type: "read", target: `/magazine/artists/${slug}` },
      },
      relations: { related: [] },
      links: artist.link ? [{ label: "Website", href: artist.link }] : [],
    });
  }

  const mediaBySlug = new Map(asArray(mediaCache).map((entry) => [entry.slug, entry]));
  const zoraBySlug = new Map(asArray(zoraCache).map((entry) => [entry.slug, entry]));

  for (const artist of asArray(musicArtists)) {
    const slug = slugify(artist.name);
    if (!slug) continue;
    const current = artists.get(slug);
    const media = mediaBySlug.get(slug);
    const zora = zoraBySlug.get(slug);
    const canonical = `/magazine/artists/${slug}`;
    const artistTypes = Array.from(new Set([...(current?.attributes?.artistTypes ?? []), ...asArray(artist.artistTypes)]));

    artists.set(slug, {
      id: `artist:${slug}`,
      type: "artist",
      slug,
      title: artist.name,
      summary: firstText(artist.summary, current?.summary, artist.name),
      description: firstText(media?.raBio, current?.description, artist.summary, artist.name),
      surfaces: {
        canonical,
        web: [canonical],
      },
      media: {
        cover: media?.profileImage ?? zora?.profileImage ?? current?.media?.cover,
        image: media?.profileImage ?? zora?.profileImage ?? current?.media?.image,
      },
      attributes: {
        artistTypes: artistTypes.length ? artistTypes : ["music"],
        genres: asArray(artist.genres),
        tags: asArray(artist.tags),
        featured: Boolean(artist.featured),
        gridIndex: artist.gridIndex,
      },
      actions: {
        primary: { label: "View Artist", type: "read", target: canonical },
      },
      relations: {
        episodes: asArray(artist.linkedEpisodes)
          .map((episode) => slugify(episode.label))
          .filter(Boolean)
          .map((slugValue) => `episode:${slugValue.replace(/^axis-/, "episode-")}`),
        related: asArray(artist.similar).map((name) => `artist:${slugify(name)}`),
      },
      links: asArray(artist.links).map((link) => ({ label: link.platform, href: link.url })),
    });
  }

  return [...artists.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function buildArticleNode(article) {
  const canonical = article.slug ? `/magazine/${article.slug}` : "/magazine";
  return {
    id: `article:${article.slug ?? slugify(article.title)}`,
    type: "article",
    slug: article.slug ?? slugify(article.title),
    title: article.title,
    summary: firstText(article.excerpt, article.subtitle, article.title),
    description: firstText(article.subtitle, article.excerpt, article.title),
    surfaces: {
      canonical,
      web: [canonical, "/magazine"],
    },
    media: article.image_url || article.saved_image ? { cover: article.image_url ?? article.saved_image, image: article.image_url ?? article.saved_image } : {},
    attributes: {
      category: article.category ?? "",
      author: article.author ?? "",
      authorRole: article.authorRole ?? "",
      date: article.date ?? "",
      readTime: article.readTime ?? "",
      tags: asArray(article.tags),
    },
    actions: {
      primary: { label: "Read Article", type: "read", target: canonical },
    },
    relations: {
      artists: relationIdsFromArtistNames(article.linkedArtists),
      episodes: [],
      related: [],
    },
  };
}

function buildTransmissionNode(mixtape) {
  const canonical = "/magazine/mixtapes";
  return {
    id: `transmission:${mixtape.slug}`,
    type: "transmission",
    slug: mixtape.slug,
    title: mixtape.title,
    summary: firstText(mixtape.description, mixtape.title),
    description: firstText(mixtape.description, mixtape.title),
    surfaces: {
      canonical,
      web: [canonical],
    },
    media: {
      audio: mixtape.audioUrl,
    },
    attributes: {
      date: mixtape.date,
      duration: mixtape.duration,
      episodeNumber: mixtape.episodeNumber,
      tags: asArray(mixtape.tags),
      artist: mixtape.artist,
    },
    actions: {
      primary: { label: "Listen", type: "listen", target: canonical },
    },
    relations: {
      artists: relationIdsFromArtistNames([mixtape.artist]),
      episodes: mixtape.episodeNumber ? [`episode:episode-${mixtape.episodeNumber}`] : [],
      related: [],
    },
  };
}

function getTrait(attributes, traitType) {
  return asArray(attributes).find((trait) => trait.trait_type === traitType)?.value;
}

function buildDropNodes(collectibles) {
  return asArray(collectibles.episodes).flatMap((episode) =>
    asArray(episode.tokens).map((token) => {
      const metadata = token.metadata ?? {};
      const properties = metadata.properties ?? {};
      const canonical = metadata.external_url || `/arapp/collect/${episode.slug}/${token.tokenId}`;
      const artist = firstText(properties.artist, getTrait(metadata.attributes, "Artist"), "Unknown Artist");
      return {
        id: `drop:${episode.slug}:${token.tokenId}`,
        type: "drop",
        slug: `${episode.slug}-${token.tokenId}`,
        title: firstText(metadata.name, properties.title, `AXIS Drop ${token.tokenId}`),
        summary: firstText(metadata.description, properties.subtitle, metadata.name),
        description: firstText(metadata.description, properties.subtitle, metadata.name),
        surfaces: {
          canonical,
          web: [canonical],
          ar: [canonical],
        },
        media: {
          cover: metadata.image,
          image: metadata.image,
          video: metadata.animation_url,
          model: properties.model ?? metadata.animation_url,
        },
        token: {
          contract: episode.contractAddress,
          tokenId: String(token.tokenId),
          claimable: Boolean(episode.claimOpen),
          status: token.status,
          remaining: token.remaining,
        },
        attributes: {
          edition: firstText(properties.edition, getTrait(metadata.attributes, "Edition")),
          artist,
          episode: episode.slug,
          mediaKind: properties.mediaKind ?? "",
        },
        actions: {
          primary: { label: "Collect Artifact", type: "collect", target: canonical },
        },
        relations: {
          artists: relationIdsFromArtistNames([artist]),
          episodes: [`episode:${episode.slug}`],
          related: [],
        },
      };
    }),
  );
}

function buildRouteIndex(graph) {
  const routes = {};
  const canonical = {};

  for (const node of Object.values(graph.nodes)) {
    const nodeCanonical = node.surfaces?.canonical;
    if (nodeCanonical) {
      routes[nodeCanonical] = node.id;
      canonical[node.id] = nodeCanonical;
    }

    for (const surfaceRoutes of Object.values(node.surfaces ?? {})) {
      const values = Array.isArray(surfaceRoutes) ? surfaceRoutes : [surfaceRoutes];
      for (const route of values) {
        if (typeof route === "string" && route.startsWith("/")) {
          routes[route] = node.id;
        }
      }
    }
  }

  return {
    version: graph.version,
    generatedAt: graph.generatedAt,
    routes,
    canonical,
  };
}

export async function buildAxisGraph() {
  const [
    episodes,
    collectibles,
    musicArtists,
    visualArtists,
    magazineArticles,
    mixtapes,
    articleIndex,
    mediaCache,
    zoraCache,
  ] = await Promise.all([
    readJson("content/episodes.json", []),
    readJson("content/episode-collectibles.json", { episodes: [] }),
    readJson("content/music-artists.json", []),
    readJson("public/data/artists.json", []),
    readJson("content/magazine.json", []),
    readJson("content/mixtapes.json", []),
    readJson("data/articles/index.json", []),
    readJson("content/artist-media-cache.json", []),
    readJson("content/artist-zora-cache.json", []),
  ]);

  const nodes = {};
  addNode(nodes, buildMembershipNode(asArray(episodes)));
  for (const episode of asArray(episodes)) addNode(nodes, buildEpisodeNode(episode));
  for (const artist of buildArtistNodes(musicArtists, visualArtists, mediaCache, zoraCache)) addNode(nodes, artist);
  for (const article of asArray(magazineArticles)) addNode(nodes, buildArticleNode(article));
  for (const article of asArray(articleIndex)) {
    if (article.slug) addNode(nodes, buildArticleNode({
      ...article,
      title: firstText(article.title, article.slug),
      excerpt: firstText(article.excerpt, article.text).slice(0, 240),
      category: "ARTICLE",
    }));
  }
  for (const mixtape of asArray(mixtapes)) addNode(nodes, buildTransmissionNode(mixtape));
  for (const drop of buildDropNodes(collectibles)) addNode(nodes, drop);

  return {
    version: GRAPH_VERSION,
    generatedAt: new Date().toISOString(),
    site: {
      primaryDomain: "axis.show",
      canonicalDomain: "axis.show",
      brand: {
        primary: "AXIS",
        legacy: ["AXIS", "Axis"],
        tagline: "UNEXPECTED ART EXPERIENCES",
      },
    },
    nodes,
  };
}

export async function compileAxisGraphToDisk() {
  const startedAt = Date.now();
  const graph = await buildAxisGraph();
  const routeIndex = buildRouteIndex(graph);

  await mkdir(repoPath("content/graph"), { recursive: true });
  await Promise.all([
    writeFile(repoPath("content/graph/nodes.json"), `${JSON.stringify(graph, null, 2)}\n`, "utf8"),
    writeFile(repoPath("content/graph/route-index.json"), `${JSON.stringify(routeIndex, null, 2)}\n`, "utf8"),
  ]);

  const state = await readGraphHqState();
  return {
    durationMs: Date.now() - startedAt,
    state,
  };
}

async function inspectJsonFile(relativePath) {
  try {
    const fileStat = await stat(repoPath(relativePath));
    let validJson = null;
    let error = null;
    try {
      JSON.parse(await readFile(repoPath(relativePath), "utf8"));
      validJson = true;
    } catch (jsonError) {
      validJson = false;
      error = jsonError instanceof Error ? jsonError.message : String(jsonError);
    }
    return {
      path: relativePath,
      exists: true,
      size: fileStat.size,
      updatedAt: fileStat.mtime.toISOString(),
      validJson,
      error,
    };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {
        path: relativePath,
        exists: false,
        size: null,
        updatedAt: null,
        validJson: null,
        error: "File does not exist.",
      };
    }
    return {
      path: relativePath,
      exists: false,
      size: null,
      updatedAt: null,
      validJson: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function summarizeGraph(graph, routeIndex) {
  const nodes = Object.values(graph?.nodes ?? {});
  const nodeTypeCounts = {};
  for (const node of nodes) {
    nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] ?? 0) + 1;
  }

  return {
    version: graph?.version ?? GRAPH_VERSION,
    generatedAt: graph?.generatedAt ?? "",
    nodeCount: nodes.length,
    routeCount: Object.keys(routeIndex?.routes ?? {}).length,
    canonicalCount: Object.keys(routeIndex?.canonical ?? {}).length,
    nodeTypeCounts,
  };
}

export async function readGraphHqState() {
  const [sourceFiles, outputFiles] = await Promise.all([
    Promise.all(sourcePaths.map(inspectJsonFile)),
    Promise.all(outputPaths.map(inspectJsonFile)),
  ]);

  let summary = null;
  try {
    const [graph, routeIndex] = await Promise.all([
      readJson("content/graph/nodes.json", null),
      readJson("content/graph/route-index.json", null),
    ]);
    if (graph && routeIndex) {
      summary = summarizeGraph(graph, routeIndex);
    }
  } catch {
    summary = null;
  }

  const newestSource = Math.max(...sourceFiles.map((file) => (file.updatedAt ? new Date(file.updatedAt).getTime() : 0)));
  const oldestOutput = Math.min(...outputFiles.map((file) => (file.updatedAt ? new Date(file.updatedAt).getTime() : 0)));

  return {
    summary,
    sourceFiles,
    outputFiles,
    stale: oldestOutput === 0 || newestSource > oldestOutput,
  };
}

