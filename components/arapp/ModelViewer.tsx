"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ModelViewerElement = "model-viewer" as any;

type Props = {
  src: string;
  iosSrc?: string;
  poster?: string;
  alt?: string;
  className?: string;
  arButtonLabel?: string;
  arHintLabel?: ReactNode;
  /**
   * Reveal the model immediately and start auto-rotating without waiting for a
   * user interaction. Use for hero models that should spin on load. Defaults to
   * the model-viewer default (poster shown until interaction).
   */
  autoReveal?: boolean;
};

export default function ModelViewer({
  src,
  iosSrc,
  poster,
  alt = "3D collectible",
  className = "",
  arButtonLabel = "Tap me now",
  arHintLabel,
  autoReveal = false,
}: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const activateAR = () => {
    const element = ref.current as (HTMLElement & { activateAR?: () => Promise<void> | void }) | null;
    void element?.activateAR?.();
  };

  useEffect(() => {
    if (!ready) return;
    fetch(src, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) setError(true);
      })
      .catch(() => setError(true));
  }, [ready, src]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] ${className}`}>
        <div className="text-[9px] uppercase tracking-[0.28em] text-white/24">3D Model</div>
        <div className="mt-2 text-[11px] text-white/36">Drop .glb into</div>
        <div className="mt-1 font-mono text-[10px] text-white/28">{src}</div>
      </div>
    );
  }

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        onLoad={() => setReady(true)}
        strategy="lazyOnload"
      />
      <div className="relative h-full w-full">
        <ModelViewerElement
          ref={ref}
          src={src}
          {...(iosSrc ? { "ios-src": iosSrc } : {})}
          poster={poster}
          alt={alt}
          camera-controls
          auto-rotate
          {...(autoReveal
            ? { reveal: "auto", "auto-rotate-delay": "0", "interaction-prompt": "none" }
            : {})}
          ar
          // Native viewers first: Scene Viewer (Android) and Quick Look (iOS) both
          // provide the in-AR photo/video capture button. The in-browser webxr
          // mode only places the model and has no capture UI, so it is omitted.
          ar-modes="scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          shadow-intensity="0.6"
          exposure="0.9"
          loading={autoReveal ? "eager" : "lazy"}
          class={`w-full h-full rounded-2xl bg-black/40 ${className}`}
          style={{ display: "block" }}
        >
          <button
            slot="ar-button"
            type="button"
            onClick={activateAR}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur transition hover:bg-black/75"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {arButtonLabel}
          </button>
        </ModelViewerElement>
        {arHintLabel ? (
          <button
            type="button"
            onClick={activateAR}
            className="absolute left-3 top-3 z-20 inline-flex max-w-[calc(100%-24px)] items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.16em] text-white shadow-2xl backdrop-blur transition hover:bg-black/85"
          >
            {arHintLabel}
          </button>
        ) : null}
      </div>
    </>
  );
}
