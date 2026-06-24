import { NextResponse } from "next/server";
import { OKX_PETRA_SOUL_VERSION, okxPetraSoul } from "./soul";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = {
  role?: string;
  content?: string;
};

type ChatBody = {
  lang?: "es" | "en" | "zh" | "ja" | "ko" | "fr";
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
  zh: "按这个顺序：1）创建 OKX 账户并完成身份验证，2）找到 UID，3）参加 Outcomes 或入金。卡住就找 OKX 工作人员。",
  ja: "順番は、1）OKXアカウント作成と本人確認、2）UID確認、3）Outcomes参加または入金。困ったらOKXスタッフへ。",
  ko: "순서: 1) OKX 계정 생성과 KYC, 2) UID 확인, 3) Outcomes 참여 또는 충전. 막히면 OKX 직원에게 가세요.",
  fr: "Dans l'ordre : 1) cree ton compte OKX et verifie ton identite, 2) trouve ton UID, 3) fais Outcomes ou le depot. Si ca bloque, va voir le staff OKX.",
};

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
const HERMES_AGENT_NAME = "AXIS Petra Voss Hermes";

function cleanModelText(text: string) {
  const cleaned = text
    .replace(/`/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned
    .replace(/^["“”]+/, "")
    .replace(/["“”]+$/, "")
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

function getSystemPrompt(soul: string, lang: NonNullable<ChatBody["lang"]>) {
  return [
    soul,
    `Agent name: ${HERMES_AGENT_NAME}.`,
    `Soul version: ${OKX_PETRA_SOUL_VERSION}.`,
    `Current page language: ${lang}.`,
    "Production guardrail: answer only from the soul and tonight's OKX drink mission context.",
    "If the user asks a broad OKX question, immediately tie it back to the drink missions, UID, Outcomes, funding, QR, AR photo, or OKX staff validation.",
    "Return only the helpful answer for the attendee. No preamble, no disclaimers unless needed by the soul.",
    "Do not wrap the answer in quotation marks.",
    "Use plain text or a tiny numbered list. No tables. Keep it under 90 words unless the user asks for detail.",
  ].join("\n\n");
}

function buildHermesUserPrompt(cleanMessages: CleanMessage[], lang: NonNullable<ChatBody["lang"]>) {
  const recent = cleanMessages.length
    ? cleanMessages.map((message, index) => `${index + 1}. ${message.content}`).join("\n")
    : "1. What do I do?";

  return [
    `Current page language: ${lang}.`,
    "Recent attendee messages:",
    recent,
    "",
    "Reply as Petra Voss now. Use only the AXIS / Bar Oriente OKX mission facts in the soul. Give the next useful action.",
  ].join("\n");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ChatBody;
  const lang: NonNullable<ChatBody["lang"]> =
    body.lang === "en" ||
    body.lang === "zh" ||
    body.lang === "ja" ||
    body.lang === "ko" ||
    body.lang === "fr"
      ? body.lang
      : "es";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const cleanMessages: CleanMessage[] = messages
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => ({
      role: "user",
      content: String(message.content || "").slice(0, 900),
    }));

  const providerMessages = [
    { role: "system" as const, content: getSystemPrompt(okxPetraSoul, lang) },
    { role: "user" as const, content: buildHermesUserPrompt(cleanMessages, lang) },
  ];

  const nvidiaKey =
    process.env.NVIDIA_API_KEY?.trim() ||
    process.env.NVIDIA_BUILD_API_KEY?.trim() ||
    process.env.NVAPI_KEY?.trim();
  const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL?.trim() || NVIDIA_BASE_URL;
  const nvidiaModel = process.env.NVIDIA_MODEL?.trim() || NVIDIA_MODEL;

  if (nvidiaKey) {
    try {
      console.info("OKX Petra Hermes NVIDIA request", {
        agent: HERMES_AGENT_NAME,
        source: "nvidia-build",
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        soulChars: okxPetraSoul.length,
        userMessages: cleanMessages.length,
      });
      const message = await requestChatCompletion({
        apiKey: nvidiaKey,
        baseUrl: nvidiaBaseUrl,
        model: nvidiaModel,
        messages: providerMessages,
      });
      console.info("OKX Petra Hermes NVIDIA success", {
        agent: HERMES_AGENT_NAME,
        source: "nvidia-build",
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        answerChars: message.length,
      });
      return NextResponse.json({
        message,
        source: "nvidia-build-hermes",
        model: nvidiaModel,
        soulVersion: OKX_PETRA_SOUL_VERSION,
      });
    } catch (error) {
      console.error("OKX Petra Hermes NVIDIA failed", {
        agent: HERMES_AGENT_NAME,
        model: nvidiaModel,
        lang,
        soulVersion: OKX_PETRA_SOUL_VERSION,
        error: error instanceof Error ? error.message : String(error),
      });
      // Fall through to the local safety fallback.
    }
  }

  console.warn("OKX Petra Hermes fallback", {
    agent: HERMES_AGENT_NAME,
    lang,
    hasNvidiaKey: Boolean(nvidiaKey),
    soulVersion: OKX_PETRA_SOUL_VERSION,
  });
  return NextResponse.json({
    message: fallbackAnswers[lang],
    source: "fallback-hermes",
    soulVersion: OKX_PETRA_SOUL_VERSION,
  });
}
