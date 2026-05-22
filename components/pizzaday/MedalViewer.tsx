"use client";

import { createElement, useEffect, useState, type CSSProperties } from "react";
import type { MedalDescriptor } from "@/src/lib/pizzaday-medals";

/**
 * Lazy-loads Google's <model-viewer> web component on first render of this
 * component, then renders the .glb with orbit controls + AR.
 *
 * Why a web component instead of a React 3D lib:
 *  - 80kb gzipped, no bundler config
 *  - native AR button (Scene Viewer on Android, Quick Look on iOS w/ usdz)
 *  - frame-rate handling for free
 *
 * AR availability:
 *  - Android: works out of the box from any glb
 *  - iOS: needs a .usdz served alongside (set MedalDescriptor.usdzUrl).
 *    Without usdz the AR button is hidden on iOS; inline 3D still works.
 */

const SCRIPT_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

let scriptLoaderPromise: Promise<void> | null = null;

function ensureModelViewerLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.customElements?.get("model-viewer")) return Promise.resolve();
  if (scriptLoaderPromise) return scriptLoaderPromise;

  scriptLoaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("model-viewer load failed")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("model-viewer load failed")), {
      once: true,
    });
    document.head.appendChild(script);
  });
  return scriptLoaderPromise;
}

type Props = {
  medal: MedalDescriptor;
  size?: number | string;
  /** Show the AR button on supported devices. Default true. */
  ar?: boolean;
  /** Auto-rotate the model. Default true. */
  autoRotate?: boolean;
  /** Override background. Default transparent. */
  background?: string;
  style?: CSSProperties;
  className?: string;
};

export function MedalViewer({
  medal,
  size = 280,
  ar = true,
  autoRotate = true,
  background = "transparent",
  style,
  className = "",
}: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureModelViewerLoaded()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "model viewer failed to load");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sizeValue = typeof size === "number" ? `${size}px` : size;

  const containerStyle: CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    background,
    position: "relative",
    ...style,
  };

  if (error) {
    return (
      <div
        className={`pdq-medal-viewer-error ${className}`}
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--pdq-mono, monospace)",
          fontSize: 10,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        viewer offline
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        className={`pdq-medal-viewer-loading ${className}`}
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--pdq-mono, monospace)",
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        loading 3d…
      </div>
    );
  }

  // model-viewer is a registered custom element after ensureModelViewerLoaded.
  // Use createElement so we don't need JSX intrinsic types for a non-standard tag.
  const modelProps: Record<string, unknown> = {
    src: medal.glbUrl,
    alt: medal.name,
    "ar-modes": "scene-viewer quick-look webxr",
    "camera-controls": "",
    "touch-action": "pan-y",
    "rotation-per-second": "22deg",
    "environment-image": "neutral",
    exposure: "1",
    "shadow-intensity": "0.6",
    style: {
      width: "100%",
      height: "100%",
      background: "transparent",
    } satisfies CSSProperties,
  };
  if (ar) modelProps.ar = "";
  if (autoRotate) modelProps["auto-rotate"] = "";
  if (medal.usdzUrl) modelProps["ios-src"] = medal.usdzUrl;
  if (medal.posterUrl) modelProps.poster = medal.posterUrl;

  return (
    <div className={`pdq-medal-viewer ${className}`} style={containerStyle}>
      {createElement("model-viewer", modelProps)}
    </div>
  );
}
