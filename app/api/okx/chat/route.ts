import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type IncomingMessage = {
  role?: string;
  content?: string;
};

type ChatBody = {
  lang?: "es" | "en";
  messages?: IncomingMessage[];
};

type CleanMessage = {
  role: "user";
  content: string;
};

type ChatCompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const fallbackAnswers = {
  es:
    "Hazlo en este orden: 1) cuenta + KYC, 2) encuentra tu UID y muestralo al staff, 3) entra a Outcomes o fondea si vas por mas bebidas. Si una pantalla no carga, no te atores: ve con el staff de OKX.",
  en:
    "Do it in this order: 1) account + KYC, 2) find your UID and show staff, 3) enter Outcomes or fund if you want more drinks. If a screen does not load, do not get stuck: go to OKX staff.",
};

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "nvidia/llama-3.1-nemotron-nano-8b-v1";

function cleanModelText(text: string) {
  return text
    .replace(/`/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function requestChatCompletion({
  apiKey,
  baseUrl,
  model,
  messages,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: Array<{ role: "system" | "user"; content: string }>;
}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(9000),
    body: JSON.stringify({
      model,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 520,
      stream: false,
      messages,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ChatCompletionPayload;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Chat provider failed with ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Chat provider returned an empty response");
  return cleanModelText(content);
}

function getSystemPrompt(soul: string, lang: "es" | "en") {
  return [
    soul,
    `Current page language: ${lang}.`,
    "Answer in the current page language.",
    "Return only the helpful answer for the attendee.",
    "You may use simple markdown headings and bold for readability. Do not use code formatting or tables.",
    "Use short plain paragraphs or numbered steps. Keep it under 220 words unless the user asks for detail.",
  ].join("\n\n");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ChatBody;
  const lang = body.lang === "en" ? "en" : "es";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const cleanMessages: CleanMessage[] = messages
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => ({
      role: "user",
      content: String(message.content || "").slice(0, 900),
    }));

  const soul = await readFile(path.join(process.cwd(), "app/api/okx/chat/soul.md"), "utf8")
    .catch(() => "");

  const providerMessages = [
    { role: "system" as const, content: getSystemPrompt(soul, lang) },
    ...cleanMessages,
  ];

  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
  const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_BASE_URL;
  const nvidiaModel = process.env.NVIDIA_MODEL?.trim() || NVIDIA_MODEL;

  if (nvidiaKey) {
    try {
      const message = await requestChatCompletion({
        apiKey: nvidiaKey,
        baseUrl: nvidiaBaseUrl,
        model: nvidiaModel,
        messages: providerMessages,
      });
      return NextResponse.json({ message, source: "nvidia", model: nvidiaModel });
    } catch {
      // Fall through to the local safety fallback.
    }
  }

  return NextResponse.json({ message: fallbackAnswers[lang], source: "fallback" });
}
