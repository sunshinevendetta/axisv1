import type { MagazineArticle } from "@/src/types/magazine";

export type EditorialPublicSource = "published-index" | "legacy-content";

export type EditorialPublicArticleTeaser = Partial<MagazineArticle> & {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export type EditorialPublicArticleLocation = {
  articlePath?: string | null;
  groveUri?: string | null;
  groveGatewayUrl?: string | null;
  groveStorageKey?: string | null;
  publicUrl?: string | null;
};

export type EditorialPublicIndexEntry = EditorialPublicArticleLocation &
  EditorialPublicArticleTeaser & {
    id?: string | number;
    publishedAt?: string | null;
    status?: "published" | "approved" | "draft" | "archived" | string;
    article?: Partial<MagazineArticle> | null;
    coverImage?: string | null;
  };

export type EditorialPublicIndex = {
  version: number;
  generatedAt?: string;
  articles: EditorialPublicIndexEntry[];
};

export type EditorialPublicArticleRecord = MagazineArticle &
  EditorialPublicArticleLocation & {
    publishedAt?: string | null;
    status?: string;
    source: EditorialPublicSource;
  };
