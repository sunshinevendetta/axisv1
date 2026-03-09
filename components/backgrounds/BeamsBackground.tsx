"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function BeamsBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "/video/backgrounds/submitbg.webm", type: "video/webm" },
        { src: "/video/backgrounds/submitbg.mp4", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "/video/backgrounds/submitbgv.webm", type: "video/webm" },
        { src: "/video/backgrounds/submitbgv.mp4", type: "video/mp4" },
      ]}
    />
  );
}
