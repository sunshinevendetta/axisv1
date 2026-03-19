// components/EpisodeGrid.tsx
"use client";

import React from "react";
import ChromaGrid from "./ChromaGrid";
import EpisodesCards from "./EpisodesCards";
import { type EpisodeCard as Episode } from "@/src/lib/episodes";

type Props = {
  episodes: Episode[];
  activeEpisode: number | null;
  setActiveEpisode: (id: number | null) => void;
};

export default function EpisodeGrid({ episodes, activeEpisode, setActiveEpisode }: Props) {
  const items = episodes.map((ep) => ({
    image: ep.image,
    title: ep.title,
    subtitle: ep.subtitle,

    // episode 1 should NOT display status
    handle: ep.id === 1 ? "" : ep.status,

    // episode 1 should NOT use available colors
    borderColor: ep.id === 1 ? "#ffffff" : "#333333",
    gradient:
      ep.id === 1
        ? "linear-gradient(145deg, #ffffff, #000000)"
        : "linear-gradient(145deg, #444444, #000000)",

    url: "#",
    episodeId: ep.id,
  }));

  return (
    <div className="relative w-full flex flex-col items-center mt-20 overflow-x-hidden">
      {activeEpisode === null && (
        <div
          style={{
            height: "600px",
            position: "relative",
            width: "100%",
            maxWidth: "100vw",
            overflow: "hidden",
          }}
        >
          <ChromaGrid
            items={items}
            radius={200}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
            onItemClick={(index: number) => setActiveEpisode(episodes[index].id)}
          />
        </div>
      )}

      {activeEpisode !== null && (
        <div className="w-full">
          <EpisodesCards initialOpenId={activeEpisode} onClose={() => setActiveEpisode(null)} episodes={episodes} />
        </div>
      )}
    </div>
  );
}
