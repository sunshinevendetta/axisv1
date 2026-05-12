import path from "node:path";

export function getEditorialRoot(cwd: string = process.cwd()) {
  return path.resolve(cwd, "data/editorial");
}

export function getEditorialTargetsDir(cwd?: string) {
  return path.join(getEditorialRoot(cwd), "targets");
}

export function getEditorialJobsDir(cwd?: string) {
  return path.join(getEditorialRoot(cwd), "jobs");
}

export function getEditorialPublishedDir(cwd?: string) {
  return path.join(getEditorialRoot(cwd), "published");
}

export function getEditorialPublishedArticlesDir(cwd?: string) {
  return path.join(getEditorialPublishedDir(cwd), "articles");
}

export function getEditorialPublishedIndexPath(cwd?: string) {
  return path.join(getEditorialPublishedDir(cwd), "index.json");
}

export function getEditorialPublishedArticlePath(slug: string, cwd?: string) {
  return path.join(getEditorialPublishedArticlesDir(cwd), `${slug}.json`);
}

export function getEditorialPublishedEnrichedArticlePath(slug: string, cwd?: string) {
  return path.join(getEditorialPublishedArticlesDir(cwd), `${slug}.enriched.json`);
}

export function getEditorialJobDir(jobId: string, cwd?: string) {
  return path.join(getEditorialJobsDir(cwd), jobId);
}

export function getEditorialJobPath(jobId: string, cwd?: string) {
  return path.join(getEditorialJobDir(jobId, cwd), "job.json");
}

export function getEditorialQueuePath(jobId: string, cwd?: string) {
  return path.join(getEditorialJobDir(jobId, cwd), "queue.json");
}

export function getEditorialJobArticlesDir(jobId: string, cwd?: string) {
  return path.join(getEditorialJobDir(jobId, cwd), "articles");
}

export function getEditorialTaskDraftPath(jobId: string, taskId: string, cwd?: string) {
  return path.join(getEditorialJobArticlesDir(jobId, cwd), `${taskId}.draft.json`);
}

export function getEditorialTaskEnrichedPath(jobId: string, taskId: string, cwd?: string) {
  return path.join(getEditorialJobArticlesDir(jobId, cwd), `${taskId}.enriched.json`);
}

export function getEditorialTaskReviewPath(jobId: string, taskId: string, cwd?: string) {
  return path.join(getEditorialJobArticlesDir(jobId, cwd), `${taskId}.review.json`);
}

export function getEditorialTargetPath(targetSlug: string, cwd?: string) {
  return path.join(getEditorialTargetsDir(cwd), `${targetSlug}.json`);
}
