import { promises as fs } from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/src/lib/json-store";
import {
  getEditorialJobPath,
  getEditorialJobsDir,
  getEditorialPublishedIndexPath,
  getEditorialQueuePath,
  getEditorialRoot,
  getEditorialTargetPath,
  getEditorialTaskDraftPath,
  getEditorialTaskEnrichedPath,
  getEditorialTaskReviewPath,
} from "@/src/lib/editorial-paths";
import type {
  EditorialArticleTask,
  EditorialDraftArtifact,
  EditorialEnrichedArtifact,
  EditorialFilterSet,
  EditorialJobQueue,
  EditorialJobRecord,
  EditorialPromptProfile,
  EditorialResearchPacket,
  EditorialReviewRecord,
  EditorialSourceMode,
  EditorialTargetRecord,
  EditorialTargetType,
  PublishedArticleIndex,
  PublishedArticleRecord,
} from "@/src/types/editorial";

type RawArticleSeed = {
  id: string;
  slug: string;
  folder?: string;
  kind?: string;
  artistSlug?: string;
  artistName?: string;
};

type ArtistSeed = {
  slug: string;
  name: string;
};

type JobSourceSeed =
  | {
      kind: "raw_article";
      id: string;
      slug: string;
      folder?: string;
    }
  | {
      kind: "artist_catalog";
      slug: string;
      name: string;
    };

type CreateJobInput = {
  mode: EditorialJobRecord["mode"];
  source: EditorialSourceMode;
  targetType: EditorialTargetType;
  filters?: Partial<EditorialFilterSet>;
  count: number | "all";
  concurrency?: number;
  createdBy?: string;
  promptProfile?: Partial<EditorialPromptProfile>;
  notes?: string;
  rawArticles?: RawArticleSeed[];
  artistTargets?: ArtistSeed[];
  sources?: JobSourceSeed[];
};

type TaskLookupResult = {
  job: EditorialJobRecord;
  queue: EditorialJobQueue;
  task: EditorialArticleTask;
};

const DEFAULT_FILTERS: EditorialFilterSet = {
  artistSlugs: [],
  genre: null,
  scene: null,
  city: null,
  missingOnly: false,
};

const DEFAULT_PROMPT_PROFILE: EditorialPromptProfile = {
  writerProfile: "default",
  editorProfile: "default",
};

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function ensureEditorialRoot() {
  await fs.mkdir(getEditorialRoot(), { recursive: true });
}

export async function ensurePublishedIndex() {
  await ensureEditorialRoot();
  const indexPath = getEditorialPublishedIndexPath();
  try {
    await fs.access(indexPath);
  } catch {
    const emptyIndex: PublishedArticleIndex = {
      version: 1,
      generatedAt: nowIso(),
      articles: [],
    };
    await writeJsonFile(indexPath, emptyIndex);
  }
}

export async function readPublishedIndex(): Promise<PublishedArticleIndex> {
  await ensurePublishedIndex();
  return readJsonFile<PublishedArticleIndex>(getEditorialPublishedIndexPath(), {
    fallback: {
      version: 1,
      generatedAt: nowIso(),
      articles: [],
    },
  });
}

export async function writePublishedIndex(index: PublishedArticleIndex) {
  await writeJsonFile(getEditorialPublishedIndexPath(), index);
}

export async function upsertPublishedArticle(record: PublishedArticleRecord) {
  const index = await readPublishedIndex();
  const articles = index.articles.filter((article) => article.slug !== record.slug);
  articles.push(record);
  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  await writePublishedIndex({
    version: 1,
    generatedAt: nowIso(),
    articles,
  });
}

export async function writeEditorialTarget(target: EditorialTargetRecord) {
  await writeJsonFile(getEditorialTargetPath(target.slug), target);
  return target;
}

export async function listEditorialTargets() {
  const dir = path.dirname(getEditorialTargetPath("placeholder"));
  try {
    const files = await fs.readdir(dir);
    const targets = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map((file) =>
          readJsonFile<EditorialTargetRecord>(path.join(dir, file), {
            fallback: null as never,
          }),
        ),
    );
    return targets.filter(Boolean);
  } catch {
    return [] as EditorialTargetRecord[];
  }
}

export async function listEditorialJobs() {
  const jobsDir = getEditorialJobsDir();
  try {
    const entries = await fs.readdir(jobsDir, { withFileTypes: true });
    const jobs = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) =>
          readJsonFile<EditorialJobRecord>(getEditorialJobPath(entry.name), {
            fallback: null as never,
          }),
        ),
    );
    return jobs.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [] as EditorialJobRecord[];
  }
}

export async function readEditorialJob(jobId: string) {
  return readJsonFile<EditorialJobRecord>(getEditorialJobPath(jobId), {
    fallback: null as never,
  });
}

export async function writeEditorialJob(job: EditorialJobRecord) {
  await writeJsonFile(getEditorialJobPath(job.id), job);
  return job;
}

export async function readEditorialQueue(jobId: string): Promise<EditorialJobQueue> {
  return readJsonFile<EditorialJobQueue>(getEditorialQueuePath(jobId), {
    fallback: {
      jobId,
      tasks: [],
    },
  });
}

export async function writeEditorialQueue(queue: EditorialJobQueue) {
  await writeJsonFile(getEditorialQueuePath(queue.jobId), queue);
  return queue;
}

export async function createEditorialJob(input: CreateJobInput) {
  const createdAt = nowIso();
  const jobId = `job_${createdAt.replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(36).slice(2, 8)}`;
  const job: EditorialJobRecord = {
    id: jobId,
    mode: input.mode,
    source: input.source,
    targetType: input.targetType,
    filters: {
      ...DEFAULT_FILTERS,
      ...input.filters,
      artistSlugs: input.filters?.artistSlugs ?? [],
    },
    count: input.count,
    concurrency: Math.max(1, input.concurrency ?? 1),
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
    createdBy: input.createdBy ?? "owner",
    promptProfile: {
      ...DEFAULT_PROMPT_PROFILE,
      ...input.promptProfile,
    },
    notes: input.notes ?? "",
  };

  const sources: JobSourceSeed[] = input.sources ?? [
    ...(input.rawArticles ?? []).map((raw) =>
      raw.kind === "artist_catalog"
        ? ({
            kind: "artist_catalog" as const,
            slug: raw.artistSlug ?? raw.slug,
            name: raw.artistName ?? raw.slug,
          })
        : ({
            kind: "raw_article" as const,
            id: raw.id,
            slug: raw.slug,
            folder: raw.folder,
          }),
    ),
    ...(input.artistTargets ?? []).map((artist) => ({
      kind: "artist_catalog" as const,
      slug: artist.slug,
      name: artist.name,
    })),
  ];

  const tasks: EditorialArticleTask[] = sources.map((source, index) => {
    const sourceSlug = source.kind === "raw_article" ? source.slug || source.id : source.slug;
    const slug = slugify(sourceSlug);
    const taskId = sanitizeId(`${jobId}__${slug || index + 1}`);
    return {
      id: taskId,
      jobId,
      targetKey: `${input.targetType}:${slug}`,
      targetType: input.targetType,
      slug,
      sourceRef:
        source.kind === "raw_article"
          ? {
              kind: "raw_article",
              rawId: source.id,
              rawSlug: source.slug,
              rawFolder: source.folder ?? null,
            }
          : {
              kind: "artist_catalog",
              artistSlug: source.slug,
              artistName: source.name,
            },
      status: "queued",
      draftPath: path.relative(process.cwd(), getEditorialTaskDraftPath(jobId, taskId)),
      enrichedPath: path.relative(process.cwd(), getEditorialTaskEnrichedPath(jobId, taskId)),
      reviewPath: path.relative(process.cwd(), getEditorialTaskReviewPath(jobId, taskId)),
      groveUri: null,
      groveGatewayUrl: null,
      groveStorageKey: null,
      error: null,
      attempts: 0,
      updatedAt: createdAt,
    };
  });

  await writeEditorialJob(job);
  await writeEditorialQueue({ jobId, tasks });
  return {
    job,
    queue: {
      jobId,
      tasks,
    },
  };
}

export async function updateEditorialJobStatus(jobId: string, status: EditorialJobRecord["status"]) {
  const job = await readEditorialJob(jobId);
  if (!job) {
    throw new Error(`Editorial job "${jobId}" was not found.`);
  }
  const updated: EditorialJobRecord = {
    ...job,
    status,
    updatedAt: nowIso(),
    completedAt: status === "completed" || status === "failed" ? nowIso() : job.completedAt,
  };
  await writeEditorialJob(updated);
  return updated;
}

export async function updateEditorialTask(jobId: string, taskId: string, update: Partial<EditorialArticleTask>) {
  const queue = await readEditorialQueue(jobId);
  const nextTasks = queue.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          ...update,
          updatedAt: nowIso(),
        }
      : task,
  );
  const nextQueue = {
    ...queue,
    tasks: nextTasks,
  };
  await writeEditorialQueue(nextQueue);
  const task = nextTasks.find((item) => item.id === taskId);
  if (!task) {
    throw new Error(`Editorial task "${taskId}" was not found in job "${jobId}".`);
  }
  return task;
}

export async function writeEditorialArtifacts<TArticle>(input: {
  jobId: string;
  taskId: string;
  draft: EditorialDraftArtifact<TArticle>;
  enriched: EditorialEnrichedArtifact<TArticle>;
  review?: EditorialReviewRecord;
}) {
  const review: EditorialReviewRecord = input.review ?? {
    jobId: input.jobId,
    taskId: input.taskId,
    status: "needs_review",
    decision: "pending",
    editorNotes: "",
    approvedAt: null,
    rejectedAt: null,
    publishedAt: null,
    updatedAt: nowIso(),
  };

  await writeJsonFile(getEditorialTaskDraftPath(input.jobId, input.taskId), input.draft);
  await writeJsonFile(getEditorialTaskEnrichedPath(input.jobId, input.taskId), input.enriched);
  await writeJsonFile(getEditorialTaskReviewPath(input.jobId, input.taskId), review);
  return review;
}

export async function readEditorialArtifacts<TArticle = Record<string, unknown>>(jobId: string, taskId: string) {
  const [draft, enriched, review] = await Promise.all([
    readJsonFile<EditorialDraftArtifact<TArticle> | null>(getEditorialTaskDraftPath(jobId, taskId), {
      fallback: null,
    }),
    readJsonFile<EditorialEnrichedArtifact<TArticle> | null>(getEditorialTaskEnrichedPath(jobId, taskId), {
      fallback: null,
    }),
    readJsonFile<EditorialReviewRecord | null>(getEditorialTaskReviewPath(jobId, taskId), {
      fallback: null,
    }),
  ]);

  return { draft, enriched, review };
}

export async function updateEditorialReview(jobId: string, taskId: string, update: Partial<EditorialReviewRecord>) {
  const current = await readJsonFile<EditorialReviewRecord | null>(getEditorialTaskReviewPath(jobId, taskId), {
    fallback: null,
  });
  const next: EditorialReviewRecord = {
    jobId,
    taskId,
    status: current?.status ?? "needs_review",
    decision: current?.decision ?? "pending",
    editorNotes: current?.editorNotes ?? "",
    approvedAt: current?.approvedAt ?? null,
    rejectedAt: current?.rejectedAt ?? null,
    publishedAt: current?.publishedAt ?? null,
    updatedAt: nowIso(),
    ...update,
  };
  await writeJsonFile(getEditorialTaskReviewPath(jobId, taskId), next);
  return next;
}

export async function findEditorialTask(taskId: string): Promise<TaskLookupResult | null> {
  const jobs = await listEditorialJobs();
  for (const job of jobs) {
    const queue = await readEditorialQueue(job.id);
    const task = queue.tasks.find((item) => item.id === taskId);
    if (task) {
      return { job, queue, task };
    }
  }
  return null;
}

export function buildResearchPacket(input: {
  targetName: string;
  sourceMode: EditorialSourceMode;
  artistContext: Record<string, unknown> | null;
  genreContext?: Record<string, unknown> | null;
  relatedArtists?: string[];
  provenance?: Array<{ type: string; value: string }>;
}): EditorialResearchPacket {
  return {
    targetName: input.targetName,
    sourceMode: input.sourceMode,
    artistContext: input.artistContext,
    genreContext: input.genreContext ?? null,
    relatedArtists: input.relatedArtists ?? [],
    provenance: input.provenance ?? [],
  };
}
