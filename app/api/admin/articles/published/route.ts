import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { readJsonFile } from "@/src/lib/json-store";
import type { MagazineLang, MagazineArticleTranslation } from "@/src/types/magazine";

const PUBLISHED_ARTICLES_DIR = path.join(process.cwd(), "data", "editorial", "published", "articles");
const ALL_LANGS: MagazineLang[] = ["es", "fr", "de", "ja", "ru", "zh", "pt", "ko", "it", "nl"];

export async function GET() {
  try {
    const files = await fs.readdir(PUBLISHED_ARTICLES_DIR);
    const articleFiles = files.filter((f) => f.endsWith(".json") && !f.endsWith(".enriched.json"));

    const articles = await Promise.all(
      articleFiles.map(async (file) => {
        const data = await readJsonFile<Record<string, unknown>>(
          path.join(PUBLISHED_ARTICLES_DIR, file),
          { fallback: null as never },
        );
        if (!data || typeof data.slug !== "string" || typeof data.title !== "string") return null;

        const translations = (data.translations ?? null) as Partial<Record<MagazineLang, MagazineArticleTranslation>> | null;
        const translationStatus = ALL_LANGS.reduce<Record<string, boolean>>((acc, lang) => {
          acc[lang] = Boolean(translations?.[lang]?.title && (translations[lang]?.content?.length ?? 0) > 0);
          return acc;
        }, {});
        const missingLangs = ALL_LANGS.filter((l) => !translationStatus[l]);

        return {
          slug: data.slug as string,
          title: data.title as string,
          category: typeof data.category === "string" ? data.category : "CULTURE",
          date: typeof data.date === "string" ? data.date : "",
          author: typeof data.author === "string" ? data.author : "",
          readTime: typeof data.readTime === "string" ? data.readTime : "",
          excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
          image_url: typeof data.image_url === "string" ? data.image_url : null,
          translationStatus,
          missingLangs,
        };
      }),
    );

    return NextResponse.json({
      articles: articles
        .filter(Boolean)
        .sort((a, b) => (b!.date > a!.date ? 1 : -1)),
    });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
