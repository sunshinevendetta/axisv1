"use client";

import LazyVideoBackground from "./LazyVideoBackground";

export default function AboutBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "https://api.grove.storage/a9ea923e4eb6dbebd26f7553d53f1aca0a2bb756a689f12802333a335bd08201", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/b4307957431c62d268d6c8a3e8bf127d603bd7548efd9a99b09f3725e83d2710", type: "video/mp4" },
      ]}
    />
  );
}
