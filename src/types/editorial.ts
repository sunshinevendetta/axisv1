export type EditorialTargetType = "artist" | "genre" | "scene";

export type EditorialSourceMode = "existing_db" | "new_target" | "mixed";

export type EditorialJobMode = "single" | "batch" | "catalog";

export type EditorialJobStatus = "queued" | "running" | "paused" | "completed" | "failed";

export type EditorialTaskStatus =
  | "queued"
  | "researching"
  | "drafting"
  | "needs_review"
  | "approved"
  | "published"
  | "rejected"
  | "failed";

export type EditorialFilterSet = {
  artistSlugs: string[];
  genre: string | null;
  scene: string | null;
  city: string | null;
  missingOnly: boolean;
};

export type EditorialPromptProfile = {
  writerProfile: string;
  editorProfile: string;
};

export type EditorialTargetRecord = {
  key: string;
  type: EditorialTargetType;
  name: string;
  slug: string;
  sourceMode: EditorialSourceMode;
  status: "active" | "draft";
  genres: string[];
  tags: string[];
  relatedArtists: string[];
  city: string | null;
  summary: string;
  provenance: Array<{
    type: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type EditorialResearchPacket = {
  targetName: string;
  sourceMode: EditorialSourceMode;
  artistContext: Record<string, unknown> | null;
  genreContext: Record<string, unknown> | null;
  relatedArtists: string[];
  provenance: Array<{
    type: string;
    value: string;
  }>;
};

export type EditorialJobRecord = {
  id: string;
  mode: EditorialJobMode;
  source: EditorialSourceMode;
  targetType: EditorialTargetType;
  filters: EditorialFilterSet;
  count: number | "all";
  concurrency: number;
  status: EditorialJobStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  createdBy: string;
  promptProfile: EditorialPromptProfile;
  notes: string;
};

export type EditorialTaskSourceRef =
  | {
      kind: "raw_article";
      rawId: string;
      rawSlug: string;
      rawFolder: string | null;
    }
  | {
      kind: "artist_catalog";
      artistSlug: string;
      artistName: string;
    };

export type EditorialArticleTask = {
  id: string;
  jobId: string;
  targetKey: string;
  targetType: EditorialTargetType;
  slug: string;
  sourceRef: EditorialTaskSourceRef;
  status: EditorialTaskStatus;
  draftPath: string;
  enrichedPath: string;
  reviewPath: string;
  groveUri: string | null;
  groveGatewayUrl: string | null;
  groveStorageKey: string | null;
  error: string | null;
  attempts: number;
  updatedAt: string;
};

export type EditorialJobQueue = {
  jobId: string;
  tasks: EditorialArticleTask[];
};

export type EditorialReviewDecision = "pending" | "approved" | "rejected" | "redo_requested";

export type EditorialReviewRecord = {
  jobId: string;
  taskId: string;
  status: EditorialTaskStatus;
  decision: EditorialReviewDecision;
  editorNotes: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type EditorialDraftArtifact<TArticle = Record<string, unknown>> = {
  jobId: string;
  taskId: string;
  targetKey: string;
  article: TArticle;
};

export type EditorialEnrichedArtifact<TArticle = Record<string, unknown>> = {
  jobId: string;
  taskId: string;
  target: {
    key: string;
    type: EditorialTargetType;
    name: string;
  };
  researchPacket: EditorialResearchPacket;
  promptConfig: EditorialPromptProfile;
  modelOutput: {
    writer: TArticle;
    editor: TArticle;
  };
  review: {
    status: EditorialTaskStatus;
    notes: string;
  };
};

export type PublishedArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string | null;
  articlePath: string;
  groveUri: string;
  groveGatewayUrl: string;
  groveStorageKey: string | null;
  publishedAt: string;
  status: "published";
};

export type PublishedArticleIndex = {
  version: 1;
  generatedAt: string;
  articles: PublishedArticleRecord[];
};
