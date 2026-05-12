import type { MagazineArticle, MagazineLang } from "@/src/types/magazine";

export function localizeMagazineArticle(article: MagazineArticle, lang: MagazineLang): MagazineArticle {
  if (lang === "en") {
    return article;
  }

  const translation = article.translations?.[lang];
  if (!translation) {
    return article;
  }

  return {
    ...article,
    title: translation.title ?? article.title,
    subtitle: translation.subtitle ?? article.subtitle,
    excerpt: translation.excerpt ?? article.excerpt,
    content: translation.content ?? article.content,
  };
}
