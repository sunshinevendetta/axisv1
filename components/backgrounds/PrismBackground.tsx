"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function PrismBackground() {
  return (
    <LazyVideoBackground
      priority
      desktopSources={[
        { src: "/video/backgrounds/herobg.webm", type: "video/webm" },
        { src: "/video/backgrounds/herobg.mp4", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "/video/backgrounds/herobgv.webm", type: "video/webm" },
        { src: "/video/backgrounds/herobgv.mp4", type: "video/mp4" },
      ]}
    />
  );
}
