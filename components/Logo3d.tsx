"use client";

import React, { useEffect, useRef, useState } from "react";
import PrismBackground from "./backgrounds/PrismBackground";

type ModelViewerProgressDetail = {
  totalProgress?: number;
};

type ModelViewerElement = HTMLElement & {
  loaded?: boolean;
};

export default function Logo3D() {
  const modelViewerRef = useRef<ModelViewerElement | null>(null);
  const [viewerDefined, setViewerDefined] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadViewer = async () => {
      if (!customElements.get("model-viewer")) {
        await import("@google/model-viewer");
      }
      if (!cancelled) {
        setViewerDefined(true);
      }
    };

    void loadViewer();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!viewerDefined || !modelViewerRef.current) return;

    const modelViewer = modelViewerRef.current;

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<ModelViewerProgressDetail>).detail;
      const p = Math.round(Math.max(0, Math.min(1, detail?.totalProgress ?? 0)) * 100);
      setProgress((current) => Math.max(current, p));
    };

    const handleLoad = () => {
      setModelLoaded(true);
      setProgress(100);
    };

    const handleError = () => {
      console.error("Failed to load AXIS 3D logo.");
      setModelLoaded(true);
      setProgress(100);
    };

    modelViewer.addEventListener("progress", handleProgress as EventListener);
    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("error", handleError);

    if (modelViewer.loaded) handleLoad();

    return () => {
      modelViewer.removeEventListener("progress", handleProgress as EventListener);
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("error", handleError);
    };
  }, [viewerDefined]);

  // Always fire intro as ready so nothing blocks the page
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("spectra-home-intro", { detail: { ready: true } }),
    );
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
        }}
      />

      {viewerDefined
        ? React.createElement("model-viewer", {
            ref: (node: Element | null) => {
              modelViewerRef.current = node as ModelViewerElement | null;
            },
            src: "/models/logo.glb",
            "auto-rotate": true,
            "auto-rotate-delay": "0",
            "rotation-per-second": "30deg",
            "camera-controls": true,
            "touch-action": "pan-y",
            exposure: "1.2",
            "shadow-intensity": "1",
            "shadow-softness": "0.8",
            "aria-label": "AXIS 3D logo",
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
              background: "transparent",
              opacity: modelLoaded ? 1 : 0,
              transform: modelLoaded ? "scale(1)" : "scale(1.04)",
              transition: "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            },
          })
        : null}

      {/* Progress counter on the GLB — fades out as logo fades in */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.65rem",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.32)",
          userSelect: "none",
          pointerEvents: "none",
          opacity: modelLoaded ? 0 : 1,
          transition: "opacity 700ms ease",
        }}
      >
        {progress}%
      </div>
    </div>
  );
}
