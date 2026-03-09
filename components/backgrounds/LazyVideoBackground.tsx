"use client";

import { useEffect, useRef, useState } from "react";

type VideoSource = {
  src: string;
  type: string;
};

type LazyVideoBackgroundProps = {
  desktopSources: VideoSource[];
  mobileSources: VideoSource[];
  priority?: boolean;
};

export default function LazyVideoBackground({
  desktopSources,
  mobileSources,
  priority = false,
}: LazyVideoBackgroundProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (priority || shouldLoad || !rootRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "black" }}
    >
      {shouldLoad && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload={priority ? "auto" : "none"}
            className="absolute inset-0 h-full w-full object-cover hidden md:block"
          >
            {desktopSources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload={priority ? "auto" : "none"}
            className="absolute inset-0 h-full w-full object-cover block md:hidden"
          >
            {mobileSources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        </>
      )}
    </div>
  );
}
