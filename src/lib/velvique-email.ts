import { VELVIQUE_COPY } from "@/components/velvique/velvique-i18n";
import { sendEmail } from "./velvique-brevo";
import { GROVE_ASSETS, recipeRows } from "./velvique-page";
import type { CodeComponent } from "./velvique-recipe-code";

/* Emails sent through Brevo: each guest gets one, with their finished card,
   recipe and the draw; the draw winner's contact goes to the AXIS team. They carry the
   event page's look: black, AXIS × Velvique lockup, Agura uppercase
   headlines over Bingo, hairlines, white pill buttons. Images are PNG and
   absolute so every mail client shows them. */

const SITE = "https://axis.show";
/* Images and fonts live on Grove, so emails never depend on a site deploy. */
const AXIS_LOGO = GROVE_ASSETS.axisLogo;
const VELVIQUE_LOGO = GROVE_ASSETS.velviqueLogo;
const BOTTLE = GROVE_ASSETS.bottle;
const BODY_FONT = "'Bingo', Arial, Helvetica, sans-serif";
const DISPLAY_FONT = "'Agura', 'Bingo', Arial, Helvetica, sans-serif";

type Lang = "en" | "es" | "zh" | "zh-Hant";

const COPY: Record<Lang, {
  drawText: string;
  cardSubject: (cardName: string) => string;
  cardTitle: (cardName: string) => string;
  cardBody: (number: number) => string;
  cardLink: string;
  signature: (hash: string) => string;
  kicker: string;
  drawLabel: string;
  footer: string;
}> = {
  en: {
    drawText: "Tonight at 10:30 pm we draw one guest for a free bottle of Velvique. If it's you, we'll reach you at this email or your phone.",
    cardSubject: (cardName) => `Your Velvique card: ${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `Card ${number}, made only for you. Show it at the bar to get your shot.`,
    cardLink: "Open your card",
    signature: (hash) => `Recipe signature ${hash}`,
    kicker: "AI Mixology · Añejo Cristalino",
    drawLabel: "Tonight · 10:30 pm",
    footer: "Produced by AXIS",
  },
  es: {
    drawText: "Hoy a las 10:30 pm sorteamos una botella de Velvique entre los invitados. Si ganas, te buscamos en este correo o en tu teléfono.",
    cardSubject: (cardName) => `Tu carta Velvique: ${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `Carta ${number}, hecha solo para ti. Muéstrala en la barra para recibir tu shot.`,
    cardLink: "Abrir tu carta",
    signature: (hash) => `Firma de la receta ${hash}`,
    kicker: "Mixología con IA · Añejo Cristalino",
    drawLabel: "Hoy · 10:30 pm",
    footer: "Producido por AXIS",
  },
  zh: {
    drawText: "今晚 10:30 我们将抽出一位来宾赠送一瓶 Velvique。如果是你，我们会通过这个邮箱或你的电话联系你。",
    cardSubject: (cardName) => `你的 Velvique 卡片：${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `第 ${number} 张，只为你调制。在吧台出示即可领取你的 shot。`,
    cardLink: "打开你的卡片",
    signature: (hash) => `配方签名 ${hash}`,
    kicker: "AI 调酒 · Añejo Cristalino",
    drawLabel: "今晚 · 10:30",
    footer: "AXIS 出品",
  },
  "zh-Hant": {
    drawText: "今晚 10:30 我們將抽出一位來賓贈送一瓶 Velvique。如果是你，我們會透過這個信箱或你的電話聯絡你。",
    cardSubject: (cardName) => `你的 Velvique 卡片：${cardName}`,
    cardTitle: (cardName) => cardName,
    cardBody: (number) => `第 ${number} 張，只為你調製。在吧台出示即可領取你的 shot。`,
    cardLink: "打開你的卡片",
    signature: (hash) => `配方簽名 ${hash}`,
    kicker: "AI 調酒 · Añejo Cristalino",
    drawLabel: "今晚 · 10:30",
    footer: "AXIS 出品",
  },
};


function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

type Layout = {
  lang: string;
  preheader: string;
  hero: string;
  kicker: string;
  title: string;
  lines: string[];
  recipe?: { title: string; rows: Array<[string, string]>; garnish: string | null };
  draw?: { label: string; text: string };
  button?: { label: string; href: string };
  note?: string;
  footer: string;
};

const para = (text: string) =>
  `<p style="margin:0 0 14px; font-family:${BODY_FONT}; font-size:15px; line-height:1.55; color:#bdbdbd;">${escapeHtml(text)}</p>`;

const meta = (text: string, style = "") =>
  `<p style="margin:0; font-family:${BODY_FONT}; font-size:11px; line-height:1.4; letter-spacing:0.14em; text-transform:uppercase; color:#808080; ${style}">${escapeHtml(text)}</p>`;

function pill(label: string, href: string) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:26px auto 0;">
    <tr><td align="center" bgcolor="#ffffff" style="border-radius:999px;">
      <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block; padding:14px 28px; font-family:${BODY_FONT}; font-size:13px; line-height:1; letter-spacing:0.08em; text-transform:uppercase; color:#000000; text-decoration:none; border-radius:999px;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

function render(layout: Layout) {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(layout.lang)}"><head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<style>
  @font-face { font-family: "Agura"; src: url("${GROVE_ASSETS.agura}") format("woff2"); font-weight: 400; font-style: normal; }
  @font-face { font-family: "Bingo"; src: url("${GROVE_ASSETS.bingo}") format("woff2"); font-weight: 400; font-style: normal; }
  body { margin: 0; padding: 0; background: #000000; }
  a { color: #ffffff; }
  @media (max-width: 620px) { .vq-pad { padding-left: 18px !important; padding-right: 18px !important; } .vq-h1 { font-size: 18px !important; } }
</style>
</head>
<body style="margin:0; padding:0; background:#000000; color:#ffffff;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#000000;">${escapeHtml(layout.preheader)}</div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#000000" style="background:#000000;">
    <tr><td align="center" style="padding:28px 12px 40px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
        <tr><td align="center" style="padding:0 0 22px; border-bottom:1px solid #1f1f1f;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><tr>
            <td valign="middle"><img src="${AXIS_LOGO}" alt="AXIS" width="70" style="display:block; width:70px; height:auto; border:0;"/></td>
            <td valign="middle" style="padding:0 14px; font-family:${BODY_FONT}; font-size:16px; color:#808080;">×</td>
            <td valign="middle"><img src="${VELVIQUE_LOGO}" alt="Velvique" width="150" style="display:block; width:150px; height:auto; border:0;"/></td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding:34px 0 8px;">${layout.hero}</td></tr>
        <tr><td class="vq-pad" align="center" style="padding:18px 36px 0;">
          ${meta(layout.kicker)}
          <h1 class="vq-h1" style="margin:14px 0 20px; font-family:${DISPLAY_FONT}; font-size:24px; font-weight:400; line-height:1.08; text-transform:uppercase; overflow-wrap:anywhere; word-break:break-word; color:#ffffff;">${escapeHtml(layout.title)}</h1>
          ${layout.lines.map(para).join("")}
          ${
            layout.recipe
              ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0 0; border:1px solid #262626; border-radius:18px; background:#0b0b0b;">
                  <tr><td style="padding:18px 22px 6px;">${meta(layout.recipe.title, "color:#ffffff; text-align:left;")}</td></tr>
                  ${layout.recipe.rows
                    .map(
                      ([name, amount]) => `<tr><td style="padding:0 22px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid #1f1f1f;"><tr>
                          <td align="left" style="padding:12px 0; font-family:${BODY_FONT}; font-size:15px; line-height:1.3; color:#ffffff;">${escapeHtml(name)}</td>
                          <td align="right" style="padding:12px 0 12px 12px; font-family:${BODY_FONT}; font-size:15px; line-height:1.3; color:#bdbdbd; white-space:nowrap;">${escapeHtml(amount)}</td>
                        </tr></table>
                      </td></tr>`,
                    )
                    .join("")}
                  <tr><td style="padding:12px 22px 18px;">${
                    layout.recipe.garnish
                      ? `<p style="margin:0; font-family:${BODY_FONT}; font-size:14px; line-height:1.5; color:#bdbdbd; text-align:left;">${escapeHtml(layout.recipe.garnish)}</p>`
                      : ""
                  }</td></tr>
                </table>`
              : ""
          }
          ${
            layout.draw
              ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0 0; border:1px solid #262626; border-radius:18px; background:#0b0b0b;">
                  <tr><td align="center" style="padding:18px 20px;">
                    ${meta(layout.draw.label, "color:#ffffff;")}
                    <p style="margin:8px 0 0; font-family:${BODY_FONT}; font-size:14px; line-height:1.5; color:#bdbdbd;">${escapeHtml(layout.draw.text)}</p>
                  </td></tr>
                </table>`
              : ""
          }
          ${layout.button ? pill(layout.button.label, layout.button.href) : ""}
          ${layout.note ? meta(layout.note, "margin-top:22px; letter-spacing:0.08em;") : ""}
        </td></tr>
        <tr><td align="center" style="padding:40px 0 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top:1px solid #1f1f1f; font-size:0; line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:22px 0 0; font-family:${BODY_FONT}; font-size:12px; color:#808080;">AXIS × Velvique · ${escapeHtml(layout.footer)}</p>
          <p style="margin:8px 0 0; font-family:${BODY_FONT}; font-size:12px;"><a href="${SITE}" style="color:#ffffff; text-decoration:none;">axis.show</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const bottleHero = `<img src="${BOTTLE}" alt="Velvique Añejo Cristalino" width="150" style="display:block; width:150px; height:auto; margin:0 auto; border:0;"/>`;

type EmailCard = { name: string; description: string; number: number; imageUrl: string; pageUrl: string; signatureHash: string; components: CodeComponent[]; garnishId: string | null };

export function cardEmail(guest: { name: string; lang: string }, card: EmailCard) {
  const lang = (guest.lang in COPY ? guest.lang : "en") as Lang;
  const t = COPY[lang];
  const recipe = recipeRows(lang, card.components, card.garnishId);
  const hero = `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.name)}" width="300" style="display:block; width:100%; max-width:300px; height:auto; margin:0 auto; border:1px solid #262626; border-radius:18px;"/>`;
  return {
    subject: t.cardSubject(card.name),
    html: render({
      lang: guest.lang,
      preheader: t.cardBody(card.number),
      hero,
      kicker: [VELVIQUE_COPY[lang].cardOf(card.number), guest.name ? VELVIQUE_COPY[lang].madeFor(guest.name) : ""].filter(Boolean).join(" · "),
      title: t.cardTitle(card.name),
      lines: [t.cardBody(card.number), card.description],
      recipe,
      draw: { label: t.drawLabel, text: t.drawText },
      button: { label: t.cardLink, href: card.pageUrl },
      note: t.signature(card.signatureHash.slice(0, 8)),
      footer: t.footer,
    }),
    text: [
      card.name,
      "",
      t.cardBody(card.number),
      card.description,
      "",
      `${recipe.title}:`,
      ...recipe.rows.map(([name, amount]) => `  ${name}  ${amount}`),
      ...(recipe.garnish ? [recipe.garnish] : []),
      "",
      `${t.drawLabel}: ${t.drawText}`,
      "",
      `${t.cardLink}: ${card.pageUrl}`,
      t.signature(card.signatureHash.slice(0, 8)),
    ].join("\n"),
  };
}

export async function sendCard(guest: { email: string; name: string; lang: string }, card: EmailCard) {
  await sendEmail({ to: guest.email, name: guest.name, ...cardEmail(guest, card) });
}

/* The winner's full contact goes only to the team inbox, never to the open bar screen. */
export async function sendWinnerToTeam(winner: { number: number; name: string; email: string; phone: string; entrants: number }) {
  const to = process.env.ADMIN_EMAIL?.trim() || "hello@axis.show";
  const lines = [`Card #${winner.number} of ${winner.entrants} entrants.`, `Name: ${winner.name || "(none)"}`, `Email: ${winner.email}`, `Phone: ${winner.phone || "(none)"}`];
  await sendEmail({
    to,
    subject: `Velvique bottle winner: ${winner.name || winner.email} (card #${winner.number})`,
    replyTo: winner.email,
    html: render({ lang: "en", preheader: lines.join(" · "), hero: bottleHero, kicker: "Free bottle draw", title: "We have a winner", lines, button: { label: `Email ${winner.name || "the winner"}`, href: `mailto:${winner.email}` }, footer: "Produced by AXIS" }),
    text: ["Velvique bottle winner", "", ...lines].join("\n"),
  });
}
