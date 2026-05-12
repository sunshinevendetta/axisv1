"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ModelViewerElement = "model-viewer" as any;


type Props = {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
};

export default function ModelViewer({ src, poster, alt = "3D collectible", className = "" }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Check if the GLB exists once the script is loaded
  useEffect(() => {
    if (!ready) return;
    fetch(src, { method: "HEAD" })
      .then((r) => { if (!r.ok) setError(true); })
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
      <ModelViewerElement
        ref={ref}
        src={src}
        poster={poster}
        alt={alt}
        camera-controls
        auto-rotate
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="0.6"
        exposure="0.9"
        loading="lazy"
        class={`w-full h-full rounded-2xl bg-black/40 ${className}`}
        style={{ display: "block" }}
      />
    </>
  );
}
