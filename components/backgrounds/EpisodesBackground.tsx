"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function PrismaticBurstBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "https://api.grove.storage/0034bdaaa9e18c8a0da85ef8278c36e9840e3b3e56ea0b4c1c06060d2328a071", type: "video/webm" },
        { src: "https://api.grove.storage/df18f4b650770aa9f916da66420ad8905a535b98073a246f5bdd3c8dfe2c808f", type: "video/mp4" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/30e4a75a1a1305ec8c8f07265407ac20ed056aca96d0bb65c19daac44eb33b7d", type: "video/webm" },
        { src: "https://api.grove.storage/d05de30f0a34e9f07d0945f37e28b6ad7763f8ca81f4cdc5b336d4fb59fdf4ce", type: "video/mp4" },
      ]}
    />
  );
}
