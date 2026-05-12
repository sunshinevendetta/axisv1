"use client";

import React, { useEffect, useRef } from "react";

export default function Membership3D() {
  const modelViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!customElements.get("model-viewer")) {
      import("@google/model-viewer");
    }
  }, []);

  return (
    <model-viewer
      ref={modelViewerRef}
      src="https://api.grove.storage/521f407e89e19337940ffb10c7c17ac84b7f7405e3ebb10e361e2818e2dcee8e"
      ar
      ar-modes="webxr scene-viewer quick-look"
      auto-rotate
      auto-rotate-delay="0"
      rotation-per-second="20deg"
      camera-controls
      touch-action="pan-y"
      exposure="1.0"
      shadow-intensity="1.2"
      shadow-softness="0.8"
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <button
        slot="ar-button"
        className="group absolute top-6 right-6 z-50 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/20 to-white/10 shadow-2xl backdrop-blur-md transition-all duration-500 hover:from-white hover:to-white/90 active:scale-95"
        style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
      >
        <span className="text-4xl drop-shadow-lg">👁️</span>
        <span className="mt-0.5 text-xs font-medium tracking-wider text-white/90">AR</span>
        <span className="pointer-events-none absolute top-1/2 right-full mr-6 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-black/90 px-5 py-3 text-sm font-medium text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:opacity-100">
          View in Your Space
        </span>
      </button>
    </model-viewer>
  );
}
