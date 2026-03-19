"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

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

  const activeSources = useMemo(() => {
    if (isDesktop === null) {
      return [];
    }

    return isDesktop ? desktopSources : mobileSources;
  }, [desktopSources, isDesktop, mobileSources]);

  useEffect(() => {
    const video = videoRef.current;

    if (!shouldLoad || !video || activeSources.length === 0) {
      return;
    }

    const tryPlay = () => {
      const playPromise = video.play();

      if (playPromise) {
        playPromise.catch(() => {
          // Some browsers need a second attempt after more data is buffered.
        });
      }
    };

    video.load();
    tryPlay();

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [activeSources, shouldLoad]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "black" }}
    >
      {shouldLoad && activeSources.length > 0 && (
        <video
          key={isDesktop ? "desktop" : "mobile"}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload={priority ? "auto" : "metadata"}
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
        >
          {activeSources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      )}
    </div>
  );
}
