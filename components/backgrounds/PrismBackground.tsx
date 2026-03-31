"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function PrismBackground() {
  return (
    <LazyVideoBackground
      delayMs={1800}
      desktopSources={[
        { src: "https://api.grove.storage/dd0a68c41a716c9cf954fa12f03415a457a051212af39133d62e86ee22cdfe08", type: "video/webm" },
        { src: "https://api.grove.storage/00e8205c3ac1af52b8d08d98cc748383cb9f57f53182a955be8994f49e909cdd", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/28febb509f65386acb35444a24f36f01c626d7d63ea4ee3b42cb515b4c0f2565", type: "video/webm" },
        { src: "https://api.grove.storage/b64a987a591ff41d25e635b9e59ffbec6c6e4a8f9982f2a7122c2d6db3fcfe41", type: "video/mp4" },
      ]}
    />
  );
}
