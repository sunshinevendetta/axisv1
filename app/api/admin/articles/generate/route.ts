import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { writeArticleEnricherHqConfig } from "@/src/lib/article-enricher-hq";

const REPO_ROOT = path.resolve(process.cwd());
const ENRICHER_ENTRY = path.join(REPO_ROOT, "tools/article-enricher/enricher.ts");
const RAW_ARTICLES_PATH = path.join(REPO_ROOT, "data/articles/index.json");
const MUSIC_ARTISTS_PATH = path.join(REPO_ROOT, "content/music-artists.json");

type GenerateBody = {
  articleSourceSlug?: string;
  articleLimit?: string | number;
  artistSlug?: string;
  config?: unknown;
};

type RawArticleIndex = Array<{ id: string; slug: string; folder?: string }>;
type MusicArtistEntry = { name: string; aliases?: string[] };

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Resolve which mode to use:
//   - If slug matches a music-artists entry → ARTICLE_ARTIST_SLUG (artist-catalog mode)
//   - If slug matches a raw Lens article     → ARTICLE_SOURCE_SLUG (raw-article mode)
//   - If no slug                             → let enricher use its default limit
async function resolveSlugMode(slug: string): Promise<
  | { mode: "artist"; artistSlug: string }
  | { mode: "raw"; sourceSlug: string }
  | { mode: "none" }
> {
  if (!slug) return { mode: "none" };

  // Check artist catalog first
  try {
    const raw = await fs.readFile(MUSIC_ARTISTS_PATH, "utf8");
    const artists = JSON.parse(raw) as MusicArtistEntry[];
    const match = artists.find(
      (a) =>
        slugify(a.name) === slug ||
        (a.aliases ?? []).some((alias) => slugify(alias) === slug) ||
        a.name.toLowerCase() === slug.toLowerCase(),
    );
    if (match) return { mode: "artist", artistSlug: slugify(match.name) };
  } catch {
    // fallthrough
  }

  // Check raw articles index
  try {
    const raw = await fs.readFile(RAW_ARTICLES_PATH, "utf8");
    const articles = JSON.parse(raw) as RawArticleIndex;
    const match = articles.find(
      (a) => a.slug === slug || a.folder === slug || a.id === slug,
    );
    if (match) return { mode: "raw", sourceSlug: match.slug };
  } catch {
    // fallthrough
  }

  // No match — treat as artist slug and let the enricher handle missing context gracefully
  return { mode: "artist", artistSlug: slug };
}

export async function POST(request: NextRequest) {
  let body: GenerateBody = {};
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    body = {};
  }

  if (body.config !== undefined && body.config !== null) {
    try {
      body.config = await writeArticleEnricherHqConfig(body.config as import("@/src/lib/article-enricher-hq").ArticleEnricherHqConfig);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Could not write article HQ config." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Support explicit artistSlug field OR fall back to articleSourceSlug resolution
  const explicitArtistSlug = typeof body.artistSlug === "string" ? body.artistSlug.trim() : "";
  const rawSourceSlug = typeof body.articleSourceSlug === "string" ? body.articleSourceSlug.trim() : "";
  const limit =
    typeof body.articleLimit === "number"
      ? String(body.articleLimit)
      : typeof body.articleLimit === "string"
        ? body.articleLimit.trim()
        : "";

  const slugMode = explicitArtistSlug
    ? { mode: "artist" as const, artistSlug: slugify(explicitArtistSlug) }
    : await resolveSlugMode(rawSourceSlug);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      }

      const env: NodeJS.ProcessEnv = {
        ...process.env,
        NOUS_API_KEY: process.env.NOUS_API_KEY ?? "",
      };

      if (slugMode.mode === "artist") {
        env.ARTICLE_ARTIST_SLUG = slugMode.artistSlug;
        send({ type: "log", text: `Mode: artist catalog — ${slugMode.artistSlug}` });
      } else if (slugMode.mode === "raw") {
        env.ARTICLE_SOURCE_SLUG = slugMode.sourceSlug;
        if (limit) env.ARTICLE_LIMIT = limit;
        send({ type: "log", text: `Mode: raw article — ${slugMode.sourceSlug}` });
      } else {
        if (limit) env.ARTICLE_LIMIT = limit;
        send({ type: "log", text: `Mode: batch — limit ${limit || "1"}` });
      }

      const child = execFile(
        process.execPath,
        ["--import", "tsx", ENRICHER_ENTRY],
        { cwd: REPO_ROOT, env, maxBuffer: 10 * 1024 * 1024 },
      );

      child.stdout?.on("data", (chunk: Buffer) => {
        for (const line of chunk.toString().split("\n").filter(Boolean)) {
          send({ type: "log", text: line });
        }
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        for (const line of chunk.toString().split("\n").filter(Boolean)) {
          send({ type: "log", text: line });
        }
      });

      child.on("close", (code: number | null) => {
        if (code === 0) {
          send({ type: "done", text: "Generation complete." });
        } else {
          send({ type: "error", text: `Article enricher exited with code ${code}` });
        }
        controller.close();
      });

      child.on("error", (error: Error) => {
        send({ type: "error", text: error.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
