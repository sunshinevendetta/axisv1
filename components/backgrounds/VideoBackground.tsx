"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function VideoBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "/video/backgrounds/membershipbg.webm", type: "video/webm" },
        { src: "/video/backgrounds/membershipbg.mp4", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "/video/backgrounds/membershipbgv.webm", type: "video/webm" },
        { src: "/video/backgrounds/membershipbgv.mp4", type: "video/mp4" },
      ]}
    />
  );
}
