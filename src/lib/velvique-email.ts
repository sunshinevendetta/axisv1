import { brandLogoSrc, brandShell } from "./brand-email";
import { sendEmail } from "./velvique-brevo";

/* Guest emails sent through Brevo: the sign-up confirmation, the finished
   card, and the draw winner's contact sent to the AXIS team. */

const LOGO_URL = "https://axis.show/logow.png";
const PAGE_URL = "https://axis.show/velvique";

type Lang = "en" | "es" | "zh" | "zh-Hant";

const COPY: Record<Lang, {
  confirmSubject: string;
  confirmTitle: (name: string) => string;
  confirmBody: string;
  confirmDraw: string;
  cardSubject: (cardName: string) => string;
  cardTitle: (cardName: string) => string;
  cardBody: (number: number) => string;
  cardLink: string;
  signature: (hash: string) => string;
}> = {
  en: {
    confirmSubject: "You're in: Velvique at AXIS",
    confirmTitle: (name) => `You're in, ${name}`,
    confirmBody: "Your spot is confirmed. Go back to the page, answer the five questions and get your one-of-a-kind Velvique card.",
    confirmDraw: "Tonight at 10:30 pm we draw one guest for a free bottle of Velvique. If it's you, we'll reach you at this email or your phone.",
    cardSubject: (cardName) => `Your Velvique card: ${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `Card ${number}, made only for you. Show it at the bar to get your shot.`,
    cardLink: "Open your card",
    signature: (hash) => `Recipe signature ${hash}`,
  },
  es: {
    confirmSubject: "Ya estás dentro: Velvique en AXIS",
    confirmTitle: (name) => `Ya estás dentro, ${name}`,
    confirmBody: "Tu lugar está confirmado. Regresa a la página, responde las cinco preguntas y recibe tu carta única de Velvique.",
    confirmDraw: "Hoy a las 10:30 pm sorteamos una botella de Velvique entre los invitados. Si ganas, te buscamos en este correo o en tu teléfono.",
    cardSubject: (cardName) => `Tu carta Velvique: ${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `Carta ${number}, hecha solo para ti. Muéstrala en la barra para recibir tu shot.`,
    cardLink: "Abrir tu carta",
    signature: (hash) => `Firma de la receta ${hash}`,
  },
  zh: {
    confirmSubject: "报名成功：AXIS × Velvique",
    confirmTitle: (name) => `${name}，报名成功`,
    confirmBody: "你的名额已确认。回到页面，回答五个问题，领取你独一无二的 Velvique 卡片。",
    confirmDraw: "今晚 10:30 我们将抽出一位来宾赠送一瓶 Velvique。如果是你，我们会通过这个邮箱或你的电话联系你。",
    cardSubject: (cardName) => `你的 Velvique 卡片：${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `第 ${number} 张，只为你调制。在吧台出示即可领取你的 shot。`,
    cardLink: "打开你的卡片",
    signature: (hash) => `配方签名 ${hash}`,
  },
  "zh-Hant": {
    confirmSubject: "報名成功：AXIS × Velvique",
    confirmTitle: (name) => `${name}，報名成功`,
    confirmBody: "你的名額已確認。回到頁面，回答五個問題，領取你獨一無二的 Velvique 卡片。",
    confirmDraw: "今晚 10:30 我們將抽出一位來賓贈送一瓶 Velvique。如果是你，我們會透過這個信箱或你的電話聯絡你。",
    cardSubject: (cardName) => `你的 Velvique 卡片：${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `第 ${number} 張，只為你調製。在吧台出示即可領取你的 shot。`,
    cardLink: "打開你的卡片",
    signature: (hash) => `配方簽名 ${hash}`,
  },
};

function copyFor(lang: string) {
  return COPY[(lang in COPY ? lang : "en") as Lang];
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* The shared shell inlines the logo by cid for SMTP; the API needs a public URL. */
function shell(inner: string) {
  return brandShell(inner).split(brandLogoSrc()).join(LOGO_URL);
}

function block(title: string, lines: string[], extra = "") {
  return `<tr><td style="padding:10px 30px 30px;">
    <h1 style="margin:0 0 16px; font-size:24px; color:#fff;">${escapeHtml(title)}</h1>
    ${lines.map((line) => `<p style="margin:0 0 12px; font-size:15px; line-height:1.5; color:#ddd;">${escapeHtml(line)}</p>`).join("")}
    ${extra}
  </td></tr>`;
}

export async function sendConfirmation(guest: { email: string; name: string; lang: string }) {
  const t = copyFor(guest.lang);
  await sendEmail({
    to: guest.email,
    name: guest.name,
    subject: t.confirmSubject,
    html: shell(block(t.confirmTitle(guest.name), [t.confirmBody, t.confirmDraw])),
    text: [t.confirmTitle(guest.name), "", t.confirmBody, "", t.confirmDraw, "", PAGE_URL].join("\n"),
  });
}

export async function sendCard(guest: { email: string; name: string; lang: string }, card: { name: string; description: string; number: number; imageUrl: string; metadataUrl: string; signatureHash: string }) {
  const t = copyFor(guest.lang);
  const image = `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.name)}" width="320" style="display:block; width:100%; max-width:320px; height:auto; margin:8px auto 20px; border-radius:16px;"/>`;
  const link = `<p style="margin:20px 0 0;"><a href="${escapeHtml(card.imageUrl)}" style="color:#00d1ff; text-decoration:none;">${escapeHtml(t.cardLink)}</a></p>
    <p style="margin:12px 0 0; font-size:12px; color:#777;">${escapeHtml(t.signature(card.signatureHash.slice(0, 8)))}</p>`;
  await sendEmail({
    to: guest.email,
    name: guest.name,
    subject: t.cardSubject(card.name),
    html: shell(block(t.cardTitle(card.name), [t.cardBody(card.number), card.description, t.confirmDraw], `${image}${link}`)),
    text: [card.name, "", t.cardBody(card.number), card.description, "", t.confirmDraw, "", `${t.cardLink}: ${card.imageUrl}`, t.signature(card.signatureHash.slice(0, 8))].join("\n"),
  });
}

/* The winner's full contact goes only to the team inbox, never to the open bar screen. */
export async function sendWinnerToTeam(winner: { number: number; name: string; email: string; phone: string; entrants: number }) {
  const to = process.env.ADMIN_EMAIL?.trim() || "hello@axis.show";
  const lines = [`Card #${winner.number} of ${winner.entrants} entrants.`, `Name: ${winner.name || "(none)"}`, `Email: ${winner.email}`, `Phone: ${winner.phone || "(none)"}`];
  await sendEmail({
    to,
    subject: `Velvique bottle winner: ${winner.name || winner.email} (card #${winner.number})`,
    replyTo: winner.email,
    html: shell(block("Velvique bottle winner", lines)),
    text: ["Velvique bottle winner", "", ...lines].join("\n"),
  });
}
