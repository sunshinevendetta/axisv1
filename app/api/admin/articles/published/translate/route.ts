import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/src/lib/json-store";
import type { MagazineLang, MagazineArticleTranslation, ContentBlock } from "@/src/types/magazine";

const PUBLISHED_ARTICLES_DIR = path.join(process.cwd(), "data", "editorial", "published", "articles");
const HERMES_BASE_URL = "https://inference-api.nousresearch.com/v1";
const HERMES_MODEL = "Hermes-4-70B";

const LANG_NAMES: Record<MagazineLang, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ru: "Russian",
  zh: "Simplified Chinese",
  pt: "Brazilian Portuguese",
  ko: "Korean",
  it: "Italian",
  nl: "Dutch",
};

async function hermesTranslate(text: string, targetLang: MagazineLang): Promise<string> {
  const apiKey = process.env.NOUS_API_KEY?.trim();
  if (!apiKey) throw new Error("Missing NOUS_API_KEY");
  if (!text.trim()) return text;

  const res = await fetch(`${HERMES_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: HERMES_MODEL,
      temperature: 0.15,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${LANG_NAMES[targetLang]}. Return only the translated text — no explanation, no preamble.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(payload.error?.message ?? `Hermes ${res.status}`);
  const out = payload.choices?.[0]?.message?.content?.trim() ?? "";
  if (!out) throw new Error("Empty response from Hermes");
  return out;
}

async function translateArticle(
  article: Record<string, unknown>,
  lang: MagazineLang,
): Promise<MagazineArticleTranslation> {
  const title = typeof article.title === "string" ? article.title : "";
  const subtitle = typeof article.subtitle === "string" ? article.subtitle : "";
  const excerpt = typeof article.excerpt === "string" ? article.excerpt : "";
  const blocks = Array.isArray(article.content)
    ? (article.content as ContentBlock[]).filter((b) => typeof b.text === "string")
    : [];

  const [tTitle, tSubtitle, tExcerpt] = await Promise.all([
    hermesTranslate(title, lang),
    hermesTranslate(subtitle, lang),
    hermesTranslate(excerpt, lang),
  ]);

  // Translate content blocks sequentially to avoid rate limits
  const tContent: ContentBlock[] = [];
  for (const block of blocks) {
    tContent.push({ ...block, text: await hermesTranslate(block.text, lang) });
  }

  return { title: tTitle, subtitle: tSubtitle, excerpt: tExcerpt, content: tContent };
}

type TranslateBody = {
  slug: string;
  langs?: MagazineLang[];
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TranslateBody;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const ALL_LANGS: MagazineLang[] = ["es", "fr", "de", "ja", "ru", "zh", "pt", "ko", "it", "nl"];
  const targetLangs: MagazineLang[] =
    Array.isArray(body.langs) && body.langs.length > 0
      ? body.langs.filter((l): l is MagazineLang => l in LANG_NAMES && l !== "en")
      : ALL_LANGS;

  const articlePath = path.join(PUBLISHED_ARTICLES_DIR, `${slug}.json`);
  try {
    await fs.access(articlePath);
  } catch {
    return NextResponse.json({ error: `Published article "${slug}" not found.` }, { status: 404 });
  }

  const article = await readJsonFile<Record<string, unknown>>(articlePath, { fallback: null as never });
  if (!article || typeof article.title !== "string") {
    return NextResponse.json({ error: "Invalid article file." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      }

      const translations: Partial<Record<MagazineLang, MagazineArticleTranslation>> =
        typeof article.translations === "object" && article.translations !== null
          ? { ...(article.translations as Partial<Record<MagazineLang, MagazineArticleTranslation>>) }
          : {};

      for (const lang of targetLangs) {
        try {
          send({ type: "log", lang, text: `[${lang.toUpperCase()}] Translating "${article.title}"…` });
          translations[lang] = await translateArticle(article, lang);
          send({ type: "progress", lang, status: "done", text: `[${lang.toUpperCase()}] ✓ Done` });
        } catch (err) {
          send({ type: "progress", lang, status: "error", text: `[${lang.toUpperCase()}] ✗ ${err instanceof Error ? err.message : String(err)}` });
        }
      }

      try {
        await writeJsonFile(articlePath, { ...article, translations });
        send({ type: "done", text: `Saved translations for "${slug}".`, slug, langs: Object.keys(translations) });
      } catch (err) {
        send({ type: "error", text: `Failed to save: ${err instanceof Error ? err.message : String(err)}` });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
  });
}
