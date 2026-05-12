import { NextRequest, NextResponse } from "next/server";
import {
  ARTICLE_ENRICHER_HQ_CONFIG_PATH,
  readArticleEnricherHqConfigSync,
  writeArticleEnricherHqConfig,
} from "@/src/lib/article-enricher-hq";
import {
  DEFAULT_EDITOR_CHECKS,
  DEFAULT_OUTPUT_RULES,
  EDITOR_SYSTEM_PROMPT,
  HERMES_SYSTEM_PROMPT,
} from "@/tools/article-enricher/axis-hermes-prompt";

export async function GET() {

  return NextResponse.json({
    path: ARTICLE_ENRICHER_HQ_CONFIG_PATH,
    config: readArticleEnricherHqConfigSync(),
    baseline: {
      writerSystemPrompt: HERMES_SYSTEM_PROMPT,
      writerRules: DEFAULT_OUTPUT_RULES,
      editorSystemPrompt: EDITOR_SYSTEM_PROMPT,
      editorChecks: DEFAULT_EDITOR_CHECKS,
    },
  });
}

export async function PUT(request: NextRequest) {

  try {
    const body = await request.json();
    const nextConfig = await writeArticleEnricherHqConfig(body?.config ?? body);

    return NextResponse.json({
      ok: true,
      path: ARTICLE_ENRICHER_HQ_CONFIG_PATH,
      config: nextConfig,
      baseline: {
        writerSystemPrompt: HERMES_SYSTEM_PROMPT,
        writerRules: DEFAULT_OUTPUT_RULES,
        editorSystemPrompt: EDITOR_SYSTEM_PROMPT,
        editorChecks: DEFAULT_EDITOR_CHECKS,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not write article HQ config.",
      },
      { status: 500 },
    );
  }
}

export const POST = PUT;
