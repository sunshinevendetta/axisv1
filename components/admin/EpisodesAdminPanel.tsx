"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import type { EpisodeCatalogEntry } from "@/src/content/episodes";

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  walletConfigured?: boolean;
  bootstrapOnly?: boolean;
  subject?: string | null;
};

const emptySession: SessionState = {
  authenticated: false,
  configured: false,
  walletConfigured: false,
  subject: null,
};

function toEditableEpisode(record: EpisodeCatalogEntry): EpisodeCatalogEntry {
  const registryEventId =
    typeof record.registryEventId === "number" && Number.isFinite(record.registryEventId)
      ? Number(record.registryEventId)
      : undefined;

  return {
    id: Number(record.id),
    slug: record.slug,
    title: record.title,
    shortTitle: record.shortTitle,
    status: record.status,
    season: Number(record.season),
    year: Number(record.year),
    startsAt: record.startsAt,
    timezone: record.timezone,
    venueName: record.venueName,
    city: record.city,
    summary: record.summary,
    description: record.description,
    lumaEventId: record.lumaEventId || undefined,
    lumaUrl: record.lumaUrl || undefined,
    registryEventId,
    assets: {
      sourceUri: record.assets.sourceUri,
      posterUri: record.assets.posterUri,
      imageUri: record.assets.imageUri || undefined,
      glbUri: record.assets.glbUri,
    },
  };
}

function getCurrentOpenEpisode(episodes: EpisodeCatalogEntry[]) {
  return [...episodes]
    .filter((episode) => episode.status === "open")
    .sort((left, right) => right.id - left.id)[0];
}

function getNextLockedEpisode(episodes: EpisodeCatalogEntry[]) {
  return [...episodes]
    .filter((episode) => episode.status === "locked")
    .sort((left, right) => left.id - right.id)[0];
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export default function EpisodesAdminPanel() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>(emptySession);
  const [episodes, setEpisodes] = useState<EpisodeCatalogEntry[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [draft, setDraft] = useState<EpisodeCatalogEntry | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [lumaReference, setLumaReference] = useState("");
  const [isPending, startTransition] = useTransition();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const selectedEpisode = useMemo(
    () => episodes.find((episode) => episode.slug === selectedSlug) ?? null,
    [episodes, selectedSlug],
  );
  const currentOpenEpisode = useMemo(() => getCurrentOpenEpisode(episodes), [episodes]);
  const nextLockedEpisode = useMemo(() => getNextLockedEpisode(episodes), [episodes]);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load session.");
        }

        const data = (await response.json()) as SessionState;
        setSession(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!session.authenticated) {
      return;
    }

    void refreshEpisodes()
      .catch((error) => {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Failed to load owner episodes.");
      });
  }, [session.authenticated]);

  useEffect(() => {
    if (selectedEpisode) {
      setDraft(toEditableEpisode(selectedEpisode));
      setLumaReference(selectedEpisode.lumaUrl ?? selectedEpisode.lumaEventId ?? "");
    }
  }, [selectedEpisode]);

  function updateDraft<K extends keyof EpisodeCatalogEntry>(key: K, value: EpisodeCatalogEntry[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateAssetField(
    key: keyof EpisodeCatalogEntry["assets"],
    value: EpisodeCatalogEntry["assets"][typeof key],
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            assets: {
              ...current.assets,
              [key]: value,
            },
          }
        : current,
    );
  }

  async function refreshEpisodes() {
    const response = await fetch("/api/admin/episodes", { cache: "no-store" });
    if (!response.ok) {
      const message = await readApiError(response, "Failed to refresh episodes.");

      if (response.status === 401) {
        setSession((current) => ({
          ...current,
          authenticated: false,
          subject: null,
        }));
      }

      throw new Error(message);
    }

    const data = (await response.json()) as { episodes: EpisodeCatalogEntry[] };
    setEpisodes(data.episodes);
    setSelectedSlug((current) => {
      if (current && data.episodes.some((episode) => episode.slug === current)) {
        return current;
      }

      return getCurrentOpenEpisode(data.episodes)?.slug ?? getNextLockedEpisode(data.episodes)?.slug ?? "";
    });
  }

  function handleRefresh() {
    void refreshEpisodes().catch((error) => {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : "Failed to refresh episodes.");
    });
  }

  async function handleWalletLogin() {
    if (!address) {
      setFeedback("Connect a wallet first.");
      return;
    }

    setFeedback("");

    const challengeResponse = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "challenge",
        address,
      }),
    });

    const challengeData = (await challengeResponse.json()) as { error?: string; message?: string };

    if (!challengeResponse.ok || !challengeData.message) {
      setFeedback(challengeData.error ?? "Failed to create wallet challenge.");
      return;
    }

    const signature = await signMessageAsync({ message: challengeData.message });

    const verifyResponse = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "wallet",
        address,
        signature,
      }),
    });

    const verifyData = (await verifyResponse.json()) as { error?: string };

    if (!verifyResponse.ok) {
      setFeedback(verifyData.error ?? "Wallet sign-in failed.");
      return;
    }

    setFeedback("Wallet verified. Owner session started.");
    setSession((current) => ({
      ...current,
      authenticated: true,
      configured: true,
      subject: `wallet:${address}`,
    }));
  }

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    disconnect();
    setSession((current) => ({ ...current, authenticated: false, subject: null }));
    setEpisodes([]);
    setDraft(null);
    setSelectedSlug("");
    setFeedback("Signed out.");
  }

  function handleSave() {
    if (!draft) {
      return;
    }

    startTransition(() => {
      void (async () => {
        setFeedback("");

        const response = await fetch(`/api/admin/episodes/${draft.slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        });

        const data = (await response.json()) as { error?: string; episode?: EpisodeCatalogEntry };

        if (!response.ok) {
          setFeedback(data.error ?? "Save failed.");
          return;
        }

        await refreshEpisodes();
        setFeedback(`Saved ${draft.title}.`);
      })().catch((error) => {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Save failed.");
      });
    });
  }

  function handleLumaAutofill() {
    const reference = lumaReference || draft?.lumaUrl || draft?.lumaEventId;

    if (!reference || !draft) {
      setFeedback("Enter a Luma URL or event ID first.");
      return;
    }

    startTransition(() => {
      void (async () => {
        setFeedback("");

        const response = await fetch("/api/admin/luma", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const data = (await response.json()) as {
          error?: string;
          event?: {
            title: string;
            description: string;
            startsAt: string;
            timezone: string;
            venueName: string;
            city: string;
            lumaEventId?: string;
            lumaUrl: string;
            imageUrl?: string;
            summary: string;
          };
        };
        const event = data.event;

        if (!response.ok || !event) {
          setFeedback(data.error ?? "Failed to load data from Luma.");
          return;
        }

        setDraft((current) =>
          current
            ? {
                ...current,
                title: event.title || current.title,
                shortTitle: current.shortTitle,
                startsAt: event.startsAt || current.startsAt,
                timezone: event.timezone || current.timezone,
                venueName: event.venueName || current.venueName,
                city: event.city || current.city,
                summary: event.summary || current.summary,
                description: event.description || current.description,
                lumaEventId: event.lumaEventId || current.lumaEventId,
                lumaUrl: event.lumaUrl || current.lumaUrl,
                assets: {
                  ...current.assets,
                  posterUri: event.imageUrl || current.assets.posterUri,
                  imageUri: event.imageUrl || current.assets.imageUri,
                },
              }
            : current,
        );
        setFeedback("Pulled title, date, venue, image, and description from Luma.");
      })().catch((error) => {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Failed to load data from Luma.");
      });
    });
  }

  function handleSync() {
    if (!draft) {
      return;
    }

    startTransition(() => {
      void (async () => {
        setFeedback("");

        const response = await fetch(`/api/admin/episodes/${draft.slug}/sync`, {
          method: "POST",
        });

        const data = (await response.json()) as {
          error?: string;
          action?: "created" | "updated";
          registryEventId?: number;
          transactionHash?: string;
        };

        if (!response.ok) {
          setFeedback(data.error ?? "Sync failed.");
          return;
        }

        await refreshEpisodes();
        setFeedback(
          `${data.action === "updated" ? "Updated" : "Created"} onchain event${data.registryEventId ? ` #${data.registryEventId}` : ""}${data.transactionHash ? ` (${data.transactionHash.slice(0, 10)}...)` : ""}.`,
        );
      })().catch((error) => {
        console.error(error);
        setFeedback(error instanceof Error ? error.message : "Sync failed.");
      });
    });
  }

  if (!session.configured) {
    return (
      <section className="min-h-screen bg-black px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Owner Episodes Admin</h1>
          <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">
            Configure wallet owner access in your environment to enable this dashboard.
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/58">
            <p>`EPISODES_OWNER_ERC1155_ADDRESS`</p>
            <p>`EPISODES_OWNER_ERC1155_TOKEN_ID` one ID or comma-separated role IDs like `1,2,3`</p>
            <p>`EPISODES_ADMIN_SESSION_SECRET`</p>
            <p>`EPISODES_OWNER_RPC_URL` optional, defaults to Base mainnet</p>
            <p>`EPISODES_OWNER_ALLOWLIST` optional for agent wallets</p>
          </div>
        </div>
      </section>
    );
  }

  if (!session.authenticated) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_40%),linear-gradient(180deg,#050505,#000)] px-4 py-12 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-lg rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">
          <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
            Owner Access
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Episodes control room</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Use a wallet that holds your owner access ERC-1155 key to unlock the dashboard.
          </p>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Wallet unlock</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Connect the wallet that holds your owner ERC-1155 key, sign once, and the dashboard will open.
            </p>

            {!isConnected && (
              <div className="mt-5 grid gap-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    disabled={isConnecting}
                    className="rounded-2xl border border-white/14 bg-white/8 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white disabled:opacity-60"
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            )}

            {isConnected && (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/75">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleWalletLogin}
                    disabled={isPending}
                    className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black disabled:opacity-60"
                  >
                    Sign with wallet
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="rounded-2xl border border-white/14 px-4 py-3 text-sm uppercase tracking-[0.2em] text-white/75"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {feedback && <p className="mt-4 text-sm text-white/70">{feedback}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#040404_0%,#090909_40%,#000_100%)] px-3 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl sm:mb-8 sm:rounded-[32px] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/55">
                Owner Dashboard
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Episodes admin</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">
                Wallet-gated control room for editing the active episode, pulling details from Luma, and syncing the same record onchain.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-white/48">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Current: {currentOpenEpisode?.shortTitle ?? "none"}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Next unlock: {nextLockedEpisode?.shortTitle ?? "none"}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Session: {session.subject ?? "owner"}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={() => router.push("/owner/contracts")}
                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/75 sm:w-auto"
              >
                Contract HQ
              </button>
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/75 sm:w-auto"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl sm:mb-8 sm:rounded-[32px] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/48">Events Walkthrough</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                Edit the episode, pull details, then sync the event.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/64">
                This page is now the clean post-deploy workflow. Pick an episode, update or autofill the draft, then push the final event
                state onchain.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="w-full rounded-2xl border border-white/15 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/75 sm:w-auto"
            >
              Refresh Episodes
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 1</div>
              <div className="mt-2 text-lg font-semibold text-white">Choose the episode</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Use the left rail to open the current or next episode slot.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 2</div>
              <div className="mt-2 text-lg font-semibold text-white">Edit or pull from Luma</div>
              <p className="mt-2 text-sm leading-6 text-white/62">You can type directly or autofill date, venue, image, and description.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/46">Step 3</div>
              <div className="mt-2 text-lg font-semibold text-white">Save and sync onchain</div>
              <p className="mt-2 text-sm leading-6 text-white/62">Save the episode record first, then sync it so the event registry stays aligned.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="px-1 text-xs uppercase tracking-[0.28em] text-white/45">Episode slots</div>
              <p className="mt-2 px-1 text-sm leading-6 text-white/62">
                Pick the episode you want to edit. On smaller screens use the selector. On desktop the list below scrolls.
              </p>

              <label className="mt-4 block space-y-2 xl:hidden">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/48">Choose episode</span>
                <select
                  value={selectedSlug}
                  onChange={(event) => setSelectedSlug(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none"
                >
                  {episodes.map((episode) => (
                    <option key={episode.slug} value={episode.slug}>
                      Episode {episode.id} · {episode.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="hidden xl:block">
                <div className="mt-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                  <div className="space-y-3">
                    {episodes.map((episode) => {
                      const isActive = episode.slug === selectedSlug;
                      const isCurrent = currentOpenEpisode?.slug === episode.slug;
                      const isNext = nextLockedEpisode?.slug === episode.slug;
                      return (
                        <button
                          key={episode.slug}
                          onClick={() => setSelectedSlug(episode.slug)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            isActive
                              ? "border-white/30 bg-white/12"
                              : "border-white/8 bg-black/20 hover:border-white/18 hover:bg-white/6"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0 truncate text-sm font-medium uppercase tracking-[0.18em]">{episode.shortTitle}</span>
                            <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-white/45">{episode.status}</span>
                          </div>
                          <div className="mt-2 break-words text-sm text-white/72">{episode.title}</div>
                          <div className="mt-2 text-sm text-white/55">{episode.startsAt.slice(0, 10)}</div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                            {isCurrent && <span className="rounded-full border border-white/10 px-2 py-1">current</span>}
                            {isNext && <span className="rounded-full border border-white/10 px-2 py-1">next</span>}
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              chain {episode.registryEventId ?? "pending"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
            {!draft && <p className="text-white/65">Select an episode to edit.</p>}

            {draft && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Title</span>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft("title", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Short Title</span>
                    <input
                      value={draft.shortTitle}
                      onChange={(event) => updateDraft("shortTitle", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Status</span>
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft("status", event.target.value as EpisodeCatalogEntry["status"])}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    >
                      <option value="open">open</option>
                      <option value="locked">locked</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Start Date</span>
                    <input
                      value={draft.startsAt}
                      onChange={(event) => updateDraft("startsAt", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Timezone</span>
                    <input
                      value={draft.timezone}
                      onChange={(event) => updateDraft("timezone", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Sequential slot</span>
                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/72">
                      Episode ID {draft.id} {nextLockedEpisode?.id === draft.id ? "· next unlock candidate" : ""}
                    </div>
                  </div>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Luma Event ID</span>
                    <input
                      value={draft.lumaEventId ?? ""}
                      onChange={(event) => updateDraft("lumaEventId", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Autofill from Luma</span>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={lumaReference}
                        onChange={(event) => setLumaReference(event.target.value)}
                        placeholder="Paste Luma URL or evt-..."
                        className="min-w-0 flex-1 rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLumaAutofill}
                        disabled={isPending}
                        className="rounded-2xl border border-white/18 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60"
                      >
                        Pull
                      </button>
                    </div>
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Luma URL</span>
                    <input
                      value={draft.lumaUrl ?? ""}
                      onChange={(event) => updateDraft("lumaUrl", event.target.value)}
                      placeholder="https://luma.com/event/..."
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Venue</span>
                    <input
                      value={draft.venueName}
                      onChange={(event) => updateDraft("venueName", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">City</span>
                    <input
                      value={draft.city}
                      onChange={(event) => updateDraft("city", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Summary</span>
                    <textarea
                      value={draft.summary}
                      onChange={(event) => updateDraft("summary", event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Description</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) => updateDraft("description", event.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Source URI</span>
                    <input
                      value={draft.assets.sourceUri}
                      onChange={(event) => updateAssetField("sourceUri", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Poster URI</span>
                    <input
                      value={draft.assets.posterUri}
                      onChange={(event) => updateAssetField("posterUri", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Extracted Image URI</span>
                    <input
                      value={draft.assets.imageUri ?? ""}
                      onChange={(event) => updateAssetField("imageUri", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">GLB URI</span>
                    <input
                      value={draft.assets.glbUri}
                      onChange={(event) => updateAssetField("glbUri", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-black/35 px-4 py-3 text-sm outline-none"
                    />
                  </label>
                  <div className="space-y-2 sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-white/48">Onchain event ID</span>
                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/72">
                      {draft.registryEventId ?? "Created automatically on first sync and saved after tx confirmation."}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-black/65 p-3 backdrop-blur-xl sm:static sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none md:flex-row">
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black disabled:opacity-60"
                  >
                    Save episode
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={isPending}
                    className="rounded-2xl border border-white/18 px-5 py-3 text-sm uppercase tracking-[0.2em] text-white disabled:opacity-60"
                  >
                    Sync onchain
                  </button>
                </div>

                {feedback && <p className="text-sm text-white/70">{feedback}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
