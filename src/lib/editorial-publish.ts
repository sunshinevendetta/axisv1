import { resolvePublicAssetUrl, uploadToGrove } from "@/src/lib/grove";
import { getEditorialPublishedArticlePath, getEditorialPublishedEnrichedArticlePath } from "@/src/lib/editorial-paths";
import {
  findEditorialTask,
  readEditorialArtifacts,
  updateEditorialReview,
  updateEditorialTask,
  upsertPublishedArticle,
} from "@/src/lib/editorial-store";
import { writeJsonFile } from "@/src/lib/json-store";
import type { PublishedArticleRecord } from "@/src/types/editorial";
import path from "node:path";

function toJsonBytes(value: unknown) {
  return new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
}

export async function publishEditorialTask(
  taskId: string,
  options?: { publishEnriched?: boolean; imageGroveUrl?: string },
) {
  const resolved = await findEditorialTask(taskId);
  if (!resolved) {
    throw new Error(`Editorial task "${taskId}" was not found.`);
  }

  const artifacts = await readEditorialArtifacts<Record<string, unknown>>(resolved.job.id, resolved.task.id);
  if (!artifacts.draft?.article) {
    throw new Error(`Task "${taskId}" does not have a draft artifact to publish.`);
  }

  const articleToPublish =
    options?.imageGroveUrl
      ? { ...(artifacts.draft.article as Record<string, unknown>), image_url: options.imageGroveUrl }
      : artifacts.draft.article;

  const articleUpload = await uploadToGrove({
    bytes: toJsonBytes(articleToPublish),
    fileName: `${resolved.task.slug}.json`,
    contentType: "application/json",
  });

  let enrichedUpload: Awaited<ReturnType<typeof uploadToGrove>> | null = null;

  if (options?.publishEnriched !== false && artifacts.enriched) {
    enrichedUpload = await uploadToGrove({
      bytes: toJsonBytes(artifacts.enriched),
      fileName: `${resolved.task.slug}.enriched.json`,
      contentType: "application/json",
    });
  }

  const article = articleToPublish as Record<string, unknown>;
  const publishedAt = new Date().toISOString();
  const articlePath = getEditorialPublishedArticlePath(resolved.task.slug);

  await writeJsonFile(articlePath, articleToPublish);

  if (artifacts.enriched) {
    await writeJsonFile(getEditorialPublishedEnrichedArticlePath(resolved.task.slug), artifacts.enriched);
  }

  const record: PublishedArticleRecord = {
    id: `${resolved.task.id}`,
    slug: resolved.task.slug,
    title: typeof article.title === "string" ? article.title : resolved.task.slug,
    excerpt: typeof article.excerpt === "string" ? article.excerpt : "",
    author: typeof article.author === "string" ? article.author : "",
    date: typeof article.date === "string" ? article.date : publishedAt.split("T")[0],
    tags: Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === "string") : [],
    coverImage: typeof article.image_url === "string" ? article.image_url : null,
    articlePath: path.relative(process.cwd(), articlePath),
    groveUri: articleUpload.uri ?? "",
    groveGatewayUrl: resolvePublicAssetUrl(articleUpload),
    groveStorageKey: articleUpload.storage_key,
    publishedAt,
    status: "published",
  };

  await upsertPublishedArticle(record);
  await updateEditorialTask(resolved.job.id, resolved.task.id, {
    status: "published",
    groveUri: articleUpload.uri,
    groveGatewayUrl: resolvePublicAssetUrl(articleUpload),
    groveStorageKey: articleUpload.storage_key,
    error: null,
  });
  await updateEditorialReview(resolved.job.id, resolved.task.id, {
    status: "published",
    decision: "approved",
    publishedAt,
  });

  return {
    task: await findEditorialTask(taskId),
    published: record,
    uploads: {
      article: articleUpload,
      enriched: enrichedUpload,
    },
  };
}
