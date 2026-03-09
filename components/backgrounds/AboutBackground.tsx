"use client";

import LazyVideoBackground from "./LazyVideoBackground";

export default function AboutBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "/video/backgrounds/aboutbg.mp4", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "/video/backgrounds/aboutbgv.mp4", type: "video/mp4" },
      ]}
    />
  );
}
