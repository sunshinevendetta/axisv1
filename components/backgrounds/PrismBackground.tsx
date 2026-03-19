"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function PrismBackground() {
  return (
    <LazyVideoBackground
      priority
      desktopSources={[
        { src: "https://api.grove.storage/63346bcc8548376062c518c0683a08776a4e0c652a15c25ce20dd43b039260d0", type: "video/webm" },
        { src: "https://api.grove.storage/f674bc8294fb021623e52f7bc90535c80db57c21fae6fa471e4a6b38696bd1c8", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/7dc242bcdbf80cca4b596be39d695bd4c38b59813579330a462032283825315d", type: "video/webm" },
        { src: "https://api.grove.storage/74e2492379aa4c8e65a21e3912747f73906b63597d65109ce8c47695116486b4", type: "video/mp4" },
      ]}
    />
  );
}
