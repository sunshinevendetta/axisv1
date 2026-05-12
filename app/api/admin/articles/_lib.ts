import { execFile } from "node:child_process";
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  createEditorialJob,
  listEditorialJobs,
  listEditorialTargets,
  readEditorialArtifacts,
  readEditorialQueue,
  readPublishedIndex,
  updateEditorialReview,
  updateEditorialTask,
  writeEditorialTarget,
} from "@/src/lib/editorial-store";
import type {
  EditorialArticleTask,
  EditorialJobQueue,
  EditorialJobRecord,
  EditorialReviewRecord,
  EditorialTargetRecord,
  EditorialTargetType,
} from "@/src/types/editorial";
import type { MagazineArticle } from "@/src/types/magazine";

const REPO_ROOT = path.resolve(process.cwd());
const ENRICHER_ENTRY = path.join(REPO_ROOT, "tools/article-enricher/enricher.ts");
const RAW_ARTICLES_PATH = path.join(REPO_ROOT, "data/articles/index.json");
const MUSIC_ARTISTS_PATH = path.join(REPO_ROOT, "content/music-artists.json");
const ARTIST_MEDIA_CACHE_PATH = path.join(REPO_ROOT, "content/artist-media-cache.json");

type RawArticleSeed = {
  id: string;
  slug: string;
  folder?: string;
  text?: string;
};

export type RawArticleSourceSummary = {
  id: string;
  slug: string;
  folder: string | null;
  preview: string;
  textLength: number;
};

export type ArtistCatalogEntry = {
  slug: string;
  name: string;
  summary: string;
  genres: string[];
  tags: string[];
  similar: string[];
  profileImage: string | null;
  releaseCount: number;
  trackCount: number;
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export async function loadRawArticles() {
  const file = await fs.readFile(RAW_ARTICLES_PATH, "utf8");
  return JSON.parse(file) as RawArticleSeed[];
}

export async function loadArtistLibrary() {
  const [artistsFile, mediaCacheFile] = await Promise.all([
    fs.readFile(MUSIC_ARTISTS_PATH, "utf8"),
    fs.readFile(ARTIST_MEDIA_CACHE_PATH, "utf8").catch(() => "{}"),
  ]);
  const artists = JSON.parse(artistsFile) as Array<{
    name: string;
    aliases?: string[];
    summary?: string;
    genres?: string[];
    tags?: string[];
    similar?: string[];
  }>;
  const mediaCache = JSON.parse(mediaCacheFile) as Record<
    string,
    {
      profileImage?: string | null;
      tracks?: Array<{ name: string }>;
      releases?: Array<{ name: string }>;
    }
  >;

  return artists.map((artist) => {
    const slug = slugify(artist.name);
    // Try primary slug first, then each alias slug — handles miskeyed cache entries
    const aliasSlugs = (artist.aliases ?? []).map(slugify);
    const candidateKeys = [slug, ...aliasSlugs];
    const media = candidateKeys.reduce<typeof mediaCache[string]>(
      (best, key) => {
        const entry = mediaCache[key];
        if (!entry) return best;
        // Prefer the entry with more signal (related artists > 0, or more tracks)
        const bestSignal = (Array.isArray((best as { related?: unknown[] }).related) ? ((best as { related?: unknown[] }).related?.length ?? 0) : 0) +
          (Array.isArray(best.tracks) ? best.tracks.length : 0);
        const entrySignal = (Array.isArray((entry as { related?: unknown[] }).related) ? ((entry as { related?: unknown[] }).related?.length ?? 0) : 0) +
          (Array.isArray(entry.tracks) ? entry.tracks.length : 0);
        return entrySignal > bestSignal ? entry : best;
      },
      {},
    );
    const related: string[] = Array.isArray((media as { related?: string[] }).related)
      ? ((media as { related?: string[] }).related ?? [])
      : [];
    return {
      slug,
      name: artist.name,
      summary: artist.summary ?? "",
      genres: artist.genres ?? [],
      tags: artist.tags ?? [],
      similar: artist.similar?.length ? artist.similar : related,
      profileImage: media.profileImage ?? null,
      releaseCount: Array.isArray(media.releases) ? media.releases.length : 0,
      trackCount: Array.isArray(media.tracks) ? media.tracks.length : 0,
    } satisfies ArtistCatalogEntry;
  });
}

export function summarizeRawArticle(raw: RawArticleSeed): RawArticleSourceSummary {
  const normalizedText = typeof raw.text === "string" ? raw.text.replace(/\s+/g, " ").trim() : "";
  return {
    id: raw.id,
    slug: raw.slug,
    folder: raw.folder ?? null,
    preview: normalizedText.slice(0, 280),
    textLength: normalizedText.length,
  };
}

export function selectRawArticles(
  rawArticles: RawArticleSeed[],
  input: {
    articleSourceSlug?: string;
    articleLimit?: string | number;
    targetType?: EditorialTargetType;
  },
) {
  const sourceSlug = typeof input.articleSourceSlug === "string" ? input.articleSourceSlug.trim() : "";
  const rawLimit = typeof input.articleLimit === "number" ? String(input.articleLimit) : String(input.articleLimit ?? "").trim().toLowerCase();

  if (sourceSlug) {
    const matched = rawArticles.find(
      (raw) => raw.slug === sourceSlug || raw.folder === sourceSlug || raw.id === sourceSlug,
    );
    if (!matched) {
      throw new Error(`ARTICLE_SOURCE_SLUG "${sourceSlug}" did not match any entry in data/articles/index.json.`);
    }
    return [matched];
  }

  if (rawLimit === "all") {
    return rawArticles;
  }

  const parsedLimit = Number.parseInt(rawLimit, 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 1;
  return rawArticles.slice(0, limit);
}

export async function createEditorialJobFromInput(input: {
  articleSourceSlug?: string;
  articleLimit?: string | number;
  artistSlugs?: string[];
  inputMode?: "raw_sources" | "artist_catalog";
  mode?: EditorialJobRecord["mode"];
  source?: EditorialJobRecord["source"];
  targetType?: EditorialTargetType;
  notes?: string;
  createdBy?: string;
}) {
  if (input.inputMode === "artist_catalog") {
    const library = await loadArtistLibrary();
    const requested = new Set((input.artistSlugs ?? []).map((value) => slugify(value)));
    const selected =
      Array.isArray(input.artistSlugs) && input.artistSlugs.length > 0
        ? library.filter((artist) => requested.has(artist.slug) || requested.has(slugify(artist.name)))
        : [];

    if (selected.length === 0) {
      throw new Error("No artist catalog targets were selected.");
    }

    return createEditorialJob({
      mode: input.mode ?? (selected.length === 1 ? "single" : "batch"),
      source: input.source ?? "existing_db",
      targetType: input.targetType ?? "artist",
      count: selected.length,
      concurrency: 1,
      createdBy: input.createdBy,
      notes: input.notes,
      artistTargets: selected.map((artist) => ({
        slug: artist.slug,
        name: artist.name,
      })),
    });
  }

  const rawArticles = await loadRawArticles();
  const selected = selectRawArticles(rawArticles, input);
  const count = typeof input.articleLimit === "string" && input.articleLimit.trim().toLowerCase() === "all"
    ? "all"
    : selected.length;

  return createEditorialJob({
    mode: input.mode ?? (selected.length === 1 ? "single" : "batch"),
    source: input.source ?? "existing_db",
    targetType: input.targetType ?? "artist",
    count,
    concurrency: 1,
    createdBy: input.createdBy,
    notes: input.notes,
    rawArticles: selected.map((raw) => ({
      id: raw.id,
      slug: raw.slug,
      folder: raw.folder,
    })),
  });
}

export async function runEditorialJob(jobId: string, taskId?: string) {
  return new Promise<void>((resolve, reject) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NOUS_API_KEY: process.env.NOUS_API_KEY ?? "",
      ARTICLE_JOB_ID: jobId,
    };

    if (taskId) {
      env.ARTICLE_TASK_ID = taskId;
    }

    const child = execFile(process.execPath, ["--import", "tsx", ENRICHER_ENTRY], {
      cwd: REPO_ROOT,
      env,
      maxBuffer: 10 * 1024 * 1024,
    });

    let stderr = "";

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Article enricher exited with code ${code}.`));
    });

    child.on("error", reject);
  });
}

export async function listJobsWithQueues() {
  const jobs = await listEditorialJobs();
  return Promise.all(
    jobs.map(async (job) => ({
      job,
      queue: await readEditorialQueue(job.id),
    })),
  );
}

export async function readTaskBundle(taskId: string) {
  const jobs = await listEditorialJobs();

  for (const job of jobs) {
    const queue = await readEditorialQueue(job.id);
    const task = queue.tasks.find((item) => item.id === taskId);

    if (task) {
      return {
        job,
        queue,
        task,
        artifacts: await readEditorialArtifacts(job.id, task.id),
      };
    }
  }

  return null;
}

export async function listGeneratedDrafts() {
  const jobs = await listEditorialJobs();
  const drafts: Array<{
    job: EditorialJobRecord;
    queue: EditorialJobQueue;
    task: EditorialArticleTask;
    article: MagazineArticle;
    review: EditorialReviewRecord | null;
  }> = [];

  for (const job of jobs) {
    const queue = await readEditorialQueue(job.id);
    for (const task of queue.tasks) {
      const artifacts = await readEditorialArtifacts<MagazineArticle>(job.id, task.id);
      if (artifacts.draft?.article) {
        drafts.push({
          job,
          queue,
          task,
          article: artifacts.draft.article,
          review: artifacts.review,
        });
      }
    }
  }

  drafts.sort((a, b) => b.task.updatedAt.localeCompare(a.task.updatedAt));
  return drafts;
}

export async function writeSimpleTarget(input: {
  name: string;
  type?: EditorialTargetType;
  sourceMode?: EditorialTargetRecord["sourceMode"];
  summary?: string;
  genres?: string[];
  tags?: string[];
  relatedArtists?: string[];
  city?: string | null;
}) {
  const timestamp = new Date().toISOString();
  const slug = slugify(input.name);

  const target: EditorialTargetRecord = {
    key: `${input.type ?? "artist"}:${slug}`,
    type: input.type ?? "artist",
    name: input.name,
    slug,
    sourceMode: input.sourceMode ?? "new_target",
    status: "draft",
    genres: input.genres ?? [],
    tags: input.tags ?? [],
    relatedArtists: input.relatedArtists ?? [],
    city: input.city ?? null,
    summary: input.summary ?? "",
    provenance: [{ type: "manual", value: "owner_hq" }],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return writeEditorialTarget(target);
}

export async function updateTaskReviewState(
  task: EditorialArticleTask,
  input: {
    decision?: "pending" | "approved" | "rejected" | "redo_requested";
    editorNotes?: string;
    status?: EditorialArticleTask["status"];
  },
) {
  await updateEditorialTask(task.jobId, task.id, {
    status: input.status ?? task.status,
  });

  return updateEditorialReview(task.jobId, task.id, {
    decision: input.decision,
    editorNotes: input.editorNotes,
    status: input.status,
    approvedAt: input.decision === "approved" ? new Date().toISOString() : undefined,
    rejectedAt: input.decision === "rejected" ? new Date().toISOString() : undefined,
  });
}

export async function getEditorialOverview() {
  return {
    jobs: await listJobsWithQueues(),
    targets: await listEditorialTargets(),
    published: await readPublishedIndex(),
  };
}
