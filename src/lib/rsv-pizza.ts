const API_BASE = "https://api.rsv.pizza";
const TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 10 * 60 * 1000;

export const RSV_PIZZA_SLUG = "mexicocity";
export const RSV_PIZZA_PUBLIC_URL = `https://rsv.pizza/${RSV_PIZZA_SLUG}`;

const HARDCODED_PIZZERIA_RANKINGS = [
  "custom-cda39d34-6d9c-4899-8a76-9b00e30e2ca5",
  "custom-160da090-1c42-47ff-8735-1fe7463d7bf2",
  "custom-be442900-0f9e-461d-b4e9-35faebaf2aa2",
];

export type RsvPizzaCoHost = {
  id: string;
  name: string;
  twitter?: string | null;
  website?: string | null;
  instagram?: string | null;
  avatar_url?: string | null;
  showOnEvent?: boolean;
};

export type RsvPizzaPizzeria = {
  id: string;
  name: string;
  address?: string;
  description?: string;
  url?: string;
};

export type RsvPizzaEvent = {
  id: string;
  name: string;
  customUrl: string;
  inviteCode: string;
  date: string;
  duration: number;
  timezone: string;
  address: string | null;
  venueName: string | null;
  latitude: number | null;
  longitude: number | null;
  eventImageUrl: string | null;
  description: string | null;
  hostName: string;
  guestCount: number;
  coHosts: RsvPizzaCoHost[];
  rsvpClosedAt: string | null;
  hideGuests: boolean;
  url: string;
  availableToppings: string[];
  availableBeverages: string[];
  availableDietaryOptions: string[];
  pizzaStyle: string | null;
  selectedPizzerias: RsvPizzaPizzeria[];
};

type CacheEntry = { value: RsvPizzaEvent; expiresAt: number };
const cache = new Map<string, CacheEntry>();

export type RsvPizzaSubmitOutcome =
  | { ok: true; status: number }
  | { ok: false; reason: "timeout" | "network" | "rate_limited" | "validation" | "server"; status?: number; message?: string };

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getRsvPizzaEvent(slug = RSV_PIZZA_SLUG): Promise<RsvPizzaEvent | null> {
  const now = Date.now();
  const cached = cache.get(slug);
  if (cached && cached.expiresAt > now) return cached.value;

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/events/${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" } },
      TIMEOUT_MS,
    );
    if (!res.ok) return cached?.value ?? null;
    const data = (await res.json()) as { event?: RsvPizzaEvent };
    if (!data?.event) return cached?.value ?? null;
    const value: RsvPizzaEvent = {
      ...data.event,
      url: `https://rsv.pizza/${slug}`,
      coHosts: Array.isArray(data.event.coHosts) ? data.event.coHosts.filter((c) => c?.showOnEvent !== false) : [],
    };
    cache.set(slug, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch {
    return cached?.value ?? null;
  }
}

export type RsvPizzaGuestPayload = {
  name: string;
  email: string;
  ethereumAddress?: string | null;
  mailingListOptIn?: boolean;
  dietaryRestrictions?: string[];
  likedToppings?: string[];
  dislikedToppings?: string[];
  likedBeverages?: string[];
  dislikedBeverages?: string[];
  pizzeriaRankings?: string[];
};

export async function submitRsvPizzaGuest(
  payload: RsvPizzaGuestPayload,
  slug = RSV_PIZZA_SLUG,
): Promise<RsvPizzaSubmitOutcome> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanName = payload.name.trim();
  if (!cleanName || !cleanEmail) {
    return { ok: false, reason: "validation", message: "name and email required" };
  }

  const body = {
    name: cleanName,
    email: cleanEmail,
    ethereumAddress: payload.ethereumAddress?.trim() || null,
    roles: [],
    mailingListOptIn: payload.mailingListOptIn ?? false,
    dietaryRestrictions: payload.dietaryRestrictions ?? [],
    likedToppings: payload.likedToppings ?? [],
    dislikedToppings: payload.dislikedToppings ?? [],
    likedBeverages: payload.likedBeverages ?? [],
    dislikedBeverages: payload.dislikedBeverages ?? [],
    pizzeriaRankings: payload.pizzeriaRankings ?? HARDCODED_PIZZERIA_RANKINGS,
    suggestedPizzerias: [],
    swcOptIn: false,
    swcCaOptIn: false,
    swcAuOptIn: false,
    swcEuOptIn: false,
    swcUkOptIn: false,
    ethconfOptIn: false,
  };

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/rsvp/${encodeURIComponent(slug)}/guest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      },
      TIMEOUT_MS,
    );

    if (res.ok) return { ok: true, status: res.status };
    if (res.status === 429) return { ok: false, reason: "rate_limited", status: 429 };
    if (res.status >= 400 && res.status < 500) {
      const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
      const msg = typeof body.error === "string" ? body.error : body.error?.message;
      return { ok: false, reason: "validation", status: res.status, message: msg };
    }
    return { ok: false, reason: "server", status: res.status };
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return { ok: false, reason: "timeout" };
    return { ok: false, reason: "network", message: (err as Error)?.message };
  }
}
