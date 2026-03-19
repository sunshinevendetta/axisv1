"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import ChromaGrid from "./ChromaGrid";
import { getEpisodeCards, type EpisodeCard as Episode, type EpisodeMeta } from "@/src/lib/episodes";

const EpisodeViewer = dynamic(
  () => import("@/components/episodes/EpisodeViewer").then((mod) => ({ default: mod.EpisodeViewer })),
  { ssr: false },
);

type ActiveFilter = { type: "tag" | "music" | "ally"; value: string } | null;

function EpisodeMetaBlock({
  meta,
  onFilter,
}: {
  meta: EpisodeMeta;
  onFilter?: (type: "tag" | "music" | "ally", value: string) => void;
}) {
  const [showEs, setShowEs] = useState(false);

  const clickable = "cursor-pointer transition-colors hover:text-white/70";

  return (
    <div className="space-y-4">
      {/* English description */}
      {meta.en && (
        <p className="text-xs leading-5 tracking-wide text-white/48 sm:text-[0.8rem] sm:leading-[1.55]">
          {meta.en}
        </p>
      )}

      {/* Spanish toggle */}
      {meta.es && (
        <div>
          <button
            onClick={() => setShowEs((v) => !v)}
            className="text-[9px] uppercase tracking-[0.3em] text-white/28 transition-colors hover:text-white/50"
          >
            {showEs ? "hide es −" : "ver en español +"}
          </button>
          {showEs && (
            <p className="mt-2 text-xs leading-5 tracking-wide text-white/36 sm:text-[0.8rem] sm:leading-[1.55]">
              {meta.es}
            </p>
          )}
        </div>
      )}

      {/* Music */}
      {meta.music && meta.music.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.36em] text-white/24">music</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {meta.music.map((handle) => (
              <button
                key={handle}
                onClick={() => onFilter?.("music", handle)}
                className={`text-[10px] tracking-wide text-white/44 ${clickable}`}
              >
                {handle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Allies */}
      {meta.allies && meta.allies.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.36em] text-white/24">allies</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {meta.allies.map((name) => (
              <button
                key={name}
                onClick={() => onFilter?.("ally", name)}
                className={`text-[10px] tracking-wide text-white/44 ${clickable}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {meta.tags && meta.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {meta.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onFilter?.("tag", tag)}
              className="border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] text-white/30 transition-colors hover:border-white/28 hover:text-white/55"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type EpisodesCardsProps = {
  episodes?: Episode[];
  initialOpenId?: number | null;
  onClose?: () => void;
};

export default function EpisodesCards(props: EpisodesCardsProps) {
  const { episodes: episodesProp, initialOpenId = null, onClose } = props;

  const [openId, setOpenId] = useState<number | null>(initialOpenId);
  const [fetchedEpisodes, setFetchedEpisodes] = useState<Episode[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

  useEffect(() => {
    setOpenId(initialOpenId);
  }, [initialOpenId]);

  useEffect(() => {
    const existing = document.getElementById("luma-checkout-script");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://embed.lu.ma/checkout-button.js";
      script.id = "luma-checkout-script";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (episodesProp && episodesProp.length > 0) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/episodes", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load episodes.");
        }

        const data = (await response.json()) as { episodes: Episode[] };
        setFetchedEpisodes(data.episodes);
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
      });

    return () => controller.abort();
  }, [episodesProp]);

  const allEpisodes: Episode[] = useMemo(() => {
    if (episodesProp && episodesProp.length > 0) return episodesProp;
    if (fetchedEpisodes && fetchedEpisodes.length > 0) return fetchedEpisodes;
    return getEpisodeCards();
  }, [episodesProp, fetchedEpisodes]);

  const episodes = useMemo(() => {
    if (!activeFilter) return allEpisodes;
    return allEpisodes.filter((ep) => {
      if (!ep.meta) return false;
      if (activeFilter.type === "tag") return ep.meta.tags?.includes(activeFilter.value);
      if (activeFilter.type === "music") return ep.meta.music?.includes(activeFilter.value);
      if (activeFilter.type === "ally") return ep.meta.allies?.includes(activeFilter.value);
      return false;
    });
  }, [allEpisodes, activeFilter]);

  const handleFilter = (type: "tag" | "music" | "ally", value: string) => {
    setActiveFilter({ type, value });
    setOpenId(null);
  };

  const chromaItems = episodes.map((ep) => ({
    image: ep.image,
    title: ep.title,
    subtitle: ep.subtitle,
    handle: ep.status === "locked" ? "locked" : "",
    borderColor: ep.status === "open" ? "#ffffff" : "#333333",
    gradient:
      ep.status === "open"
        ? "linear-gradient(145deg, #ffffff, #000000)"
        : "linear-gradient(145deg, #444444, #000000)",
    url: "",
    episodeId: ep.id,
    description: ep.status === "open" ? ep.summary : undefined,
  }));

  const handleCardClick = (index: number) => {
    const ep = episodes[index];
    if (ep.status !== "locked") setOpenId(ep.id);
  };

  if (openId !== null) {
    const ep = allEpisodes.find((episode) => episode.id === openId);
    if (!ep) return null;

    const hasLumaButton = Boolean(ep.lumaEvent);

    return (
      <div className="w-full px-4 pt-10 pb-24 sm:px-6">
        <div className="mx-auto max-w-3xl">

          {/* Back */}
          <button
            onClick={() => { setOpenId(null); if (onClose) onClose(); }}
            className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/38 transition-colors hover:text-white/70"
          >
            <span>←</span> episodes
          </button>

          {/* Card */}
          <div className="border border-white/8 bg-transparent text-white">

            {/* Image — square 1:1 to match Luma CDN format */}
            <div className="border-b border-white/8">
              {ep.status === "open" ? (
                <EpisodeViewer asset={ep.viewerAsset} title={ep.title} />
              ) : (
                <Image
                  src={ep.image}
                  alt={ep.title}
                  width={800}
                  height={800}
                  className={`h-auto w-full object-cover ${ep.status === "locked" ? "opacity-30" : "opacity-100"}`}
                  style={{ aspectRatio: "1 / 1" }}
                />
              )}
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">

              {/* Meta row */}
              <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.32em] text-white/36">
                <span>{ep.subtitle}</span>
                <span className="text-white/18">·</span>
                <span>{ep.city}</span>
                <span className="text-white/18">·</span>
                <span>{ep.venueName}</span>
              </div>

              {/* Title */}
              <h2 className="mb-5 [font-family:var(--font-display)] text-base leading-[0.94] tracking-[-0.04em] sm:text-lg">
                {ep.title}
              </h2>

              {/* Divider */}
              <div className="mb-5 h-px w-full bg-white/8" />

              {/* Summary */}
              <p className="mb-5 text-xs leading-5 tracking-wide text-white/62 sm:text-sm sm:leading-[1.55]">
                {ep.summary}
              </p>

              {ep.meta ? (
                <EpisodeMetaBlock meta={ep.meta} onFilter={handleFilter} />
              ) : ep.description && ep.description !== ep.summary ? (
                <p className="text-xs leading-5 tracking-wide text-white/40 sm:text-[0.8rem] sm:leading-[1.55]">
                  {ep.description}
                </p>
              ) : null}

              {/* Divider */}
              <div className="mt-6 mb-6 h-px w-full bg-white/8" />

              {/* CTA */}
              {hasLumaButton ? (
                <a
                  href={ep.lumaUrl ?? `https://luma.com/event/${ep.lumaEvent}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luma-checkout--button inline-block border border-white/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white transition-colors hover:border-white/50 hover:text-white sm:text-[11px]"
                  data-luma-action="checkout"
                  data-luma-event-id={ep.lumaEvent}
                >
                  Register For Event →
                </a>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/32">
                  Details unlock closer to the event.
                </p>
              )}

              {/* Divider */}
              <div className="mt-6 mb-6 h-px w-full bg-white/8" />

              {/* Episode archive links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/episodes/${ep.slug}/dj-sets`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  Listen · Collect DJ Sets
                </a>
                <a
                  href={`/episodes/${ep.slug}/artwork`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  View Artwork
                </a>
                <a
                  href={`/episodes/${ep.slug}/gallery`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  View Photo Gallery
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filterLabel =
    activeFilter?.type === "tag"
      ? activeFilter.value
      : activeFilter?.type === "music"
        ? activeFilter.value
        : activeFilter?.type === "ally"
          ? activeFilter.value
          : null;

  const filterTypeLabel =
    activeFilter?.type === "tag"
      ? "tag"
      : activeFilter?.type === "music"
        ? "artist"
        : activeFilter?.type === "ally"
          ? "ally"
          : null;

  return (
    <div className="mt-12 w-full overflow-x-hidden px-4 pb-20 sm:mt-16 sm:px-6">

      {/* Active filter bar */}
      {activeFilter && filterLabel && (
        <div className="mx-auto mb-8 flex max-w-[1000px] items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/30">{filterTypeLabel}</span>
          <span className="border border-white/18 px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-white/60">
            {filterLabel}
          </span>
          <button
            onClick={() => setActiveFilter(null)}
            className="text-[9px] uppercase tracking-[0.3em] text-white/24 transition-colors hover:text-white/50"
          >
            clear ×
          </button>
          <span className="text-[9px] text-white/20">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <ChromaGrid
        items={chromaItems}
        radius={170}
        damping={0.3}
        fadeOut={0.35}
        ease="power3.out"
        rows={2}
        columns={3}
        className="mx-auto max-w-[1000px]"
        onItemClick={handleCardClick}
      />

    </div>
  );
}
