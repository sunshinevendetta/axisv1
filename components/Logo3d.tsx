"use client";

import React, { useEffect, useRef, useState } from "react";
import PrismBackground from "./backgrounds/PrismBackground";

const PROGRESS_TICK_MS = 24;
const REVEAL_HOLD_MS = 260;

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
  const [targetProgress, setTargetProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);

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
    if (!viewerDefined || !modelViewerRef.current) {
      return;
    }

    const modelViewer = modelViewerRef.current;

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<ModelViewerProgressDetail>).detail;
      const progress = Math.max(0, Math.min(0.99, detail?.totalProgress ?? 0));
      const nextTarget = Math.round(progress * 100);
      setTargetProgress((current) => Math.max(current, nextTarget));
    };

    const handleLoad = () => {
      setModelLoaded(true);
      setTargetProgress(100);
    };

    const handleError = () => {
      console.error("Failed to load SPECTRA 3D logo.");
      setModelLoaded(true);
      setTargetProgress(100);
    };

    modelViewer.addEventListener("progress", handleProgress as EventListener);
    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("error", handleError);

    if (modelViewer.loaded) {
      handleLoad();
    }

    return () => {
      modelViewer.removeEventListener("progress", handleProgress as EventListener);
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("error", handleError);
    };
  }, [viewerDefined]);

  useEffect(() => {
    if (displayedProgress >= targetProgress) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedProgress((current) => {
        if (current >= targetProgress) {
          return current;
        }

        return Math.min(targetProgress, current + 1);
      });
    }, PROGRESS_TICK_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [displayedProgress, targetProgress]);

  useEffect(() => {
    if (!modelLoaded || displayedProgress < 100) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIntroComplete(true);
    }, REVEAL_HOLD_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [displayedProgress, modelLoaded]);

  // Lock scroll during the loading intro, unlock when done
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("spectra-home-intro", {
        detail: { ready: introComplete },
      }),
    );
  }, [introComplete]);

  useEffect(() => {
    if (introComplete) {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introComplete]);

  const showSite = introComplete;
  const progressLabel = `${displayedProgress}%`;

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
            "aria-label": "SPECTRA 3D Logo",
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: showSite ? "auto" : "none",
              background: "transparent",
              opacity: showSite ? 1 : 0,
              transform: showSite ? "scale(1)" : "scale(1.04)",
              transition: "opacity 700ms ease, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            },
          })
        : null}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          pointerEvents: showSite ? "none" : "auto",
          opacity: showSite ? 0 : 1,
          transition: "opacity 650ms ease",
        }}
      >
        <div
          key={progressLabel}
          style={{
            fontSize: "clamp(4.5rem, 16vw, 12rem)",
            fontFamily: "var(--font-display)",
            lineHeight: 0.8,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.97)",
            textShadow: "0 0 32px rgba(255,255,255,0.1)",
            animation: "spectra-progress-in 180ms linear",
            userSelect: "none",
          }}
        >
          {displayedProgress}<span style={{ fontSize: "0.32em", verticalAlign: "baseline" }}>%</span>
        </div>

        <style>{`
          @keyframes spectra-progress-in {
            0% {
              opacity: 0.35;
              transform: translateY(0.04em);
              filter: blur(6px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
