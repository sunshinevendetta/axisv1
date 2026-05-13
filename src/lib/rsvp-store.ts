import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/src/lib/json-store";
import defaultSlots from "@/src/content/rsvp-default-slots.json";

export type MainTicketStatus = "sent" | "failed" | "pending";

export type Attendee = {
  name: string;
  email: string;
  createdAt: string;
  mainTicket?: MainTicketStatus;
  mainTicketReason?: string;
  mainTicketAt?: string;
};

export type RsvpSlot = {
  time: string;
  status: "open" | "locked";
  community?: string;
  rsvpId?: string;
  attendees?: Attendee[];
  logoUrl?: string;
  topic?: string;
  topicEs?: string;
  notes?: string;
  notesEs?: string;
  hostDisplayName?: string;
  link?: string;
  language?: "english" | "spanish" | "bilingual";
};

export type RsvpDecision = "pending" | "approved" | "rejected";

export type RsvpEntry = {
  id: string;
  type: "rsvp" | "waitlist";
  communityName: string;
  email: string;
  topic: string;
  language: string;
  notes: string;
  slot: string;
  logoFilename?: string;
  logoUrl?: string;
  createdAt: string;
  decision?: RsvpDecision;
  decidedAt?: string;
  attendees?: Attendee[];
};

export type RsvpStoreData = {
  slots: RsvpSlot[];
  rsvps: RsvpEntry[];
};

const RSVP_STORE_PATH = path.join(process.cwd(), "data", "admin", "rsvp.json");

const DEFAULT_SLOTS = defaultSlots as RsvpSlot[];

function isStore(value: unknown): value is RsvpStoreData {
  return Boolean(value) && typeof value === "object" && "slots" in (value as Record<string, unknown>);
}

export async function readRsvpStore(): Promise<RsvpStoreData> {
  return readJsonFile<RsvpStoreData>(RSVP_STORE_PATH, {
    fallback: { slots: DEFAULT_SLOTS, rsvps: [] },
    validate: isStore,
  });
}

export async function writeRsvpStore(data: RsvpStoreData): Promise<void> {
  await writeJsonFile(RSVP_STORE_PATH, data);
}

export async function appendRsvp(entry: RsvpEntry): Promise<RsvpStoreData> {
  const data = await readRsvpStore();
  data.rsvps.unshift(entry);
  await writeRsvpStore(data);
  return data;
}

export async function setRsvpDecision(
  id: string,
  decision: RsvpDecision,
): Promise<{ data: RsvpStoreData; entry: RsvpEntry }> {
  const data = await readRsvpStore();
  const entry = data.rsvps.find((r) => r.id === id);
  if (!entry) throw new Error(`RSVP not found: ${id}`);
  entry.decision = decision;
  entry.decidedAt = new Date().toISOString();

  if (decision === "approved" && entry.slot && entry.slot !== "WAITLIST") {
    const slot = data.slots.find((s) => s.time === entry.slot);
    if (slot) {
      slot.status = "locked";
      slot.community = entry.communityName;
      slot.rsvpId = entry.id;
    }
  }
  if (decision === "rejected") {
    const slot = data.slots.find((s) => s.rsvpId === entry.id);
    if (slot) {
      slot.status = "open";
      slot.community = undefined;
      slot.rsvpId = undefined;
    }
  }

  await writeRsvpStore(data);
  return { data, entry };
}

export async function setSlotStatus(
  time: string,
  patch: { status?: "open" | "locked"; community?: string | null; rsvpId?: string | null },
): Promise<RsvpStoreData> {
  const data = await readRsvpStore();
  const slot = data.slots.find((s) => s.time === time);
  if (!slot) throw new Error(`Slot not found: ${time}`);
  if (patch.status) slot.status = patch.status;
  if (patch.community !== undefined) slot.community = patch.community ?? undefined;
  if (patch.rsvpId !== undefined) slot.rsvpId = patch.rsvpId ?? undefined;
  await writeRsvpStore(data);
  return data;
}

export function publicSlots(slots: RsvpSlot[]) {
  return slots.map((s) => ({
    time: s.time,
    status: s.status,
    community: s.status === "locked" ? s.community ?? "Reserved" : undefined,
    rsvpId: s.status === "locked" ? s.rsvpId : undefined,
    attendeeCount: s.status === "locked" ? s.attendees?.length ?? 0 : undefined,
  }));
}

export async function appendAttendeeToRsvp(
  rsvpId: string,
  attendee: Attendee,
  cap = 15,
): Promise<{ count: number }> {
  const data = await readRsvpStore();
  const entry = data.rsvps.find((r) => r.id === rsvpId);
  if (!entry) throw new Error(`RSVP not found: ${rsvpId}`);
  if (!entry.attendees) entry.attendees = [];
  if (entry.attendees.some((a) => a.email.toLowerCase() === attendee.email.toLowerCase())) {
    return { count: entry.attendees.length };
  }
  if (entry.attendees.length >= cap) {
    const err = new Error("This slot is full.") as Error & { code?: string };
    err.code = "FULL";
    throw err;
  }
  entry.attendees.push(attendee);
  await writeRsvpStore(data);
  return { count: entry.attendees.length };
}

export async function appendAttendeeToSlot(
  slotTime: string,
  attendee: Attendee,
  cap = 15,
): Promise<{ count: number }> {
  const data = await readRsvpStore();
  const slot = data.slots.find((s) => s.time === slotTime);
  if (!slot) throw new Error(`Slot not found: ${slotTime}`);
  if (slot.status !== "locked") throw new Error("Slot is not locked.");
  if (!slot.attendees) slot.attendees = [];
  if (slot.attendees.some((a) => a.email.toLowerCase() === attendee.email.toLowerCase())) {
    return { count: slot.attendees.length };
  }
  if (slot.attendees.length >= cap) {
    const err = new Error("This slot is full.") as Error & { code?: string };
    err.code = "FULL";
    throw err;
  }
  slot.attendees.push(attendee);

  if (slot.rsvpId) {
    const entry = data.rsvps.find((r) => r.id === slot.rsvpId);
    if (entry) {
      if (!entry.attendees) entry.attendees = [];
      if (!entry.attendees.some((a) => a.email.toLowerCase() === attendee.email.toLowerCase())) {
        entry.attendees.push(attendee);
      }
    }
  }

  await writeRsvpStore(data);
  return { count: slot.attendees.length };
}

export async function updateAttendeeMainTicket(
  slotTime: string,
  email: string,
  patch: { status: MainTicketStatus; reason?: string },
): Promise<void> {
  const data = await readRsvpStore();
  const lower = email.toLowerCase();
  const slot = data.slots.find((s) => s.time === slotTime);
  if (slot?.attendees) {
    const a = slot.attendees.find((x) => x.email.toLowerCase() === lower);
    if (a) {
      a.mainTicket = patch.status;
      a.mainTicketReason = patch.reason;
      a.mainTicketAt = new Date().toISOString();
    }
  }
  if (slot?.rsvpId) {
    const entry = data.rsvps.find((r) => r.id === slot.rsvpId);
    const a = entry?.attendees?.find((x) => x.email.toLowerCase() === lower);
    if (a) {
      a.mainTicket = patch.status;
      a.mainTicketReason = patch.reason;
      a.mainTicketAt = new Date().toISOString();
    }
  }
  await writeRsvpStore(data);
}

export async function findAttendee(
  slotTime: string,
  email: string,
): Promise<Attendee | null> {
  const data = await readRsvpStore();
  const lower = email.toLowerCase();
  const slot = data.slots.find((s) => s.time === slotTime);
  return slot?.attendees?.find((x) => x.email.toLowerCase() === lower) ?? null;
}

export type SlotCard = {
  slot: string;
  communityName: string;
  topic: string;
  notes: string;
  language: string;
  logoUrl: string | null;
  link: string | null;
  attendeeCount: number;
  rsvpId: string | null;
};

function detectLink(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

export function buildSlotCard(slot: RsvpSlot, entry?: RsvpEntry): SlotCard {
  if (entry) {
    return {
      slot: slot.time,
      communityName: entry.communityName,
      topic: entry.topic,
      notes: entry.notes,
      language: entry.language,
      logoUrl: entry.logoUrl ?? slot.logoUrl ?? null,
      link: detectLink(entry.communityName) ?? detectLink(entry.notes),
      attendeeCount: (slot.attendees?.length ?? entry.attendees?.length) ?? 0,
      rsvpId: entry.id,
    };
  }
  const community = slot.community ?? "Reserved";
  const detectedLink = detectLink(community);
  const link = slot.link ?? detectedLink;
  const hostName =
    slot.hostDisplayName ??
    (detectedLink ? new URL(detectedLink).hostname.replace(/^www\./, "") : community);
  if (slot.topic || slot.notes) {
    const topicParts = [slot.topic, slot.topicEs].filter(Boolean) as string[];
    const noteParts = [slot.notes, slot.notesEs].filter(Boolean) as string[];
    return {
      slot: slot.time,
      communityName: hostName,
      topic: topicParts.join(" · ") || `Hosted by ${hostName}`,
      notes: noteParts.join("\n\n") || "",
      language: slot.language ?? "english",
      logoUrl: slot.logoUrl ?? null,
      link,
      attendeeCount: slot.attendees?.length ?? 0,
      rsvpId: null,
    };
  }
  return {
    slot: slot.time,
    communityName: hostName,
    topic: link ? `Hosted by ${new URL(link).hostname.replace(/^www\./, "")}` : community,
    notes: link
      ? `This hour is hosted by ${community}. Visit their site to learn more.`
      : "This slot is reserved.",
    language: "english",
    logoUrl: slot.logoUrl ?? null,
    link,
    attendeeCount: slot.attendees?.length ?? 0,
    rsvpId: null,
  };
}
