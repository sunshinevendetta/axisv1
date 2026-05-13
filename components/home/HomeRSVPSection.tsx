"use client";

import defaultTimeSlotsData from "@/src/content/rsvp-default-slots.json";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import LockedSlotModal from "@/components/home/LockedSlotModal";

type SlotStatus = "open" | "locked";

type TimeSlot = {
  time: string;
  status: SlotStatus;
  community?: string;
  rsvpId?: string;
};

const defaultTimeSlots = defaultTimeSlotsData as TimeSlot[];

const carouselImages = [
  { src: "/pizzadao/pizzadaoflyer.webp", alt: "Pizza DAO party flyer" },
  { src: "/pizzadao/berlin1.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin2.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin3.webp", alt: "Berlin community gathering" },
];

const inclusions = [
  "Pizza included for your hour",
  "Big shared table, seats up to 15",
  "Logo on flyer + socials",
];

export default function HomeRSVPSection() {
  const timeSlots = defaultTimeSlots;
  const allSoldOut = timeSlots.every((s) => s.status === "locked");

  const [communityName, setCommunityName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [logoName, setLogoName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [language, setLanguage] = useState<"english" | "spanish">("english");

  const [openLockedSlot, setOpenLockedSlot] = useState<TimeSlot | null>(null);

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistCommunity, setWaitlistCommunity] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselImages.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const selectedLabel = useMemo(
    () => selectedSlot ?? "Pick one 1-hour slot",
    [selectedSlot],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);

    if (!communityName.trim() || !email.trim() || !topic.trim() || !selectedSlot) {
      return;
    }

    const fd = new FormData();
    fd.append("communityName", communityName.trim());
    fd.append("email", email.trim());
    fd.append("topic", topic.trim());
    fd.append("language", language);
    fd.append("notes", notes.trim());
    fd.append("slot", selectedSlot);
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("logo", file);

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send RSVP");
      }
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send RSVP");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaitlistError(null);
    if (!waitlistEmail.trim()) return;

    const fd = new FormData();
    fd.append("communityName", waitlistCommunity.trim() || "Waitlist signup");
    fd.append("email", waitlistEmail.trim());
    fd.append("topic", "Waitlist: notify if a slot reopens");
    fd.append("slot", "WAITLIST");
    fd.append("notes", "Sold-out waitlist signup from homepage RSVP section.");

    setWaitlistSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to join waitlist");
      }
      setWaitlistDone(true);
    } catch (err) {
      setWaitlistError(err instanceof Error ? err.message : "Failed to join waitlist");
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  return (
    <section
      id="community-rsvp"
      className="relative overflow-hidden border-t border-white/10 bg-[#050505]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,140,60,0.10),transparent_36%),radial-gradient(circle_at_85%_85%,rgba(210,220,232,0.10),transparent_38%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.028),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:py-24">
        {/* LEFT: Narrative + image carousel */}
        <div className="flex flex-col">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.32em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
            Pizza DAO Party · May 22 · Hosted by Axis
          </div>

          <h2 className="mt-6 text-[clamp(1.4rem,2.8vw,2.6rem)] font-light leading-[1.05] tracking-[-0.04em] text-white">
            Host your community
            <span className="block bg-gradient-to-r from-white via-white/80 to-white/55 bg-clip-text text-transparent">
              for one hour.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/70">
            We&apos;re opening the space from 3 PM to 10 PM for crypto communities.
            The activity is <span className="text-white">free</span>. Host a talk,
            run a workshop, play a game, kick off a debate, or just gather and discuss.
            It&apos;s your hour, your call.
          </p>

          {/* Carousel */}
          <div className="relative mt-8 overflow-hidden rounded-[28px] border border-white/12 bg-black/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            <div className="relative aspect-[4/5] w-full sm:aspect-[5/4]">
              {carouselImages.map((img, i) => (
                <div
                  key={img.src}
                  className={[
                    "absolute inset-0 transition-opacity duration-1000 ease-out",
                    i === carouselIndex ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                    Pizza DAO · CDMX
                  </p>
                  <p className="mt-1 text-lg tracking-[-0.03em] text-white">
                    Studio Berlin installations
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {carouselImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show image ${i + 1}`}
                      onClick={() => setCarouselIndex(i)}
                      className={[
                        "h-1.5 rounded-full transition-all",
                        i === carouselIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/40 hover:bg-white/70",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {inclusions.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm leading-snug text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                Event window
              </p>
              <p className="mt-2 text-xl tracking-[-0.04em] text-white">
                3 PM to 10 PM
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                What you can host
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Talk, workshop, game, debate, discussion. Anything you want.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: RSVP form */}
        <div className="min-w-0 overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,20,22,0.95),rgba(8,8,10,0.95))] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_40px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-4">
          <div className="min-w-0 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.012))] p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">
                  RSVP form
                </p>
                <h3 className="mt-2 text-lg tracking-[-0.03em] text-white">
                  Reserve your hour
                </h3>
              </div>
              <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/60 backdrop-blur">
                Free · 15 seats
              </div>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/80">
                  Received
                </p>
                <h4 className="mt-3 text-2xl tracking-[-0.04em] text-white">
                  Your RSVP request is in.
                </h4>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  We&apos;ll confirm your slot, lock it on the public flyer, and add
                  pizza for the hour. You&apos;ll get a reply at {email || "your email"}.
                </p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div>
                    <span className="text-white/45">Community:</span> {communityName}
                  </div>
                  <div className="mt-1">
                    <span className="text-white/45">Slot:</span> {selectedLabel}
                  </div>
                  <div className="mt-1">
                    <span className="text-white/45">Topic:</span> {topic}
                  </div>
                </div>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                      Community name
                    </span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/55"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      placeholder="e.g. Base Builders MX"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                      Contact email
                    </span>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/55"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@community.xyz"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                    Topic or activity
                  </span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/55"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Talk, workshop, game, debate…"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                    Language
                  </span>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "english" | "spanish")}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black/55"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                    </select>
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/45"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                    >
                      <path
                        d="M1 1.5 6 6.5l5-5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                    Upload logo
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-white/90"
                    onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? "")}
                  />
                  <p className="mt-2 text-xs text-white/38">
                    {logoName ? `Selected: ${logoName}` : "PNG, JPG, or SVG preferred."}
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                    Notes
                  </span>
                  <textarea
                    className="min-h-[88px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/55"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything we should know about your activation?"
                  />
                </label>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                        Calendar
                      </p>
                      <p className="mt-1 text-sm text-white/64">
                        May 22 only. Locked slots are taken.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/65 backdrop-blur">
                      {selectedLabel}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-white/10 bg-black/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">
                          Thu · 22 May
                        </p>
                        <p className="mt-0.5 text-sm text-white/66">3 PM – 10 PM · 1h slots</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const active = selectedSlot === slot.time;
                        const locked = slot.status === "locked";
                        const [start, end] = slot.time.split(" - ");

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => {
                              if (locked) {
                                setOpenLockedSlot(slot);
                                return;
                              }
                              setSelectedSlot(slot.time);
                            }}
                            aria-pressed={active}
                            title={
                              locked
                                ? `View ${slot.community ?? "host"} — click for details + RSVP`
                                : slot.time
                            }
                            className={[
                              "relative min-w-0 rounded-xl border px-3 py-2.5 text-left transition",
                              locked
                                ? "cursor-pointer border-amber-300/30 bg-[repeating-linear-gradient(135deg,rgba(255,180,80,0.06)_0_6px,transparent_6px_12px)] text-white/75 hover:border-amber-300/55 hover:bg-amber-300/[0.08]"
                                : active
                                  ? "border-white bg-white text-black shadow-[0_4px_18px_-4px_rgba(255,255,255,0.4)]"
                                  : "border-white/10 bg-white/[0.03] text-white/82 hover:border-white/25 hover:bg-white/[0.07]",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 truncate text-sm font-medium tabular-nums">
                                {start}
                              </div>
                              {locked ? (
                                <svg width="10" height="12" viewBox="0 0 9 11" fill="none" aria-hidden className="shrink-0">
                                  <path d="M1.5 4.5V3a3 3 0 1 1 6 0v1.5M1 4.5h7v6H1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                                </svg>
                              ) : active ? (
                                <span className="shrink-0 text-xs">✓</span>
                              ) : (
                                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                              )}
                            </div>
                            <div className={[
                              "mt-0.5 truncate text-[10px] uppercase tracking-[0.16em]",
                              locked ? "opacity-60" : active ? "opacity-70" : "opacity-50",
                            ].join(" ")}>
                              {locked ? (slot.community ?? "Reserved") : `→ ${end}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedSlot ? (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                    Selected slot:{" "}
                    <span className="text-white">{selectedSlot}</span>
                  </div>
                ) : null}

                {errorMsg ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
                    {errorMsg}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-full bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    submitting ||
                    !communityName.trim() ||
                    !email.trim() ||
                    !topic.trim() ||
                    !selectedSlot
                  }
                >
                  {submitting ? "Sending…" : "Send RSVP request"}
                </button>
              </form>
            )}

            {/* Waitlist — shown when schedule is sold out OR as fallback option */}
            <div className="mt-6 rounded-[20px] border border-white/10 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    {allSoldOut ? "No space left" : "No space that works for you?"}
                  </p>
                  <h4 className="mt-1 text-sm tracking-[-0.02em] text-white">
                    Leave your email and we&apos;ll ping you if a slot reopens.
                  </h4>
                </div>
              </div>

              {waitlistDone ? (
                <p className="mt-3 text-sm text-emerald-300/90">
                  You&apos;re on the waitlist. We&apos;ll reach out if anything frees up.
                </p>
              ) : (
                <form
                  onSubmit={handleWaitlist}
                  className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <input
                    type="text"
                    value={waitlistCommunity}
                    onChange={(e) => setWaitlistCommunity(e.target.value)}
                    placeholder="Community (optional)"
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/55"
                  />
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="you@community.xyz"
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/55"
                  />
                  <button
                    type="submit"
                    disabled={waitlistSubmitting || !waitlistEmail.trim()}
                    className="shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {waitlistSubmitting ? "Adding…" : "Notify me"}
                  </button>
                </form>
              )}
              {waitlistError ? (
                <p className="mt-2 text-xs text-red-300">{waitlistError}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {openLockedSlot ? (
        <LockedSlotModal
          slotTime={openLockedSlot.time}
          communityName={openLockedSlot.community}
          onClose={() => setOpenLockedSlot(null)}
        />
      ) : null}
    </section>
  );
}
