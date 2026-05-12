"use client";

import { useState } from "react";

export type ModalItem = {
  type: "release" | "track" | "video" | "mix" | "vinyl";
  title: string;
  subtitle: string | null;
  coverImage: string | null;
  year: string | null;
  itemType: string | null;
  spotifyTrackId: string | null;
  spotifyUrl: string | null;
  youtubeVideoId: string | null;
  mixcloudKey: string | null;
  bandcampEmbedHtml: string | null;
  externalUrl: string;
};

export type CoverArtModalProps = {
  open: boolean;
  onClose: () => void;
  item: ModalItem | null;
  spotifyToken: string | null;
};

function platformLabel(url: string): string {
  if (url.includes("spotify.com")) return "Spotify";
  if (url.includes("soundcloud.com")) return "SoundCloud";
  if (url.includes("bandcamp.com")) return "Bandcamp";
  if (url.includes("mixcloud.com")) return "Mixcloud";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("apple.com")) return "Apple Music";
  if (url.includes("tidal.com")) return "Tidal";
  if (url.includes("deezer.com")) return "Deezer";
  return "Link";
}

function onConnectSpotify() {
  window.location.href = "/api/spotify/auth";
}

export function CoverArtModal({ open, onClose, item, spotifyToken }: CoverArtModalProps) {
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!open || !item) return null;

  async function handlePlay() {
    if (!spotifyToken || !item?.spotifyTrackId) return;
    setPlaying(true);
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [`spotify:track:${item.spotifyTrackId}`] }),
      });
    } finally {
      setPlaying(false);
    }
  }

  async function handleSave() {
    if (!spotifyToken || !item?.spotifyTrackId) return;
    setSaving(true);
    try {
      await fetch(`https://api.spotify.com/v1/me/tracks?ids=${item.spotifyTrackId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });
    } finally {
      setSaving(false);
    }
  }

  const isConnected = Boolean(spotifyToken);
  const hasSpotifyAction = isConnected && Boolean(item.spotifyTrackId);
  const platform = platformLabel(item.externalUrl);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-black border-t border-white/12 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[520px] sm:border-t-0 sm:border-l">
        <div className="px-6 pb-10 pt-6 sm:px-7 sm:pt-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              {item.itemType ? (
                <p className="text-[8px] uppercase tracking-[0.44em] text-white/22">
                  {item.itemType}
                </p>
              ) : null}
              <h2 className="mt-2 [font-family:var(--font-display)] text-2xl leading-[0.9] tracking-[-0.05em] text-white">
                {item.title}
              </h2>
              {item.subtitle ? (
                <p className="mt-1.5 text-[11px] tracking-wide text-white/46">
                  {item.subtitle}
                  {item.year ? <span className="ml-2 text-white/28">{item.year}</span> : null}
                </p>
              ) : item.year ? (
                <p className="mt-1.5 text-[11px] tracking-wide text-white/28">{item.year}</p>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="mt-1 shrink-0 text-[10px] uppercase tracking-[0.3em] text-white/32 transition-colors hover:text-white/70"
            >
              Close
            </button>
          </div>

          <div className="mb-7">
            {item.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${item.youtubeVideoId}?autoplay=0`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : item.mixcloudKey ? (
              <iframe
                src={`https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(item.mixcloudKey)}&light=1`}
                className="w-full h-[120px]"
              />
            ) : item.bandcampEmbedHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: item.bandcampEmbedHtml }}
                className="w-full"
              />
            ) : item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full aspect-square object-cover opacity-88"
              />
            ) : (
              <div className="w-full aspect-square bg-white/[0.04] border border-white/8" />
            )}
          </div>

          <div className="space-y-2.5 mb-8">
            {hasSpotifyAction ? (
              <>
                <button
                  onClick={handlePlay}
                  disabled={playing}
                  className="block w-full border border-white/12 py-3 text-center text-[9px] uppercase tracking-[0.34em] text-white/60 transition-colors hover:border-white/28 hover:text-white/90 disabled:opacity-40"
                >
                  {playing ? "Opening…" : "▶ Play on Spotify"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="block w-full border border-white/8 py-3 text-center text-[9px] uppercase tracking-[0.34em] text-white/36 transition-colors hover:border-white/18 hover:text-white/70 disabled:opacity-40"
                >
                  {saving ? "Saving…" : "+ Save to Library"}
                </button>
              </>
            ) : (
              <>
                <a
                  href={item.spotifyUrl ?? item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full border border-white/12 py-3 text-center text-[9px] uppercase tracking-[0.34em] text-white/46 transition-colors hover:border-white/28 hover:text-white/78"
                >
                  Listen on Spotify ↗
                </a>
                <button
                  onClick={onConnectSpotify}
                  className="block w-full border border-white/8 py-3 text-center text-[9px] uppercase tracking-[0.34em] text-white/28 transition-colors hover:text-white/60"
                >
                  Connect Spotify to play full track
                </button>
              </>
            )}
          </div>

          <div className="border-t border-white/8 pt-6">
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[9px] uppercase tracking-[0.28em] text-white/28 transition-colors hover:text-white/60"
            >
              Open in {platform} ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
