import { isRecipeCode, type RecipeCode } from "./velvique-recipe-code";

/* Brevo is the Velvique guest list. Each guest is a Brevo contact in one
   list; the card they got is written back onto the contact. Only
   BREVO_API_KEY is needed: the list and its attributes are created on first
   use (VELVIQUE_BREVO_LIST_ID pins an existing list instead). */

const API = "https://api.brevo.com/v3";
const LIST_NAME = "Velvique AXIS 2026";
const ATTRIBUTES = ["VELVIQUE_NAME", "VELVIQUE_PHONE", "VELVIQUE_LANG", "VELVIQUE_RECIPE", "VELVIQUE_CARD", "VELVIQUE_AT"] as const;

export type VelviqueGuest = {
  email: string;
  name: string;
  phone: string;
  lang: string;
  recipe: RecipeCode | null;
  cardUrl: string | null;
  cardAt: string | null;
};

export function brevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

async function brevo<T>(path: string, init?: RequestInit & { allow?: number[] }): Promise<T | null> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) throw new Error("BREVO_API_KEY is not set");
  /* SMTP keys (xsmtpsib-) only work on the SMTP relay; the contacts API needs a v3 API key (xkeysib-). */
  if (apiKey.startsWith("xsmtpsib-")) throw new Error("BREVO_API_KEY holds an SMTP key. Create an API key (xkeysib-...) in Brevo under SMTP & API > API Keys.");
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "api-key": apiKey, accept: "application/json", "content-type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 204) return null;
  const text = await response.text();
  if (!response.ok && !init?.allow?.includes(response.status)) throw new Error(`Brevo ${path} failed with ${response.status}: ${text.slice(0, 200)}`);
  return text ? (JSON.parse(text) as T) : null;
}

/* Attributes must exist before a contact can carry them; "already exists" is fine. */
let attributesReady: Promise<void> | null = null;
function ensureAttributes() {
  attributesReady ??= Promise.all(
    ATTRIBUTES.map((name) => brevo(`/contacts/attributes/normal/${name}`, { method: "POST", body: JSON.stringify({ type: "text" }), allow: [400] })),
  )
    .then(() => undefined)
    .catch((error) => {
      attributesReady = null;
      throw error;
    });
  return attributesReady;
}

let listId: Promise<number> | null = null;
function getListId() {
  listId ??= (async () => {
    const pinned = Number(process.env.VELVIQUE_BREVO_LIST_ID?.trim());
    if (pinned > 0) return pinned;
    for (let offset = 0; offset < 1000; offset += 50) {
      const page = await brevo<{ lists?: Array<{ id: number; name: string }> }>(`/contacts/lists?limit=50&offset=${offset}`);
      const found = page?.lists?.find((list) => list.name === LIST_NAME);
      if (found) return found.id;
      if (!page?.lists || page.lists.length < 50) break;
    }
    const folders = await brevo<{ folders?: Array<{ id: number }> }>("/contacts/folders?limit=10&offset=0");
    const folderId =
      folders?.folders?.[0]?.id ?? (await brevo<{ id: number }>("/contacts/folders", { method: "POST", body: JSON.stringify({ name: "AXIS" }) }))!.id;
    const created = await brevo<{ id: number }>("/contacts/lists", { method: "POST", body: JSON.stringify({ name: LIST_NAME, folderId }) });
    return created!.id;
  })().catch((error) => {
    listId = null;
    throw error;
  });
  return listId;
}

export async function upsertGuest(guest: { email: string; name: string; phone: string; lang: string }) {
  await ensureAttributes();
  await brevo("/contacts", {
    method: "POST",
    body: JSON.stringify({
      email: guest.email,
      attributes: { VELVIQUE_NAME: guest.name, VELVIQUE_PHONE: guest.phone, VELVIQUE_LANG: guest.lang },
      listIds: [await getListId()],
      updateEnabled: true,
    }),
  });
}

export async function saveGuestCard(email: string, card: { recipe: RecipeCode; cardUrl: string; at: string }) {
  await ensureAttributes();
  await brevo(`/contacts/${encodeURIComponent(email)}?identifierType=email_id`, {
    method: "PUT",
    body: JSON.stringify({ attributes: { VELVIQUE_RECIPE: card.recipe, VELVIQUE_CARD: card.cardUrl, VELVIQUE_AT: card.at } }),
  });
}

type BrevoContact = { email?: string; attributes?: Record<string, unknown> };

function text(value: unknown) {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

export async function listGuests(): Promise<VelviqueGuest[]> {
  const id = await getListId();
  const guests: VelviqueGuest[] = [];
  for (let offset = 0; offset < 10000; offset += 500) {
    const page = await brevo<{ contacts?: BrevoContact[] }>(`/contacts/lists/${id}/contacts?limit=500&offset=${offset}`);
    const contacts = page?.contacts ?? [];
    for (const contact of contacts) {
      const a = contact.attributes ?? {};
      const recipe = text(a.VELVIQUE_RECIPE).toLowerCase();
      guests.push({
        email: (contact.email ?? "").toLowerCase(),
        name: text(a.VELVIQUE_NAME),
        phone: text(a.VELVIQUE_PHONE),
        lang: text(a.VELVIQUE_LANG) || "en",
        recipe: isRecipeCode(recipe) ? recipe : null,
        cardUrl: text(a.VELVIQUE_CARD) || null,
        cardAt: text(a.VELVIQUE_AT) || null,
      });
    }
    if (contacts.length < 500) break;
  }
  return guests;
}

export async function sendEmail(message: { to: string; name?: string; subject: string; html: string; text: string; replyTo?: string; bcc?: string[] }) {
  await brevo("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      sender: { name: "AXIS × Velvique", email: process.env.CUSTOM_FROM?.trim() || "rsvp@axis.show" },
      to: [{ email: message.to, ...(message.name ? { name: message.name } : {}) }],
      ...(message.bcc?.length ? { bcc: message.bcc.map((email) => ({ email })) } : {}),
      ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {}),
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    }),
  });
}

export function cleanEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

/* Any format a guest types; at least eight digits so the team can call them. */
export function cleanPhone(value: unknown) {
  if (typeof value !== "string") return null;
  const phone = value.replace(/[^\d+()\-. ]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return phone.replace(/\D/g, "").length >= 8 ? phone : null;
}

/* Printed on the card: letters in any script, spaces and simple punctuation, 24 characters at most. */
export function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/[^\p{L}\p{M}\p{N} .'\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return name || null;
}
