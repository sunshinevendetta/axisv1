"use client";
import LazyVideoBackground from "./LazyVideoBackground";

export default function SubmissionBackground() {
  return (
    <LazyVideoBackground
      desktopSources={[
        { src: "https://api.grove.storage/931006e36c603cafa9e83219f5aed7699140941bb5f9b339d7741edda19affae", type: "video/mp4" },
        { src: "https://api.grove.storage/a81650f15e82d04afed0e5146a783b7a0ece73372c59da493003b5d3abb8df7e", type: "video/webm" },
      ]}
      mobileSources={[
        { src: "https://api.grove.storage/49b3ea1acf81f4b4cbe5d8ebe185f0e7cd4625a9589173db1a308151a3f4e6b3", type: "video/mp4" },
        { src: "https://api.grove.storage/327508eaee5d8fbb8de6c7a69c047d5de609bdb5fc2118e3c5a3a79146dec1cd", type: "video/webm" },
      ]}
    />
  );
}
