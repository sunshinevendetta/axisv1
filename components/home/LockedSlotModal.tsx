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
  guestCount: number;
  availableToppings: string[];
  availableBeverages: string[];
} | null;

const fallbackPhotos = [
  { src: "/pizzadao/pizzadaoflyer.webp", alt: "Pizza DAO party flyer" },
  { src: "/pizzadao/berlin1.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin2.webp", alt: "Berlin community gathering" },
  { src: "/pizzadao/berlin3.webp", alt: "Berlin community gathering" },
];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type Props = {
  slotTime: string;
  communityName?: string;
  onClose: () => void;
  adminView?: boolean;
  adminAttendees?: Attendee[];
};

function clampText(text: string, maxLength: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

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
  const [walletMode, setWalletMode] = useState<"closed" | "manual" | "none">("closed");
  const [mailingListOptIn, setMailingListOptIn] = useState(false);
  const [toppingPrefs, setToppingPrefs] = useState<Record<string, "like" | "dislike" | null>>({});
  const [beveragePrefs, setBeveragePrefs] = useState<Record<string, "like" | "dislike" | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mainTicketResult, setMainTicketResult] = useState<{
    status: "sent" | "failed";
    fallbackUrl?: string;
  } | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const dialogRef = useRef<HTMLDivElement>(null);

  const coinbaseConnector = useMemo(
    () => connectors.find((c) => c.id === "coinbaseWalletSDK" || c.name?.toLowerCase().includes("coinbase")),
    [connectors],
  );
  const injectedConnector = useMemo(() => connectors.find((c) => c.id === "injected"), [connectors]);

  useEffect(() => {
    if (isConnected && connectedAddress) setEthAddress(connectedAddress);
  }, [isConnected, connectedAddress]);

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
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slotTime]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, []);

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
  const topicPreview = card ? clampText(card.topic, 58) : "";
  const notesPreview = card ? clampText(card.notes, 132) : "";

  return (
    <div
      className="fixed inset-0 z-40 overflow-hidden bg-black/80 px-3 pb-[7rem] pt-[6.5rem] backdrop-blur sm:px-4 sm:pb-[8rem] sm:pt-[7.5rem]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex h-[calc(100dvh-13.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,20,22,0.98),rgba(8,8,10,0.98))] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)] sm:h-[calc(100dvh-15.5rem)]"
        style={{ filter: "none" }}
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-white/10 bg-black/75 px-4 py-4 backdrop-blur sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">{headerSlot}</p>
            <h2 className="mt-1 text-lg font-medium tracking-[-0.03em] text-white sm:text-2xl">
              Hosted by {headerCommunity}
            </h2>
            <p className="mt-1 text-sm text-white/55 sm:text-base">{topicPreview}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close"
            className="shrink-0 rounded-full border border-white/12 bg-black/70 px-4 py-2 text-sm text-white/90 shadow-lg hover:bg-black/90"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-white/55">
            Loading...
          </div>
        ) : loadError ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-red-300">
            {loadError}
          </div>
        ) : card ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/10 bg-black/20 sm:aspect-[16/9]">
                {photos.map((p, i) => (
                  <div
                    key={p.src}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      i === photoIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`absolute inset-0 ${
                        i === 0 && card?.logoUrl ? "bg-[#f7f3ea]" : "bg-black/20"
                      }`}
                    />
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 100vw, 100vw"
                      className={i === 0 && card?.logoUrl ? "object-contain p-10 sm:p-12" : "object-cover"}
                      style={{ filter: "none" }}
                      priority={i === 0}
                      unoptimized={p.src.startsWith("/uploads/")}
                    />
                  </div>
                ))}
                <div
                  aria-hidden
                  className={`absolute inset-0 ${
                    card?.logoUrl
                      ? "bg-gradient-to-t from-black/65 via-black/10 to-transparent"
                      : "bg-gradient-to-t from-black/85 via-black/15 to-transparent"
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                      {card.language}
                    </p>
                    <p className="mt-1 text-base tracking-[-0.03em] text-white sm:text-lg">
                      Seats left {seatsLeft} of 15
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
                          i === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {notesPreview ? (
                <p className="max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                  {notesPreview}
                </p>
              ) : null}

              {card.link ? (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white/85 hover:border-white/30 hover:bg-white/[0.10]"
                >
                  Visit site →
                </a>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Language</p>
                  <p className="mt-1 text-base text-white capitalize">{card.language}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Seats left</p>
                  <p className="mt-1 text-base text-white tabular-nums">{seatsLeft} / 15</p>
                </div>
              </div>

              {eventInfo ? (
                <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.03] px-4 py-3 text-sm leading-6 text-white/75">
                  Pizza Party updates are live.{" "}
                  <span className="text-white/90">{eventInfo.guestCount} guests so far.</span>
                </div>
              ) : null}

              <div className="rounded-[20px] border border-white/10 bg-black/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    RSVP as attendee
                  </p>
                  <a
                    href={pizzaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-200/90 hover:bg-amber-300/[0.12]"
                  >
                    rsv.pizza
                  </a>
                </div>

                {done ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-base text-emerald-300/90">
                      Your seat is reserved. We&apos;ll see you at {headerSlot}.
                    </p>
                    {mainTicketResult?.status === "sent" ? (
                      <p className="text-sm text-emerald-300/75">Pizza Party ticket sent. Check your inbox.</p>
                    ) : mainTicketResult?.status === "failed" ? (
                      <p className="text-sm leading-6 text-amber-200/85">
                        Official ticket RSVP failed. Use{" "}
                        <a
                          href={mainTicketResult.fallbackUrl ?? pizzaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-amber-100"
                        >
                          rsv.pizza/mexicocity
                        </a>
                        .
                      </p>
                    ) : null}
                  </div>
                ) : seatsLeft === 0 ? (
                  <p className="mt-4 text-base text-white/60">This slot is full.</p>
                ) : (
                  <form id="rsvp-form" onSubmit={handleAttend} className="mt-4 space-y-3">
                    <input
                      value={attendName}
                      onChange={(e) => setAttendName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-white/30"
                    />
                    <input
                      type="email"
                      value={attendEmail}
                      onChange={(e) => setAttendEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-white/30"
                    />

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                        Wallet address (optional)
                      </p>
                      {isConnected && connectedAddress ? (
                        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2">
                          <span className="truncate font-mono text-xs text-emerald-200">
                            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
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
                          placeholder="0x..."
                          className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-xs text-white outline-none placeholder:text-white/30 focus:border-white/30"
                        />
                      ) : walletMode === "none" ? (
                        <div className="mt-3 rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-xs text-white/70">
                          {ZERO_ADDRESS}
                        </div>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button
                            type="button"
                            disabled={!coinbaseConnector || connecting}
                            onClick={() => {
                              if (coinbaseConnector) connect({ connector: coinbaseConnector });
                            }}
                            className="rounded-xl border border-slate-200/25 bg-slate-200/[0.08] px-3 py-3 text-sm text-slate-100 transition hover:bg-slate-200/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {connecting ? "..." : "Create one"}
                          </button>
                          <button
                            type="button"
                            disabled={!injectedConnector || connecting}
                            onClick={() => injectedConnector && connect({ connector: injectedConnector })}
                            className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-3 text-sm text-white/85 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Wallet
                          </button>
                          <button
                            type="button"
                            onClick={() => setWalletMode("manual")}
                            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-white/65 transition hover:bg-white/[0.08]"
                          >
                            Paste
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setWalletMode("none");
                              setEthAddress(ZERO_ADDRESS);
                            }}
                            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-white/65 transition hover:bg-white/[0.08]"
                          >
                            None
                          </button>
                        </div>
                      )}
                      {!isConnected ? (
                        <p className="mt-3 text-sm leading-6 text-white/45">
                          Optional. Connect a wallet or paste an address.
                        </p>
                      ) : null}
                      {connectError ? <p className="mt-2 text-sm text-red-300">{connectError.message}</p> : null}
                    </div>

                    {(eventInfo?.availableToppings?.length || eventInfo?.availableBeverages?.length) ? (
                      <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
                        <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.24em] text-white/45">
                          MENU
                        </summary>
                        <div className="mt-3 space-y-3">
                          {eventInfo?.availableToppings?.length ? (
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                                Toppings
                              </p>
                              {eventInfo.availableToppings.map((t) => (
                                <div key={t} className="flex items-center justify-between gap-2">
                                  <span className="text-sm capitalize text-white/80">{t}</span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setToppingPrefs((prev) => ({
                                          ...prev,
                                          [t]: prev[t] === "like" ? null : "like",
                                        }))
                                      }
                                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                                        toppingPrefs[t] === "like"
                                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                                          : "border-white/10 bg-white/[0.03] text-white/55 hover:border-emerald-400/30"
                                      }`}
                                    >
                                      Like
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setToppingPrefs((prev) => ({
                                          ...prev,
                                          [t]: prev[t] === "dislike" ? null : "dislike",
                                        }))
                                      }
                                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
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
                          ) : null}

                          {eventInfo?.availableBeverages?.length ? (
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                                Beverages
                              </p>
                              {eventInfo.availableBeverages.map((b) => (
                                <div key={b} className="flex items-center justify-between gap-2">
                                  <span className="text-sm capitalize text-white/80">{b}</span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setBeveragePrefs((prev) => ({
                                          ...prev,
                                          [b]: prev[b] === "like" ? null : "like",
                                        }))
                                      }
                                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
                                        beveragePrefs[b] === "like"
                                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                                          : "border-white/10 bg-white/[0.03] text-white/55 hover:border-emerald-400/30"
                                      }`}
                                    >
                                      Like
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setBeveragePrefs((prev) => ({
                                          ...prev,
                                          [b]: prev[b] === "dislike" ? null : "dislike",
                                        }))
                                      }
                                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition ${
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
                          ) : null}
                        </div>
                      </details>
                    ) : null}

                    <label className="flex items-center gap-2 text-sm text-white/65">
                      <input
                        type="checkbox"
                        checked={mailingListOptIn}
                        onChange={(e) => setMailingListOptIn(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-black/40"
                      />
                      Subscribe to PizzaDAO updates
                    </label>

                    <p className="text-sm leading-6 text-white/55">
                      This also registers your seat for the official ticket at{" "}
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
                        <li key={a.email + a.createdAt} className="flex items-baseline justify-between gap-2">
                          <span className="truncate">{a.name}</span>
                          <span className="truncate text-xs text-white/45">{a.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}

              {!done && seatsLeft > 0 ? (
                <div className="pt-2">
                  {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}
                  <button
                    type="submit"
                    form="rsvp-form"
                    disabled={submitting || !attendName.trim() || !attendEmail.trim()}
                    className="w-full rounded-full bg-white px-5 py-4 text-base font-medium text-black ring-1 ring-white/10 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {submitting ? "Sending..." : "RSVP to this hour"}
                  </button>
                </div>
              ) : null}
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
