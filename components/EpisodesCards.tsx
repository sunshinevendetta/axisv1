"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSiteLanguage, type SiteLanguage } from "@/components/site-language";
import ChromaGrid from "./ChromaGrid";
import { getEpisodeCards, type EpisodeCard as Episode, type EpisodeMeta } from "@/src/lib/episodes";
import { getSiteCopy, type SiteCopy } from "@/src/lib/site-translations";

const EpisodeViewer = dynamic(
  () => import("@/components/episodes/EpisodeViewer").then((mod) => ({ default: mod.EpisodeViewer })),
  { ssr: false },
);

type ActiveFilter = { type: "tag" | "music" | "ally"; value: string } | null;

function EpisodeMetaBlock({
  meta,
  onFilter,
  copy,
  language,
}: {
  meta: EpisodeMeta;
  onFilter?: (type: "tag" | "music" | "ally", value: string) => void;
  copy: SiteCopy;
  language: SiteLanguage;
}) {
  const [showSecondary, setShowSecondary] = useState(false);
  const primaryDescription = language === "es" ? meta.es ?? meta.en : meta.en;
  const secondaryDescription = language === "es" ? meta.en : meta.es;
  const clickable = "cursor-pointer transition-colors hover:text-white/70";

  return (
    <div className="space-y-4">
      {primaryDescription ? (
        <p className="text-xs leading-5 tracking-wide text-white/48 sm:text-[0.8rem] sm:leading-[1.55]">
          {primaryDescription}
        </p>
      ) : null}

      {secondaryDescription ? (
        <div>
          <button
            onClick={() => setShowSecondary((value) => !value)}
            className="text-[9px] uppercase tracking-[0.3em] text-white/28 transition-colors hover:text-white/50"
          >
            {showSecondary ? copy.episodes.hideSpanish : copy.episodes.showSpanish}
          </button>
          {showSecondary ? (
            <p className="mt-2 text-xs leading-5 tracking-wide text-white/36 sm:text-[0.8rem] sm:leading-[1.55]">
              {secondaryDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      {meta.music && meta.music.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.36em] text-white/24">
            {copy.episodes.music}
          </p>
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
      ) : null}

      {meta.allies && meta.allies.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.36em] text-white/24">
            {copy.episodes.allies}
          </p>
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
      ) : null}

      {meta.tags && meta.tags.length > 0 ? (
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
      ) : null}
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
  const { language } = useSiteLanguage();
  const copy = getSiteCopy(language);

  const [openId, setOpenId] = useState<number | null>(initialOpenId);
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

  const allEpisodes: Episode[] =
    episodesProp && episodesProp.length > 0 ? episodesProp : getEpisodeCards();

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
    handle: ep.status === "locked" ? copy.episodes.lockedHandle : ep.status === "archived" ? copy.episodes.archivedHandle : "",
    borderColor: ep.status === "open" ? "#ffffff" : ep.status === "archived" ? "#777777" : "#333333",
    gradient:
      ep.status === "open"
        ? "linear-gradient(145deg, #ffffff, #000000)"
        : ep.status === "archived"
          ? "linear-gradient(145deg, #777777, #050505)"
        : "linear-gradient(145deg, #444444, #000000)",
    url: "",
    episodeId: ep.id,
    description: ep.status !== "locked" ? ep.summary : undefined,
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
          <button
            onClick={() => {
              setOpenId(null);
              if (onClose) onClose();
            }}
            className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/38 transition-colors hover:text-white/70"
          >
            <span>←</span> {copy.episodes.back}
          </button>

          <div className="border border-white/8 bg-transparent text-white">
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

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.32em] text-white/36">
                <span>{ep.subtitle}</span>
                <span className="text-white/18">·</span>
                <span>{ep.city}</span>
                <span className="text-white/18">·</span>
                <span>{ep.venueName}</span>
              </div>

              <h2 className="mb-5 [font-family:var(--font-display)] text-base leading-[0.94] tracking-[-0.04em] sm:text-lg">
                {ep.title}
              </h2>

              <div className="mb-5 h-px w-full bg-white/8" />

              <p className="mb-5 text-xs leading-5 tracking-wide text-white/62 sm:text-sm sm:leading-[1.55]">
                {ep.summary}
              </p>

              {ep.meta ? (
                <EpisodeMetaBlock meta={ep.meta} onFilter={handleFilter} copy={copy} language={language} />
              ) : ep.description && ep.description !== ep.summary ? (
                <p className="text-xs leading-5 tracking-wide text-white/40 sm:text-[0.8rem] sm:leading-[1.55]">
                  {ep.description}
                </p>
              ) : null}

              <div className="mt-6 mb-6 h-px w-full bg-white/8" />

              {hasLumaButton && ep.status === "open" ? (
                <a
                  href={ep.lumaUrl ?? `https://luma.com/event/${ep.lumaEvent}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luma-checkout--button inline-block border border-white/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white transition-colors hover:border-white/50 hover:text-white sm:text-[11px]"
                  data-luma-action="checkout"
                  data-luma-event-id={ep.lumaEvent}
                >
                  {copy.episodes.collectNow}
                </a>
              ) : ep.status === "archived" ? (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/32">
                  {copy.episodes.archived}
                </p>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/32">
                  {copy.episodes.locked}
                </p>
              )}

              <div className="mt-6 mb-6 h-px w-full bg-white/8" />

              <div className="flex flex-wrap gap-3">
                <a
                  href={`/episodes/${ep.slug}/dj-sets`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  {copy.episodes.listenCollect}
                </a>
                <a
                  href={`/episodes/${ep.slug}/artwork`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  {copy.episodes.artwork}
                </a>
                <a
                  href={`/episodes/${ep.slug}/gallery`}
                  className="inline-block border border-white/12 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-white/40 transition-colors hover:border-white/30 hover:text-white/70 sm:text-[11px]"
                >
                  {copy.episodes.gallery}
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
      ? copy.episodes.tag
      : activeFilter?.type === "music"
        ? copy.episodes.artist
        : activeFilter?.type === "ally"
          ? copy.episodes.ally
          : null;

  return (
    <div className="mt-12 w-full overflow-x-hidden px-4 pb-20 sm:mt-16 sm:px-6">
      {activeFilter && filterLabel ? (
        <div className="mx-auto mb-8 flex max-w-[1000px] items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/30">{filterTypeLabel}</span>
          <span className="border border-white/18 px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-white/60">
            {filterLabel}
          </span>
          <button
            onClick={() => setActiveFilter(null)}
            className="text-[9px] uppercase tracking-[0.3em] text-white/24 transition-colors hover:text-white/50"
          >
            {copy.episodes.clear}
          </button>
          <span className="text-[9px] text-white/20">
            {episodes.length} {episodes.length !== 1 ? copy.episodes.episodePlural : copy.episodes.episodeSingular}
          </span>
        </div>
      ) : null}

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
