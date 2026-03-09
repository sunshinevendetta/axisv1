"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function PrismaticBurstBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "/video/backgrounds/episodesbg.webm", type: "video/webm" },
        { src: "/video/backgrounds/episodesbg.mp4", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "/video/backgrounds/episodesbgv.webm", type: "video/webm" },
        { src: "/video/backgrounds/episodesbgv.mp4", type: "video/mp4" },
      ]}
    />
  );
}
