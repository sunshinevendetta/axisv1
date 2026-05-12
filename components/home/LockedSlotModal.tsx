"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

type CardData = {
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

type Attendee = {
  name: string;
  email: string;
  createdAt: string;
  mainTicket?: "sent" | "failed" | "pending";
  mainTicketReason?: string;
};

type EventInfo = {
  name: string;
  date: string;
  timezone: string;
  venueName: string | null;
  address: string | null;
  description: string | null;
  hostName: string;
  guestCount: number;
  coHosts: Array<{
    name: string;
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    instagram: string | null;
  }>;
  availableToppings: string[];
  availableBeverages: string[];
  pizzaStyle: string | null;
} | null;

const fallbackPhotos = [
  { src: "/pizzadao/pizzadao.webp", alt: "Pizza DAO party flyer" },
  { src: "/pizzadao/berlin1.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin2.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin3.webp", alt: "Berlin community gathering" },
];

type Props = {
  slotTime: string;
  communityName?: string;
  onClose: () => void;
  adminView?: boolean;
  adminAttendees?: Attendee[];
};

export default function LockedSlotModal({
  slotTime,
  communityName,
  onClose,
  adminView,
  adminAttendees,
}: Props) {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [eventInfo, setEventInfo] = useState<EventInfo>(null);
  const [pizzaUrl, setPizzaUrl] = useState<string>("https://rsv.pizza/mexicocity");

  const [attendName, setAttendName] = useState("");
  const [attendEmail, setAttendEmail] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [walletMode, setWalletMode] = useState<"closed" | "manual">("closed");

  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && connectedAddress) {
      setEthAddress(connectedAddress);
    }
  }, [isConnected, connectedAddress]);

  const coinbaseConnector = useMemo(
    () => connectors.find((c) => c.id === "coinbaseWalletSDK" || c.name?.toLowerCase().includes("coinbase")),
    [connectors],
  );
  const injectedConnector = useMemo(
    () => connectors.find((c) => c.id === "injected"),
    [connectors],
  );
  const [mailingListOptIn, setMailingListOptIn] = useState(false);
  const [toppingPrefs, setToppingPrefs] = useState<Record<string, "like" | "dislike" | null>>({});
  const [beveragePrefs, setBeveragePrefs] = useState<Record<string, "like" | "dislike" | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mainTicketResult, setMainTicketResult] = useState<{
    status: "sent" | "failed";
    fallbackUrl?: string;
  } | null>(null);

  function togglePref(
    setter: typeof setToppingPrefs,
    key: string,
    value: "like" | "dislike",
  ) {
    setter((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rsvp/event-info")
      .then((r) => r.json())
      .then((data: { event: EventInfo; publicUrl: string }) => {
        if (cancelled) return;
        setEventInfo(data.event ?? null);
        if (data.publicUrl) setPizzaUrl(data.publicUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/rsvp/slot?time=${encodeURIComponent(slotTime)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Not found");
        return r.json();
      })
      .then((data: { card: CardData }) => {
        if (cancelled) return;
        setCard(data.card);
        setAttendeeCount(data.card.attendeeCount);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slotTime]);

  const photos = useMemo(() => {
    return card?.logoUrl
      ? [{ src: card.logoUrl, alt: `${card.communityName} logo` }, ...fallbackPhotos]
      : fallbackPhotos;
  }, [card]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => setPhotoIndex((i) => (i + 1) % photos.length), 4500);
    return () => clearInterval(id);
  }, [photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleAttend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!attendName.trim() || !attendEmail.trim()) return;
    setSubmitting(true);
    try {
      const likedToppings = Object.entries(toppingPrefs)
        .filter(([, v]) => v === "like")
        .map(([k]) => k);
      const dislikedToppings = Object.entries(toppingPrefs)
        .filter(([, v]) => v === "dislike")
        .map(([k]) => k);
      const likedBeverages = Object.entries(beveragePrefs)
        .filter(([, v]) => v === "like")
        .map(([k]) => k);
      const dislikedBeverages = Object.entries(beveragePrefs)
        .filter(([, v]) => v === "dislike")
        .map(([k]) => k);

      const res = await fetch("/api/rsvp/attend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: slotTime,
          rsvpId: card?.rsvpId ?? undefined,
          name: attendName.trim(),
          email: attendEmail.trim(),
          ethereumAddress: ethAddress.trim() || undefined,
          mailingListOptIn,
          likedToppings,
          dislikedToppings,
          likedBeverages,
          dislikedBeverages,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to RSVP");
      setDone(true);
      if (typeof data.count === "number") setAttendeeCount(data.count);
      if (data.mainTicket === "sent" || data.mainTicket === "failed") {
        setMainTicketResult({
          status: data.mainTicket,
          fallbackUrl: data.mainTicketFallbackUrl,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to RSVP");
    } finally {
      setSubmitting(false);
    }
  }

  const headerCommunity = card?.communityName ?? communityName ?? "Reserved";
  const headerSlot = card?.slot ?? slotTime;
  const seatsLeft = Math.max(0, 15 - attendeeCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,20,22,0.97),rgba(8,8,10,0.97))] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/12 bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-black/80"
        >
          Close
        </button>

        {loading ? (
          <div className="px-6 py-20 text-center text-sm text-white/55">Loading…</div>
        ) : loadError ? (
          <div className="px-6 py-20 text-center text-sm text-red-300">{loadError}</div>
        ) : card ? (
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
            <div className="relative aspect-[4/5] w-full md:aspect-auto md:min-h-[480px]">
              {photos.map((p, i) => (
                <div
                  key={p.src}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === photoIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                    unoptimized={p.src.startsWith("/uploads/")}
                  />
                </div>
              ))}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                    {headerSlot}
                  </p>
                  <p className="mt-1 truncate text-lg tracking-[-0.03em] text-white">
                    Hosted by {headerCommunity}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show image ${i + 1}`}
                      onClick={() => setPhotoIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === photoIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">
                  What this is about
                </p>
                <h3 className="mt-2 text-2xl tracking-[-0.04em] text-white">
                  {card.topic}
                </h3>
              </div>

              {card.notes ? (
                <p className="text-sm leading-7 text-white/72">{card.notes}</p>
              ) : null}

              {card.link ? (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs text-white/80 hover:border-white/30 hover:bg-white/[0.10]"
                >
                  Visit site →
                </a>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">
                    Language
                  </p>
                  <p className="mt-1 text-sm text-white/85 capitalize">{card.language}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/40">
                    Seats left
                  </p>
                  <p className="mt-1 text-sm text-white/85 tabular-nums">
                    {seatsLeft} / 15
                  </p>
                </div>
              </div>

              {eventInfo ? (
                <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.03] p-3">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-amber-200/65">
                    Global Pizza Party · {eventInfo.guestCount} guests so far
                  </p>
                  {eventInfo.venueName ? (
                    <p className="mt-1.5 truncate text-sm text-white/85">
                      {eventInfo.venueName}
                      {eventInfo.address ? (
                        <span className="text-white/45"> · {eventInfo.address.split(",")[0]}</span>
                      ) : null}
                    </p>
                  ) : null}
                  {eventInfo.coHosts.length > 0 ? (
                    <div className="mt-2 flex items-center gap-1">
                      {eventInfo.coHosts.slice(0, 6).map((c, i) =>
                        c.avatar_url ? (
                          <img
                            key={c.name + i}
                            src={c.avatar_url}
                            alt={c.name}
                            title={c.name}
                            className="h-6 w-6 rounded-full border border-black/40 object-cover"
                            style={{ marginLeft: i === 0 ? 0 : -6 }}
                          />
                        ) : null,
                      )}
                      {eventInfo.coHosts.length > 6 ? (
                        <span className="ml-2 text-[10px] text-white/45">
                          +{eventInfo.coHosts.length - 6}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-[18px] border border-white/10 bg-black/35 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    RSVP as attendee
                  </p>
                  <a
                    href={pizzaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/[0.06] px-2.5 py-0.5 text-[9px] uppercase tracking-[0.22em] text-amber-200/85 hover:bg-amber-300/[0.12]"
                  >
                    Powered by Global Pizza Party
                  </a>
                </div>
                {done ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-emerald-300/90">
                      ✓ Your seat is reserved. We&apos;ll see you at {headerSlot}.
                    </p>
                    {mainTicketResult?.status === "sent" ? (
                      <p className="text-xs text-emerald-300/75">
                        ✓ Pizza Party ticket sent — check your inbox.
                      </p>
                    ) : mainTicketResult?.status === "failed" ? (
                      <p className="text-xs text-amber-200/85">
                        ⚠ We couldn&apos;t reach Global Pizza Party. Please RSVP for the official ticket here:{" "}
                        <a
                          href={mainTicketResult.fallbackUrl ?? pizzaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-amber-100"
                        >
                          rsv.pizza/mexicocity →
                        </a>
                      </p>
                    ) : null}
                  </div>
                ) : seatsLeft === 0 ? (
                  <p className="mt-3 text-sm text-white/60">This slot is full.</p>
                ) : (
                  <form onSubmit={handleAttend} className="mt-3 space-y-2">
                    <input
                      value={attendName}
                      onChange={(e) => setAttendName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                    />
                    <input
                      type="email"
                      value={attendEmail}
                      onChange={(e) => setAttendEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                    />
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                        Wallet address (optional)
                      </p>
                      {isConnected && connectedAddress ? (
                        <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2">
                          <span className="truncate font-mono text-xs text-emerald-200">
                            {connectedAddress.slice(0, 6)}…{connectedAddress.slice(-4)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              disconnect();
                              setEthAddress("");
                            }}
                            className="text-[10px] uppercase tracking-[0.2em] text-white/45 hover:text-white/80"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : walletMode === "manual" ? (
                        <input
                          value={ethAddress}
                          onChange={(e) => setEthAddress(e.target.value)}
                          placeholder="0x…"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-white/30 focus:border-white/30"
                        />
                      ) : (
                        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                          <button
                            type="button"
                            disabled={!coinbaseConnector || connecting}
                            onClick={() => coinbaseConnector && connect({ connector: coinbaseConnector })}
                            className="rounded-xl border border-blue-400/30 bg-blue-400/[0.08] px-3 py-2 text-xs text-blue-200 transition hover:bg-blue-400/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {connecting ? "…" : "Coinbase Smart Wallet"}
                          </button>
                          <button
                            type="button"
                            disabled={!injectedConnector || connecting}
                            onClick={() => injectedConnector && connect({ connector: injectedConnector })}
                            className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-white/85 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Other wallet
                          </button>
                          <button
                            type="button"
                            onClick={() => setWalletMode("manual")}
                            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/65 transition hover:bg-white/[0.08]"
                          >
                            Paste manually
                          </button>
                        </div>
                      )}
                      {!isConnected ? (
                        <p className="mt-2 text-[11px] leading-snug text-white/45">
                          New to crypto?{" "}
                          <button
                            type="button"
                            onClick={() => coinbaseConnector && connect({ connector: coinbaseConnector })}
                            className="underline underline-offset-2 hover:text-white/80"
                          >
                            Create a Coinbase Smart Wallet with a passkey
                          </button>{" "}
                          — no app, no seed phrase.
                        </p>
                      ) : null}
                      {connectError ? (
                        <p className="mt-2 text-[11px] text-red-300">{connectError.message}</p>
                      ) : null}
                    </div>

                    {eventInfo?.availableToppings && eventInfo.availableToppings.length > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                          Toppings
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {eventInfo.availableToppings.map((t) => (
                            <div key={t} className="flex items-center justify-between gap-2">
                              <span className="text-xs capitalize text-white/80">{t}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => togglePref(setToppingPrefs, t, "like")}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] transition ${
                                    toppingPrefs[t] === "like"
                                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-emerald-400/30"
                                  }`}
                                >
                                  Like
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePref(setToppingPrefs, t, "dislike")}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] transition ${
                                    toppingPrefs[t] === "dislike"
                                      ? "border-red-400/50 bg-red-400/15 text-red-200"
                                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-red-400/30"
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {eventInfo?.availableBeverages && eventInfo.availableBeverages.length > 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                          Beverages
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {eventInfo.availableBeverages.map((b) => (
                            <div key={b} className="flex items-center justify-between gap-2">
                              <span className="text-xs capitalize text-white/80">{b}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => togglePref(setBeveragePrefs, b, "like")}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] transition ${
                                    beveragePrefs[b] === "like"
                                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-emerald-400/30"
                                  }`}
                                >
                                  Like
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePref(setBeveragePrefs, b, "dislike")}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] transition ${
                                    beveragePrefs[b] === "dislike"
                                      ? "border-red-400/50 bg-red-400/15 text-red-200"
                                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-red-400/30"
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <label className="flex items-center gap-2 text-xs text-white/65">
                      <input
                        type="checkbox"
                        checked={mailingListOptIn}
                        onChange={(e) => setMailingListOptIn(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-black/40"
                      />
                      Subscribe to PizzaDAO updates
                    </label>

                    <p className="text-[11px] leading-snug text-white/55">
                      Your RSVP also registers you for the official Global Pizza Party ticket at{" "}
                      <a
                        href={pizzaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2 hover:text-white/80"
                      >
                        rsv.pizza/mexicocity
                      </a>
                      .
                    </p>
                    {error ? <p className="text-xs text-red-300">{error}</p> : null}
                    <button
                      type="submit"
                      disabled={submitting || !attendName.trim() || !attendEmail.trim()}
                      className="w-full rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Sending…" : "RSVP to this hour"}
                    </button>
                  </form>
                )}
              </div>

              {adminView && adminAttendees ? (
                <div className="rounded-[18px] border border-white/10 bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    Attendees ({adminAttendees.length})
                  </p>
                  {adminAttendees.length === 0 ? (
                    <p className="mt-2 text-sm text-white/40">No attendees yet.</p>
                  ) : (
                    <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto text-sm text-white/75">
                      {adminAttendees.map((a) => (
                        <li
                          key={a.email + a.createdAt}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <span className="truncate">{a.name}</span>
                          <span className="truncate text-xs text-white/45">
                            {a.email}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
