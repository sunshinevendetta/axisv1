"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function VideoBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "https://api.grove.storage/eec9f2f072d999ccb98e9b9ed7d523e74950a6e81d9b10bdb351d954018eb70d", type: "video/mp4" },
        { src: "https://api.grove.storage/af9b2b4faf283921cc653789c4d88fa79bd0aa03761176fbce433046e8c4ba45", type: "video/webm" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/14b839b68046937cbf92bca65a8497bda0d69f4091023a979433f0a1a146b3af", type: "video/mp4" },
        { src: "https://api.grove.storage/3042c613316d9dc34841d9b6ac1c962e8eb53e7152e34986b5f3fb3683a8fe56", type: "video/webm" },
      ]}
    />
  );
}
