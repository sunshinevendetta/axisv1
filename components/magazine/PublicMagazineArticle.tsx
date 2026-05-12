"use client";

import { useRouter } from "next/navigation";
import ArticleReader from "@/components/magazine/ArticleReader";
import MagazinePageChrome from "@/components/magazine/MagazinePageChrome";
import { useMagazineLanguage } from "@/hooks/useMagazineLanguage";
import { getArtistHref } from "@/src/content/artists";
import type { MagazineArticle } from "@/src/types/magazine";

type Props = {
  article: MagazineArticle;
  allArticles: MagazineArticle[];
};

export default function PublicMagazineArticle({ article, allArticles }: Props) {
  const router = useRouter();
  const { lang, setLang } = useMagazineLanguage();

  return (
    <MagazinePageChrome>
      <div className="pt-8">
        <ArticleReader
          article={article}
          allArticles={allArticles}
          onBack={() => router.push("/magazine")}
          onOpenArticle={(slug) => router.push(`/magazine/${slug}`)}
          onOpenArtist={(artist) => router.push(getArtistHref(artist))}
          lang={lang}
          onLangChange={setLang}
        />
      </div>
    </MagazinePageChrome>
  );
}
