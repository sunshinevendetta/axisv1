import { NextResponse } from "next/server";
import { findEditorialTask } from "@/src/lib/editorial-store";
import { getEditorialTaskDraftPath, getEditorialPublishedArticlePath } from "@/src/lib/editorial-paths";
import { writeJsonFile, readJsonFile } from "@/src/lib/json-store";
import { promises as fs } from "node:fs";
import type { MagazineLang, MagazineArticleTranslation, ContentBlock } from "@/src/types/magazine";

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

  const res = await fetch(`${HERMES_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HERMES_MODEL,
      temperature: 0.15,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text into ${LANG_NAMES[targetLang]}. Return only the translated text with no explanation, preamble, or formatting.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  const payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!res.ok) throw new Error(payload.error?.message ?? `Hermes API ${res.status}`);

  const content = payload.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("Hermes returned empty response");
  return content.trim();
}

async function translateToLang(
  article: Record<string, unknown>,
  targetLang: MagazineLang,
): Promise<MagazineArticleTranslation> {
  const title = typeof article.title === "string" ? article.title : "";
  const subtitle = typeof article.subtitle === "string" ? article.subtitle : "";
  const excerpt = typeof article.excerpt === "string" ? article.excerpt : "";
  const content = Array.isArray(article.content)
    ? (article.content as ContentBlock[]).filter((b) => typeof b.text === "string")
    : [];

  const [tTitle, tSubtitle, tExcerpt] = await Promise.all([
    hermesTranslate(title, targetLang),
    hermesTranslate(subtitle, targetLang),
    hermesTranslate(excerpt, targetLang),
  ]);

  const tContent: ContentBlock[] = [];
  for (const block of content) {
    tContent.push({ ...block, text: await hermesTranslate(block.text, targetLang) });
  }

  return { title: tTitle, subtitle: tSubtitle, excerpt: tExcerpt, content: tContent };
}

type TranslateBody = { langs?: MagazineLang[] };

export async function POST(req: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as TranslateBody;

  const ALL_LANGS: MagazineLang[] = ["es", "fr", "de", "ja", "ru", "zh", "pt", "ko", "it", "nl"];
  const targetLangs: MagazineLang[] =
    Array.isArray(body.langs) && body.langs.length > 0
      ? body.langs.filter((l): l is MagazineLang => l in LANG_NAMES && l !== "en")
      : ALL_LANGS;

  const resolved = await findEditorialTask(taskId);
  if (!resolved) {
    return NextResponse.json({ error: `Task "${taskId}" not found.` }, { status: 404 });
  }

  const draftPath = getEditorialTaskDraftPath(resolved.job.id, resolved.task.id);
  const draft = await readJsonFile<Record<string, unknown>>(draftPath, { fallback: null as never });
  if (!draft || !draft.article) {
    return NextResponse.json({ error: "No draft article found." }, { status: 400 });
  }

  const article = draft.article as Record<string, unknown>;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      }

      const translations: Partial<Record<MagazineLang, MagazineArticleTranslation>> =
        (typeof article.translations === "object" && article.translations !== null
          ? (article.translations as Partial<Record<MagazineLang, MagazineArticleTranslation>>)
          : {});

      for (const lang of targetLangs) {
        try {
          send({ type: "log", text: `Translating to ${LANG_NAMES[lang]}…` });
          translations[lang] = await translateToLang(article, lang);
          send({ type: "log", text: `✓ ${LANG_NAMES[lang]} done` });
        } catch (err) {
          send({
            type: "log",
            text: `✗ ${LANG_NAMES[lang]} failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }

      const updatedArticle = { ...article, translations };
      const updatedDraft = { ...draft, article: updatedArticle };

      try {
        await writeJsonFile(draftPath, updatedDraft);

        // Also update the published file on disk if it exists
        const publishedPath = getEditorialPublishedArticlePath(resolved.task.slug);
        try {
          await fs.access(publishedPath);
          const published = await readJsonFile<Record<string, unknown>>(publishedPath, { fallback: null as never });
          if (published) {
            await writeJsonFile(publishedPath, { ...published, translations });
          }
        } catch {
          // Not published yet — skip
        }

        send({ type: "done", text: `Translations saved for ${targetLangs.length} language(s).` });
      } catch (err) {
        send({
          type: "error",
          text: `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
