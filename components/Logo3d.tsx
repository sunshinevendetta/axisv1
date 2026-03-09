"use client";

import React, { useEffect, useState } from "react";
import PrismBackground from "./backgrounds/PrismBackground";

export default function Logo3D() {
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const runWhenIdle = (cb: () => void) => {
      const win = window as Window & {
        requestIdleCallback?: (callback: () => void) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (win.requestIdleCallback) {
        const idleId = win.requestIdleCallback(cb);
        return () => win.cancelIdleCallback?.(idleId);
      }
      const timeoutId = window.setTimeout(cb, 700);
      return () => window.clearTimeout(timeoutId);
    };

    return runWhenIdle(() => {
      if (!customElements.get("model-viewer")) {
        import("@google/model-viewer");
      }
      setShowModel(true);
    });
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <PrismBackground />

      {showModel &&
        React.createElement("model-viewer", {
          src: "/models/logo.glb",
          ar: true,
          "ar-modes": "webxr scene-viewer quick-look",
          "auto-rotate": true,
          "auto-rotate-delay": "0",
          "rotation-per-second": "30deg",
          "camera-controls": true,
          "touch-action": "pan-y",
          exposure: "1.2",
          "shadow-intensity": "1",
          "shadow-softness": "0.8",
          "aria-label": "SPECTRA 3D Logo",
          style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
            background: "transparent",
          },
          children: React.createElement("button", {
            slot: "ar-button",
            style: {
              position: "absolute",
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "7px 5px",
              background: "rgba(255,255,255,0.95)",
              color: "black",
              border: "none",
              borderRadius: "10px",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
              zIndex: 100,
            },
            children: "👁️ View in Your Space",
          }),
        })}
    </div>
  );
}
