import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicMagazineArticle from "@/components/magazine/PublicMagazineArticle";
import {
  getEditorialPublicArticlePageData,
  getEditorialPublicIndexEntries,
} from "@/src/lib/editorial-public";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getEditorialPublicIndexEntries();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getEditorialPublicArticlePageData(slug);

  if (!article) {
    return {
      title: "Magazine",
    };
  }

  return {
    title: `${article.title} | AXIS Hypermedia`,
    description: article.excerpt || article.subtitle,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.subtitle,
      type: "article",
      images: article.image_url ? [{ url: article.image_url }] : undefined,
    },
  };
}

export default async function MagazineArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { article, indexArticles } = await getEditorialPublicArticlePageData(slug);

  if (!article) {
    notFound();
  }

  return <PublicMagazineArticle article={article} allArticles={indexArticles} />;
}
