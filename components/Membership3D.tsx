"use client";

import React, { useEffect, useRef } from "react";

export default function Membership3D() {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!customElements.get("model-viewer")) {
      import("@google/model-viewer");
    }
  }, []);

  return React.createElement("model-viewer", {
    ref: modelViewerRef,
    src: "https://api.grove.storage/521f407e89e19337940ffb10c7c17ac84b7f7405e3ebb10e361e2818e2dcee8e",
    ar: true,
    "ar-modes": "webxr scene-viewer quick-look",
    "auto-rotate": true,
    "auto-rotate-delay": "0",
    "rotation-per-second": "20deg",
    "camera-controls": true,
    "touch-action": "pan-y",
    exposure: "1.0",
    "shadow-intensity": "1.2",
    "shadow-softness": "0.8",
    style: {
      width: "100%",
      height: "100%",
      background: "transparent",
    },
    children: React.createElement("button", {
      slot: "ar-button",
      className: "group absolute top-6 right-6 w-16 h-16 flex flex-col items-center justify-center bg-gradient-to-br from-white/20 to-white/10 hover:from-white hover:to-white/90 active:scale-95 rounded-full transition-all duration-500 shadow-2xl backdrop-blur-md border border-white/30 z-50",
      style: { animation: "pulse-glow 4s ease-in-out infinite" },
      children: [
        React.createElement("span", {
          key: "eye-icon",
          className: "text-4xl drop-shadow-lg",
          children: "👁️"
        }),
        React.createElement("span", {
          key: "ar-label",
          className: "text-xs font-medium mt-0.5 text-white/90 tracking-wider",
          children: "AR"
        }),
        React.createElement("span", {
          key: "tooltip",
          className: "absolute opacity-0 group-hover:opacity-100 whitespace-nowrap right-full mr-6 px-5 py-3 bg-black/90 text-white text-sm font-medium rounded-xl pointer-events-none transition-all duration-300 top-1/2 -translate-y-1/2 shadow-2xl border border-white/10",
          children: "View in Your Space"
        })
      ]
    })
  });
}
