import fs from "node:fs";
import path from "node:path";
import { isRecord, readJsonFile, writeJsonFile } from "@/src/lib/json-store";

export type ArticleEnricherArticleLimit = number | "all";

export type ArticleEnricherWriterPromptConfig = {
  systemPromptOverride: string | null;
  promptIntroOverride: string | null;
  rulesOverride: string[] | null;
  extraRules: string[];
};

export type ArticleEnricherEditorPromptConfig = {
  systemPromptOverride: string | null;
  checksOverride: string[] | null;
  extraChecks: string[];
};

export type ArticleEnricherHqConfig = {
  articleSourceSlug: string | null;
  articleLimit: ArticleEnricherArticleLimit;
  writerPrompt: ArticleEnricherWriterPromptConfig;
  editorPrompt: ArticleEnricherEditorPromptConfig;
};

export const ARTICLE_ENRICHER_HQ_CONFIG_PATH = path.resolve(
  process.cwd(),
  "data/admin/article-enricher.json",
);
const runtimeArticleEnricherHqWritesAllowed =
  process.env.NODE_ENV !== "production" || process.env.ALLOW_FS_ARTICLE_ENRICHER_HQ_WRITES === "true";

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeStringArrayOverride(value: unknown) {
  if (value == null) {
    return null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = normalizeStringArray(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeArticleLimit(value: unknown): ArticleEnricherArticleLimit {
  if (value === "all") {
    return "all";
  }

  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "all") {
      return "all";
    }

    const parsed = Number.parseInt(normalized, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1;
}

function normalizeWriterPromptConfig(value: unknown): ArticleEnricherWriterPromptConfig {
  const record = isRecord(value) ? value : {};

  return {
    systemPromptOverride: normalizeOptionalString(record.systemPromptOverride),
    promptIntroOverride: normalizeOptionalString(record.promptIntroOverride),
    rulesOverride: normalizeStringArrayOverride(record.rulesOverride),
    extraRules: normalizeStringArray(record.extraRules),
  };
}

function normalizeEditorPromptConfig(value: unknown): ArticleEnricherEditorPromptConfig {
  const record = isRecord(value) ? value : {};

  return {
    systemPromptOverride: normalizeOptionalString(record.systemPromptOverride),
    checksOverride: normalizeStringArrayOverride(record.checksOverride),
    extraChecks: normalizeStringArray(record.extraChecks),
  };
}

export function getDefaultArticleEnricherHqConfig(): ArticleEnricherHqConfig {
  return {
    articleSourceSlug: null,
    articleLimit: 1,
    writerPrompt: {
      systemPromptOverride: null,
      promptIntroOverride: null,
      rulesOverride: null,
      extraRules: [],
    },
    editorPrompt: {
      systemPromptOverride: null,
      checksOverride: null,
      extraChecks: [],
    },
  };
}

export function normalizeArticleEnricherHqConfig(value: unknown): ArticleEnricherHqConfig {
  const defaults = getDefaultArticleEnricherHqConfig();
  const record = isRecord(value) ? value : {};

  return {
    articleSourceSlug: normalizeOptionalString(record.articleSourceSlug),
    articleLimit: normalizeArticleLimit(record.articleLimit),
    writerPrompt: normalizeWriterPromptConfig(record.writerPrompt ?? defaults.writerPrompt),
    editorPrompt: normalizeEditorPromptConfig(record.editorPrompt ?? defaults.editorPrompt),
  };
}

export function isArticleEnricherHqConfig(value: unknown): value is ArticleEnricherHqConfig {
  if (!isRecord(value)) {
    return false;
  }

  if (value.articleSourceSlug != null && typeof value.articleSourceSlug !== "string") {
    return false;
  }

  const articleLimitValid =
    value.articleLimit === "all" ||
    (typeof value.articleLimit === "number" && Number.isInteger(value.articleLimit) && value.articleLimit > 0) ||
    (typeof value.articleLimit === "string" &&
      ((value.articleLimit.trim().toLowerCase() === "all") ||
        (Number.isInteger(Number.parseInt(value.articleLimit, 10)) &&
          Number.parseInt(value.articleLimit, 10) > 0)));

  if (!articleLimitValid) {
    return false;
  }

  if (!isRecord(value.writerPrompt) || !isRecord(value.editorPrompt)) {
    return false;
  }

  const writerPrompt = value.writerPrompt;
  const editorPrompt = value.editorPrompt;

  if (writerPrompt.systemPromptOverride != null && typeof writerPrompt.systemPromptOverride !== "string") {
    return false;
  }

  if (writerPrompt.promptIntroOverride != null && typeof writerPrompt.promptIntroOverride !== "string") {
    return false;
  }

  if (writerPrompt.rulesOverride != null && !Array.isArray(writerPrompt.rulesOverride)) {
    return false;
  }

  if (!Array.isArray(writerPrompt.extraRules)) {
    return false;
  }

  if (editorPrompt.systemPromptOverride != null && typeof editorPrompt.systemPromptOverride !== "string") {
    return false;
  }

  if (editorPrompt.checksOverride != null && !Array.isArray(editorPrompt.checksOverride)) {
    return false;
  }

  if (!Array.isArray(editorPrompt.extraChecks)) {
    return false;
  }

  return true;
}

export async function readArticleEnricherHqConfig(): Promise<ArticleEnricherHqConfig> {
  const config = await readJsonFile(ARTICLE_ENRICHER_HQ_CONFIG_PATH, {
    fallback: getDefaultArticleEnricherHqConfig(),
    validate: isArticleEnricherHqConfig,
    onError: (error) => {
      console.error("Falling back to default article enricher HQ config:", error);
    },
  });

  return normalizeArticleEnricherHqConfig(config);
}

export function readArticleEnricherHqConfigSync(): ArticleEnricherHqConfig {
  try {
    if (!fs.existsSync(ARTICLE_ENRICHER_HQ_CONFIG_PATH)) {
      return getDefaultArticleEnricherHqConfig();
    }

    const raw = fs.readFileSync(ARTICLE_ENRICHER_HQ_CONFIG_PATH, "utf8");
    return normalizeArticleEnricherHqConfig(JSON.parse(raw));
  } catch (error) {
    console.error("Falling back to default article enricher HQ config:", error);
    return getDefaultArticleEnricherHqConfig();
  }
}

export async function writeArticleEnricherHqConfig(config: ArticleEnricherHqConfig) {
  if (!runtimeArticleEnricherHqWritesAllowed) {
    throw new Error(
      "Runtime article enricher HQ writes are disabled outside local/dev unless ALLOW_FS_ARTICLE_ENRICHER_HQ_WRITES=true.",
    );
  }

  const normalized = normalizeArticleEnricherHqConfig(config);

  await writeJsonFile(
    ARTICLE_ENRICHER_HQ_CONFIG_PATH,
    normalized,
  );

  return normalized;
}
