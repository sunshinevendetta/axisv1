import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import rawLegacyArticles from "@/content/magazine.json";
import type { ContentBlock, MagazineArticle } from "@/src/types/magazine";
import type {
  EditorialPublicArticleRecord,
  EditorialPublicArticleTeaser,
  EditorialPublicIndex,
  EditorialPublicIndexEntry,
  EditorialPublicSource,
} from "@/src/types/editorial-public";

const PUBLISHED_INDEX_PATH = path.join(process.cwd(), "data", "editorial", "published", "index.json");
const PUBLISHED_ARTICLES_DIR = path.join(process.cwd(), "data", "editorial", "published", "articles");

const legacyArticles = rawLegacyArticles as MagazineArticle[];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeIndexPath(relativePath: string): string {
  return relativePath.split(/[\\/]+/).join(path.sep);
}

function normalizeContentBlock(value: unknown): ContentBlock | null {
  if (!isObject(value) || typeof value.text !== "string") {
    return null;
  }

  if (value.type === "heading" || value.type === "quote" || value.type === "paragraph") {
    return {
      type: value.type,
      text: value.text,
    };
  }

  return {
    type: "paragraph",
    text: value.text,
  };
}

function estimateReadTime(content: ContentBlock[], fallbackText: string) {
  const wordCount = `${fallbackText} ${content.map((block) => block.text).join(" ")}`.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 220));
  return `${minutes} min`;
}

function normalizeArticle(
  value: Partial<MagazineArticle> & { slug: string; title: string },
  index: number,
  source: EditorialPublicSource,
  meta?: Pick<EditorialPublicIndexEntry, "articlePath" | "groveUri" | "groveGatewayUrl" | "groveStorageKey" | "publishedAt" | "status"> & { coverImage?: string | null },
): EditorialPublicArticleRecord {
  const content = Array.isArray(value.content)
    ? value.content.map(normalizeContentBlock).filter((block): block is ContentBlock => Boolean(block))
    : [];

  const excerpt = typeof value.excerpt === "string" ? value.excerpt : typeof value.subtitle === "string" ? value.subtitle : "";

  return {
    id: typeof value.id === "number" ? value.id : index + 1,
    slug: value.slug,
    axis: value.axis,
    category: typeof value.category === "string" ? value.category : "CULTURE",
    contentType: value.contentType,
    mode: value.mode,
    frame: value.frame,
    persona: value.persona,
    title: value.title,
    subtitle: typeof value.subtitle === "string" ? value.subtitle : excerpt,
    author: typeof value.author === "string" ? value.author : "Editorial Staff",
    authorRole: typeof value.authorRole === "string" ? value.authorRole : "Staff Writer",
    date: typeof value.date === "string" ? value.date : "1970-01-01",
    readTime: typeof value.readTime === "string" ? value.readTime : estimateReadTime(content, excerpt),
    excerpt,
    featured: Boolean(value.featured),
    image_url: typeof value.image_url === "string" ? value.image_url
      : typeof (value as Record<string, unknown>).coverImage === "string" ? (value as Record<string, unknown>).coverImage as string
      : typeof meta?.coverImage === "string" ? meta.coverImage : undefined,
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string") : [],
    linkedArtists: Array.isArray(value.linkedArtists)
      ? value.linkedArtists.filter((artist): artist is string => typeof artist === "string")
      : [],
    content,
    monetization: Array.isArray(value.monetization) ? value.monetization : [],
    translations: value.translations,
    relatedSlugs: Array.isArray(value.relatedSlugs)
      ? value.relatedSlugs.filter((slug): slug is string => typeof slug === "string")
      : [],
    articlePath: meta?.articlePath ?? null,
    groveUri: meta?.groveUri ?? null,
    groveGatewayUrl: meta?.groveGatewayUrl ?? null,
    groveStorageKey: meta?.groveStorageKey ?? null,
    publishedAt: meta?.publishedAt ?? null,
    status: meta?.status ?? (source === "legacy-content" ? "legacy" : "published"),
    source,
  };
}

function indexEntryToTeaser(entry: EditorialPublicIndexEntry, index: number): EditorialPublicArticleRecord {
  const articleValue = isObject(entry.article) ? { ...entry, ...entry.article } : entry;
  return normalizeArticle(
    {
      ...articleValue,
      slug: entry.slug,
      title: entry.title,
    },
    index,
    "published-index",
    entry,
  );
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function coercePublishedIndex(value: unknown): EditorialPublicIndex | null {
  if (!isObject(value) || !Array.isArray(value.articles)) {
    return null;
  }

  const articles = value.articles
    .filter((entry): entry is EditorialPublicIndexEntry => isObject(entry) && typeof entry.slug === "string" && typeof entry.title === "string")
    .map((entry) => ({
      ...entry,
      excerpt: typeof entry.excerpt === "string" ? entry.excerpt : "",
      date: typeof entry.date === "string" ? entry.date : "1970-01-01",
    }));

  return {
    version: typeof value.version === "number" ? value.version : 1,
    generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : undefined,
    articles,
  };
}

async function fetchRemoteArticle(entry: EditorialPublicIndexEntry): Promise<Partial<MagazineArticle> | null> {
  const candidateUrls = [entry.groveGatewayUrl, entry.publicUrl]
    .filter((url): url is string => typeof url === "string" && url.length > 0);

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, { cache: "force-cache" });
      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as unknown;
      if (isObject(data) && typeof data.slug === "string" && typeof data.title === "string") {
        return data as Partial<MagazineArticle>;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function resolvePublishedArticle(entry: EditorialPublicIndexEntry, index: number): Promise<EditorialPublicArticleRecord | null> {
  const candidatePaths = [
    entry.articlePath ? path.join(process.cwd(), normalizeIndexPath(entry.articlePath)) : null,
    path.join(PUBLISHED_ARTICLES_DIR, `${entry.slug}.json`),
    path.join(process.cwd(), "data", "editorial", "published", `${entry.slug}.json`),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidatePath of candidatePaths) {
    if (!(await fileExists(candidatePath))) {
      continue;
    }

    const data = await readJsonFile<Partial<MagazineArticle>>(candidatePath);
    if (data && typeof data.slug === "string" && typeof data.title === "string") {
      return normalizeArticle(data as Partial<MagazineArticle> & { slug: string; title: string }, index, "published-index", {
        articlePath: entry.articlePath ?? path.relative(process.cwd(), candidatePath),
        coverImage: typeof entry.coverImage === "string" ? entry.coverImage : null,
        groveUri: entry.groveUri ?? null,
        groveGatewayUrl: entry.groveGatewayUrl ?? null,
        groveStorageKey: entry.groveStorageKey ?? null,
        publishedAt: entry.publishedAt ?? null,
        status: entry.status,
      });
    }
  }

  const remoteArticle = await fetchRemoteArticle(entry);
  if (remoteArticle && typeof remoteArticle.slug === "string" && typeof remoteArticle.title === "string") {
    return normalizeArticle(remoteArticle as Partial<MagazineArticle> & { slug: string; title: string }, index, "published-index", entry);
  }

  const legacyMatch = legacyArticles.find((article) => article.slug === entry.slug);
  if (legacyMatch) {
    return normalizeArticle(legacyMatch, index, "legacy-content", entry);
  }

  return null;
}

async function loadPublishedIndex(): Promise<EditorialPublicIndex | null> {
  if (!(await fileExists(PUBLISHED_INDEX_PATH))) {
    return null;
  }

  const data = await readJsonFile<unknown>(PUBLISHED_INDEX_PATH);
  return coercePublishedIndex(data);
}

function getLegacyArticles(): EditorialPublicArticleRecord[] {
  return legacyArticles.map((article, index) => normalizeArticle(article, index, "legacy-content"));
}

export const getEditorialPublicIndexEntries = cache(async (): Promise<EditorialPublicArticleRecord[]> => {
  const publishedIndex = await loadPublishedIndex();
  if (!publishedIndex) {
    return getLegacyArticles();
  }

  return publishedIndex.articles
    .map(indexEntryToTeaser)
    .sort((a, b) => new Date(b.publishedAt ?? b.date).getTime() - new Date(a.publishedAt ?? a.date).getTime());
});

export const getEditorialPublicArticle = cache(async (slug: string): Promise<EditorialPublicArticleRecord | null> => {
  const publishedIndex = await loadPublishedIndex();
  if (!publishedIndex) {
    const legacyIndex = getLegacyArticles();
    return legacyIndex.find((article) => article.slug === slug) ?? null;
  }

  const index = publishedIndex.articles.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    const legacyMatch = legacyArticles.find((article) => article.slug === slug);
    return legacyMatch ? normalizeArticle(legacyMatch, 0, "legacy-content") : null;
  }

  return resolvePublishedArticle(publishedIndex.articles[index], index);
});

export const getEditorialPublicMagazineData = cache(async () => {
  const publishedIndex = await loadPublishedIndex();

  if (!publishedIndex) {
    const articles = getLegacyArticles().filter((entry) => entry.status !== "archived");
    return {
      articles,
      featuredArticles: articles.filter((article) => article.featured),
      source: articles[0]?.source ?? ("legacy-content" as EditorialPublicSource),
    };
  }

  const resolvedArticles = await Promise.all(
    publishedIndex.articles.map((entry, index) => resolvePublishedArticle(entry, index)),
  );
  const articles = resolvedArticles.filter(
    (entry): entry is EditorialPublicArticleRecord => entry !== null && entry !== undefined && entry.status !== "archived",
  );

  return {
    articles,
    featuredArticles: articles.filter((article) => article.featured),
    source: articles[0]?.source ?? ("legacy-content" as EditorialPublicSource),
  };
});

export async function getEditorialPublicArticlePageData(slug: string) {
  const [article, indexArticles] = await Promise.all([
    getEditorialPublicArticle(slug),
    getEditorialPublicIndexEntries(),
  ]);

  return {
    article,
    indexArticles: indexArticles.filter((entry) => entry.status !== "archived"),
  };
}

export function summarizeEditorialPublicArticle(article: EditorialPublicArticleRecord): EditorialPublicArticleTeaser {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    category: article.category,
    date: article.date,
    author: article.author,
    authorRole: article.authorRole,
    readTime: article.readTime,
    featured: article.featured,
    image_url: article.image_url,
    tags: article.tags,
    linkedArtists: article.linkedArtists,
  };
}
