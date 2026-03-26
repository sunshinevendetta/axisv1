"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { artistProfiles, musicArtistProfiles, visualArtistProfiles } from "@/src/content/artists";
import type { ArtistProfile } from "@/src/content/artists";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogLine = { id: number; text: string; tone: "info" | "success" | "warn" | "error" };
type ScraperStatus = "idle" | "running" | "done" | "error";
type ZoraSyncResult = { slug: string; identifier: string; status: "synced" | "failed"; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyLine(text: string): LogLine["tone"] {
  if (/✓|↻|✦|done|wrote|summary/i.test(text)) return "success";
  if (/⚠|warning|not found|skipping|miss/i.test(text)) return "warn";
  if (/error|fatal|failed/i.test(text)) return "error";
  return "info";
}

let _logId = 0;
function mkLog(text: string): LogLine {
  return { id: ++_logId, text, tone: classifyLine(text) };
}

function toneClass(t: LogLine["tone"]) {
  if (t === "success") return "text-white/78";
  if (t === "warn")    return "text-white/48";
  if (t === "error")   return "text-white/68";
  return "text-white/38";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ScraperStatus }) {
  const base = "h-2 w-2 rounded-full shrink-0";
  if (status === "running") return <span className={`${base} bg-white/60 animate-pulse`} />;
  if (status === "done")    return <span className={`${base} bg-white/70`} />;
  if (status === "error")   return <span className={`${base} bg-white/45`} />;
  return <span className={`${base} bg-white/20`} />;
}

function Pill({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-[0.22em] ${dim ? "border-white/8 text-white/24" : "border-white/14 text-white/52"}`}>
      {label}
    </span>
  );
}

function ArtistRow({
  artist,
  onScrape,
  onZoraSync,
  isScraping,
  isZoraSyncing,
}: {
  artist: ArtistProfile;
  onScrape: (name: string) => void;
  onZoraSync: (slug: string) => void;
  isScraping: boolean;
  isZoraSyncing: boolean;
}) {
  const hasSpotify = artist.externalLinks.some((l) => l.label === "spotify");
  const hasZora = Boolean(artist.zoraHandle);
  const hasImage = Boolean(artist.profileImage);
  const hasReleases = artist.coverArts.length > 0;
  const hasTracks = artist.latestTracks.length > 0;

  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-white/8 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/14 hover:bg-white/[0.035]">
      {/* Avatar */}
      <div className="relative shrink-0">
        {hasImage ? (
          <img src={artist.profileImage!} alt={artist.name} className="h-9 w-9 rounded-full object-cover opacity-80" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[11px] uppercase text-white/30">
            {artist.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/magazine/artists/${artist.slug}`}
            target="_blank"
            className="text-sm tracking-wide text-white/78 hover:text-white transition-colors"
          >
            {artist.name}
          </Link>
          <span className="text-[8px] uppercase tracking-[0.28em] text-white/20">{artist.gridIndex}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {artist.genres.slice(0, 3).map((g) => <Pill key={g} label={g} />)}
          {hasSpotify && <Pill label="spotify" />}
          {hasZora && <Pill label="zora" />}
          {hasReleases && <Pill label={`${artist.coverArts.length} releases`} />}
          {hasTracks && <Pill label={`${artist.latestTracks.length} tracks`} />}
          {!hasSpotify && !hasZora && !hasReleases && <Pill label="no enrichment" dim />}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        {artist.artistTypes.includes("music") && (
          <button
            onClick={() => onScrape(artist.name)}
            disabled={isScraping}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-white/52 transition-all hover:border-white/24 hover:bg-white/[0.07] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Scrape
          </button>
        )}
        {hasZora && (
          <button
            onClick={() => onZoraSync(artist.slug)}
            disabled={isZoraSyncing}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-white/52 transition-all hover:border-white/24 hover:bg-white/[0.07] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Zora
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Log terminal ─────────────────────────────────────────────────────────────

function Terminal({ lines, status }: { lines: LogLine[]; status: ScraperStatus }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  if (lines.length === 0 && status === "idle") return null;

  return (
    <div className="mt-4 rounded-[20px] border border-white/10 bg-black/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <StatusDot status={status} />
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
          {status === "running" ? "Running…" : status === "done" ? "Complete" : status === "error" ? "Error" : "Log"}
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto font-mono text-[11px] leading-5">
        {lines.map((line) => (
          <div key={line.id} className={toneClass(line.tone)}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ music, visual }: { music: ArtistProfile[]; visual: ArtistProfile[] }) {
  const all = [...music, ...visual];
  const withSpotify = music.filter((a) => a.externalLinks.some((l) => l.label === "spotify"));
  const withReleases = music.filter((a) => a.coverArts.length > 0);
  const withImage = all.filter((a) => Boolean(a.profileImage));
  const withZora = all.filter((a) => Boolean(a.zoraHandle));

  const items = [
    { label: "Music", value: music.length },
    { label: "Visual", value: visual.length },
    { label: "Spotify", value: withSpotify.length },
    { label: "Releases", value: withReleases.length },
    { label: "Images", value: withImage.length },
    { label: "Zora", value: withZora.length },
  ];

  return (
    <div className="grid grid-cols-3 gap-px bg-white/6 sm:grid-cols-6">
      {items.map(({ label, value }) => (
        <div key={label} className="bg-black px-4 py-3 text-center">
          <div className="text-lg font-light tracking-tight text-white/80">{value}</div>
          <div className="mt-0.5 text-[8px] uppercase tracking-[0.28em] text-white/28">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function ArtistHQPanel() {
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus>("idle");
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [zoraSyncing, setZoraSyncing] = useState(false);
  const [zoraSyncLog, setZoraSyncLog] = useState<ZoraSyncResult[]>([]);
  const [filter, setFilter] = useState<"all" | "music" | "visual">("all");
  const [search, setSearch] = useState("");

  const allArtists = artistProfiles;

  function applySearch(list: ArtistProfile[]) {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.name.toLowerCase().includes(q) || a.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }

  const filteredMusic = filter !== "visual" ? applySearch(musicArtistProfiles) : [];
  const filteredVisual = filter !== "music" ? applySearch(visualArtistProfiles) : [];
  const totalFiltered = filteredMusic.length + filteredVisual.length;

  function addLog(text: string) {
    setLogLines((prev) => [...prev, mkLog(text)]);
  }

  // ── Run full scraper ──────────────────────────────────────────────────────

  async function runScraper(artists?: string[]) {
    if (scraperStatus === "running") return;
    setScraperStatus("running");
    setLogLines([]);

    try {
      const res = await fetch("/api/admin/artists/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artists ? { artists } : {}),
      });

      if (!res.ok || !res.body) {
        setScraperStatus("error");
        addLog(`HTTP ${res.status} — ${await res.text()}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as { type: string; text?: string };
            if (event.type === "log" && event.text) addLog(event.text);
            if (event.type === "done") setScraperStatus("done");
            if (event.type === "error") { addLog(event.text ?? "Unknown error"); setScraperStatus("error"); }
          } catch {
            addLog(line);
          }
        }
      }

      if (scraperStatus !== "error") setScraperStatus("done");
    } catch (err) {
      setScraperStatus("error");
      addLog(err instanceof Error ? err.message : "Network error");
    }
  }

  // ── Zora sync ────────────────────────────────────────────────────────────

  async function runZoraSync(slug?: string) {
    if (zoraSyncing) return;
    setZoraSyncing(true);
    try {
      const res = await fetch("/api/admin/artists/zora-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slug ? { slug } : {}),
      });
      const data = await res.json() as { synced?: number; failed?: number; results?: ZoraSyncResult[] };
      setZoraSyncLog(data.results ?? []);
    } catch {
      setZoraSyncLog([{ slug: "", identifier: "", status: "failed", message: "Network error" }]);
    } finally {
      setZoraSyncing(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const musicArtistsWithNoScrape = musicArtistProfiles
    .filter((a) => a.coverArts.length === 0 && a.latestTracks.length === 0);

  return (
    <div className="px-4 pb-32 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* ── Header ── */}
        <div className="border-b border-white/6 pb-6 pt-4">
          <p className="text-[8px] uppercase tracking-[0.48em] text-white/22">Owner HQ</p>
          <h1 className="mt-3 [font-family:var(--font-display)] text-[clamp(1.6rem,3.5vw,2.6rem)] leading-[0.88] tracking-[-0.05em] text-white">
            Artist Index
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 tracking-wide text-white/38">
            Full artist index with enrichment controls. Scrape pulls Last.fm, MusicBrainz, and Spotify data. Zora sync pulls profile and embeds from the chain.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/8">
          <StatsBar music={musicArtistProfiles} visual={visualArtistProfiles} />
        </div>

        {/* ── Scraper control ── */}
        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StatusDot status={scraperStatus} />
                <span className="text-[11px] uppercase tracking-[0.26em] text-white/52">Scraper Pipeline</span>
              </div>
              <p className="mt-1 max-w-md text-xs leading-5 text-white/36">
                Last.fm metadata · MusicBrainz links · Spotify recent releases · profile images · top tracks
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runScraper()}
                disabled={scraperStatus === "running"}
                className="rounded-[14px] border border-white/20 bg-white/[0.07] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/80 transition-all hover:border-white/36 hover:bg-white/[0.11] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                {scraperStatus === "running" ? "Running…" : "Run All Artists"}
              </button>
              {musicArtistsWithNoScrape.length > 0 && (
                <button
                  onClick={() => runScraper(musicArtistsWithNoScrape.map((a) => a.name))}
                  disabled={scraperStatus === "running"}
                  className="rounded-[14px] border border-white/12 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/52 transition-all hover:border-white/22 hover:text-white/72 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Run Missing ({musicArtistsWithNoScrape.length})
                </button>
              )}
            </div>
          </div>

          {/* Info cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Pass 1 — Metadata",
                body: "Last.fm bio, genres, tags, similar artists. MusicBrainz social and streaming links. Stored in music-artists.json.",
              },
              {
                label: "Pass 2 — Media",
                body: "Profile image from Last.fm. Top tracks. Spotify recent releases sorted by date. Stored in artist-media-cache.json.",
              },
              {
                label: "Safe merge",
                body: "Manually curated fields are never overwritten. Array fields (tags, links) union-merge. Re-run any time.",
              },
            ].map(({ label, body }) => (
              <div key={label} className="rounded-[20px] border border-white/8 bg-black/30 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
                <p className="mt-2 text-xs leading-5 text-white/52">{body}</p>
              </div>
            ))}
          </div>

          <Terminal lines={logLines} status={scraperStatus} />
        </div>

        {/* ── Zora sync control ── */}
        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-white/52">Zora Sync</div>
              <p className="mt-1 text-xs leading-5 text-white/36">
                Pulls avatar, socials, wallet, and up to 2 embeds per artist with a Zora handle. Writes artist-zora-cache.json.
              </p>
            </div>
            <button
              onClick={() => runZoraSync()}
              disabled={zoraSyncing}
              className="rounded-[14px] border border-white/12 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/52 transition-all hover:border-white/22 hover:text-white/72 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {zoraSyncing ? "Syncing…" : "Sync All Zora"}
            </button>
          </div>

          {zoraSyncLog.length > 0 && (
            <div className="mt-4 space-y-2">
              {zoraSyncLog.map((entry) => (
                <div
                  key={`${entry.slug}-${entry.status}`}
                  className="flex items-center justify-between rounded-[16px] border border-white/8 bg-black/30 px-4 py-2.5"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/52">{entry.slug}</span>
                    <span className="ml-3 text-[10px] text-white/30">{entry.message}</span>
                  </div>
                  <span className={`text-[9px] uppercase tracking-[0.2em] ${entry.status === "synced" ? "text-white/70" : "text-white/30"}`}>
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Artist index ── */}
        <div className="mt-8">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.34em] text-white/28">
                {totalFiltered} / {allArtists.length} artists
              </span>
              <div className="flex gap-1">
                {(["all", "music", "visual"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full border px-3 py-1 text-[8px] uppercase tracking-[0.22em] transition-colors ${
                      filter === f
                        ? "border-white/24 bg-white/[0.06] text-white/78"
                        : "border-white/8 text-white/28 hover:border-white/16 hover:text-white/48"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Search name or genre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/70 placeholder-white/22 outline-none focus:border-white/22 sm:w-52"
            />
          </div>

          {/* Music artists */}
          {filter !== "visual" && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-[0.38em] text-white/30">Music Artists</span>
                <span className="text-[9px] text-white/18">{filteredMusic.length}</span>
              </div>
              <div className="space-y-2">
                {filteredMusic.map((artist) => (
                  <ArtistRow
                    key={artist.slug}
                    artist={artist}
                    onScrape={(name) => runScraper([name])}
                    onZoraSync={(slug) => runZoraSync(slug)}
                    isScraping={scraperStatus === "running"}
                    isZoraSyncing={zoraSyncing}
                  />
                ))}
                {filteredMusic.length === 0 && (
                  <div className="py-6 text-center text-xs text-white/24">No music artists match.</div>
                )}
              </div>
            </div>
          )}

          {/* Visual artists */}
          {filter !== "music" && (
            <div>
              <div className="mb-3 flex items-center gap-3 border-t border-white/6 pt-8">
                <span className="text-[9px] uppercase tracking-[0.38em] text-white/30">Visual Artists</span>
                <span className="text-[9px] text-white/18">{filteredVisual.length}</span>
              </div>
              <div className="space-y-2">
                {filteredVisual.map((artist) => (
                  <ArtistRow
                    key={artist.slug}
                    artist={artist}
                    onScrape={(name) => runScraper([name])}
                    onZoraSync={(slug) => runZoraSync(slug)}
                    isScraping={scraperStatus === "running"}
                    isZoraSyncing={zoraSyncing}
                  />
                ))}
                {filteredVisual.length === 0 && (
                  <div className="py-6 text-center text-xs text-white/24">No visual artists match.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Source files ── */}
        <div className="mt-10 rounded-[24px] border border-white/8 p-5">
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-white/28">Source Files</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "Music artists", path: "content/music-artists.json" },
              { label: "Visual artists", path: "public/data/artists.json" },
              { label: "Media cache", path: "content/artist-media-cache.json" },
              { label: "Zora cache", path: "content/artist-zora-cache.json" },
            ].map(({ label, path }) => (
              <div key={path} className="rounded-[16px] border border-white/6 bg-black/20 px-4 py-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/30">{label}</div>
                <code className="mt-1 block text-[10px] text-white/50">{path}</code>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/28">
            Add new artists directly in those files, then hit <span className="text-white/52">Run All Artists</span> or <span className="text-white/52">Run Missing</span> to enrich them.
          </p>
        </div>

      </div>
    </div>
  );
}
