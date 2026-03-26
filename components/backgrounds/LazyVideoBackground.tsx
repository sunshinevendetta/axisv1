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
  delayMs?: number;
};

export default function LazyVideoBackground({
  desktopSources,
  mobileSources,
  priority = false,
  delayMs = 0,
}: LazyVideoBackgroundProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadRequested, setLoadRequested] = useState(priority);
  const [delayElapsed, setDelayElapsed] = useState(delayMs <= 0);
  const [allowPlayback, setAllowPlayback] = useState(true);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
      };
    };

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
      setAllowPlayback(!motionQuery.matches && !Boolean(connection.connection?.saveData));
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (priority || loadRequested || !rootRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoadRequested(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [priority, loadRequested]);

  useEffect(() => {
    if (delayMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDelayElapsed(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs]);

  const shouldLoad = loadRequested && delayElapsed && allowPlayback;

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
          preload={priority ? "metadata" : "none"}
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
