import { INGREDIENTS, getGarnish, getIngredient } from "./velvique-catalog";
import { dominantNotes, intensityLabel } from "./velvique-engine";
import { describeAnswers } from "./velvique-questions";
import type { Assignment, Guest, Narrative } from "./velvique-store";
import { getCandidates } from "./velvique-engine";

/* Narrative agent: names and explains an already committed recipe. It never
   sees authority over ingredients or volumes; output that mentions a shelf
   ingredient outside the recipe is discarded for the deterministic fallback.

   Provider: VELVIQUE_AI_PROVIDER = "nvidia" (default) | "claude".
   NVIDIA Build uses the OpenAI-compatible chat completions endpoint;
   Claude uses the Anthropic Messages API. */

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";
const CLAUDE_MODEL = "claude-sonnet-5-5";
const TIMEOUT_MS = 12000;

/* The guest's site language; the narrative is written in it. */
export type NarrativeLanguage = "en" | "es" | "zh" | "zh-Hant";
const LANGUAGE_NAMES: Record<NarrativeLanguage, string> = {
  en: "English",
  es: "Mexican Spanish",
  zh: "Simplified Chinese",
  "zh-Hant": "Traditional Chinese",
};

export function isNarrativeLanguage(value: unknown): value is NarrativeLanguage {
  return value === "en" || value === "es" || value === "zh" || value === "zh-Hant";
}

type Provider = "nvidia" | "claude";

export function getAiProvider(): Provider {
  return process.env.VELVIQUE_AI_PROVIDER?.trim().toLowerCase() === "claude" ? "claude" : "nvidia";
}

const SYSTEM_PROMPT = [
  "You are the narrative voice of Velvique, a personalized tequila mini-shot experience produced by AXIS.",
  "A deterministic engine has already chosen and committed the recipe. You only name it and describe it.",
  "Never add, remove, rename or substitute ingredients, never state volumes, never claim health or allergen facts.",
  "Mention only ingredients listed in the recipe. The sensory reading is a playful interpretation, not a personality measurement.",
  'Reply with JSON only: {"name": string (2-4 words, evocative, no quotes), "reading": string (one sentence about the guest\'s sensory direction), "description": string (max 40 words about how the shot tastes)}.',
].join(" ");

function userPrompt(guest: Guest, assignment: Assignment) {
  const answers = describeAnswers(guest.answerIds);
  const candidate = getCandidates().find((item) => item.signature === assignment.recipeSignature);
  const garnish = assignment.garnishId ? getGarnish(assignment.garnishId) : null;
  return [
    `Guest answers: ${answers.map((a) => `${a.question}: ${a.answer} (${a.detail})`).join("; ")}.`,
    `Recipe ingredients: ${assignment.components.map((c) => getIngredient(c.ingredientId)!.name).join(", ")}.`,
    garnish ? `Garnish: ${garnish.name}.` : "No garnish.",
    candidate ? `Dominant notes: ${dominantNotes(candidate.profile).join(", ")}; intensity ${intensityLabel(candidate.profile)}.` : "",
  ].join("\n");
}

async function callNvidia(system: string, user: string) {
  const apiKey = process.env.NVIDIA_API_KEY?.trim() || process.env.NVIDIA_BUILD_API_KEY?.trim() || process.env.NVAPI_KEY?.trim();
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  const baseUrl = process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_BASE_URL;
  const model = process.env.VELVIQUE_NVIDIA_MODEL?.trim() || NVIDIA_MODEL;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model,
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 500,
      stream: false,
      /* Nemotron 3 reasons by default and can spend the budget before answering. */
      chat_template_kwargs: { enable_thinking: false },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || `NVIDIA request failed with ${response.status}`);
  return { text: payload.choices?.[0]?.message?.content ?? "", model };
}

async function callClaude(system: string, user: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = process.env.VELVIQUE_CLAUDE_MODEL?.trim() || CLAUDE_MODEL;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({ model, max_tokens: 400, system, messages: [{ role: "user", content: user }] }),
  });
  const payload = (await response.json().catch(() => ({}))) as { content?: Array<{ type: string; text?: string }>; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || `Claude request failed with ${response.status}`);
  return { text: payload.content?.filter((block) => block.type === "text").map((block) => block.text).join("") ?? "", model };
}

function parseNarrative(text: string) {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    const name = typeof parsed.name === "string" ? parsed.name.replace(/["“”]/g, "").trim() : "";
    const reading = typeof parsed.reading === "string" ? parsed.reading.trim() : "";
    const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
    if (!name || !description || name.length > 48 || description.length > 360 || reading.length > 280) return null;
    return { name, reading, description };
  } catch {
    return null;
  }
}

function mentionsForeignIngredient(text: string, assignment: Assignment) {
  const inRecipe = new Set(assignment.components.map((c) => c.ingredientId));
  /* The assigned garnish may be named (e.g. dehydrated pineapple) even when its fruit is not poured. */
  const garnish = assignment.garnishId ? getGarnish(assignment.garnishId)?.name.toLowerCase() ?? "" : "";
  const lower = text.toLowerCase();
  return INGREDIENTS.some((item) => {
    if (inRecipe.has(item.id)) return false;
    const key = item.name.toLowerCase().split(/[\s-]/).find((word) => word.length > 5 && !["cordial", "infusion", "clarified", "roasted", "diluted", "standardized"].includes(word));
    return key && !garnish.includes(key) ? lower.includes(key) : false;
  });
}

export function fallbackNarrative(guest: Guest, assignment: Assignment): Narrative {
  const candidate = getCandidates().find((item) => item.signature === assignment.recipeSignature);
  const notes = candidate ? dominantNotes(candidate.profile) : [];
  const answers = describeAnswers(guest.answerIds);
  const supports = assignment.components.filter((c) => c.ingredientId !== "T01").map((c) => getIngredient(c.ingredientId)!.name.toLowerCase());
  return {
    name: `${answers[2].answer} ${answers[0].answer}`,
    reading: `${answers[0].answer}, ${answers[3].answer.toLowerCase()}, drawn to ${answers[1].answer.toLowerCase()} and a ${answers[4].answer.toLowerCase()} finish.`,
    description: `Velvique Añejo Cristalino with ${supports.join(", ")}. ${notes.length ? `Leading with ${notes.join(", ")}.` : ""}`.trim(),
    provider: "fallback",
    model: null,
  };
}

export async function generateNarrative(guest: Guest, assignment: Assignment, language: NarrativeLanguage = "en"): Promise<Narrative> {
  const provider = getAiProvider();
  const user = `${userPrompt(guest, assignment)}\nWrite name, reading and description in ${LANGUAGE_NAMES[language]}. Keep "Velvique Añejo Cristalino" as is.`;
  try {
    const { text, model } = provider === "claude" ? await callClaude(SYSTEM_PROMPT, user) : await callNvidia(SYSTEM_PROMPT, user);
    const parsed = parseNarrative(text);
    if (!parsed) throw new Error("Narrative response was not valid JSON");
    if (mentionsForeignIngredient(`${parsed.name} ${parsed.description} ${parsed.reading}`, assignment)) {
      throw new Error("Narrative mentioned an ingredient outside the recipe");
    }
    return { ...parsed, reading: parsed.reading || fallbackNarrative(guest, assignment).reading, provider, model };
  } catch (error) {
    console.warn(`Velvique narrative (${provider}) fell back`, error instanceof Error ? error.message : error);
    return fallbackNarrative(guest, assignment);
  }
}
