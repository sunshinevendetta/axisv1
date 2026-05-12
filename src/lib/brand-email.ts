import fs from "node:fs";
import path from "node:path";

const LOGO_CID = "axis-logo-w";

let cachedLogo: Buffer | null = null;

function loadLogo(): Buffer {
  if (cachedLogo) return cachedLogo;
  const filePath = path.join(process.cwd(), "public", "logow.png");
  cachedLogo = fs.readFileSync(filePath);
  return cachedLogo;
}

export function brandLogoAttachment() {
  return {
    filename: "axis-logo.png",
    content: loadLogo(),
    contentType: "image/png",
    cid: LOGO_CID,
    contentDisposition: "inline" as const,
  };
}

export function brandLogoSrc(): string {
  return `cid:${LOGO_CID}`;
}

/**
 * Replace every kind of dash (hyphen, en dash, em dash, minus, etc.)
 * with the word "a" (Spanish/English friendly when used between times,
 * e.g. "3:00 PM a 4:00 PM"). Intended for short user-supplied strings
 * like slot times. For longer prose use stripDashesGeneric().
 */
export function dashToA(input: string): string {
  return input.replace(/\s*[‐‑‒–—―−-]+\s*/g, " a ");
}

/** Strip all dash characters and collapse extra whitespace. */
export function stripDashes(input: string): string {
  return input
    .replace(/[‐‑‒–—―−-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function divider(): string {
  return `<tr><td style="padding:8px 30px;"><div style="height:1px; background:linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent);"></div></td></tr>`;
}

export function langTag(label: string): string {
  return `<tr><td style="padding:0 30px 6px; text-align:center;">
    <span style="display:inline-block; padding:3px 10px; border:1px solid rgba(255,255,255,0.15); border-radius:999px; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.55);">${label}</span>
  </td></tr>`;
}

/**
 * Bilingual brand shell. spanishHtml comes first (top), englishHtml below.
 * Each side should be a sequence of <tr><td>…</td></tr> rows.
 */
export function brandShellBilingual(spanishHtml: string, englishHtml: string): string {
  const logoSrc = brandLogoSrc();
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#000; color:#fff;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#000;">
    <tr><td align="center" style="padding:40px 0 20px;">
      <img src="${logoSrc}" alt="AXIS" width="160" style="display:block; max-width:160px; height:auto;"/>
    </td></tr>
    ${langTag("Español")}
    ${spanishHtml}
    ${divider()}
    ${langTag("English")}
    ${englishHtml}
    <tr><td align="center" style="padding:30px; font-size:12px; color:#777; border-top:1px solid #222;">
      <img src="${logoSrc}" alt="AXIS" width="80" style="display:block; margin:0 auto 10px; max-width:80px; height:auto; opacity:0.7;"/>
      <p style="margin:0;">Experiencias de arte inesperadas · Unexpected Art Experiences Worldwide</p>
      <p style="margin:8px 0 0;"><a href="https://axis.show" style="color:#00d1ff; text-decoration:none;">axis.show</a></p>
    </td></tr>
  </table>
</body></html>`;
}

/** Single-language shell, used for the manual free-form composer. */
export function brandShell(innerHtml: string): string {
  const logoSrc = brandLogoSrc();
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#000; color:#fff;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#000;">
    <tr><td align="center" style="padding:40px 0 20px;">
      <img src="${logoSrc}" alt="AXIS" width="160" style="display:block; max-width:160px; height:auto;"/>
    </td></tr>
    ${innerHtml}
    <tr><td align="center" style="padding:30px; font-size:12px; color:#777; border-top:1px solid #222;">
      <img src="${logoSrc}" alt="AXIS" width="80" style="display:block; margin:0 auto 10px; max-width:80px; height:auto; opacity:0.7;"/>
      <p style="margin:0;">Unexpected Art Experiences Worldwide</p>
      <p style="margin:8px 0 0;"><a href="https://axis.show" style="color:#00d1ff; text-decoration:none;">axis.show</a></p>
    </td></tr>
  </table>
</body></html>`;
}
