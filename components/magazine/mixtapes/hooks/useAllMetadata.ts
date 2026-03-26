"use client";

import { useState, useEffect } from "react";

export type AudioMeta = {
  title?: string;
  artist?: string;
  album?: string;
  coverArt?: string; // blob URL
};

/**
 * Loads ID3 metadata for every URL in the array concurrently.
 * Reads only the first few KB via XHR Range requests — safe for large files.
 * Falls back silently if parsing fails (shows JSON data instead).
 */
export function useAllMetadata(urls: string[]): Record<number, AudioMeta> {
  const [metaMap, setMetaMap] = useState<Record<number, AudioMeta>>({});

  useEffect(() => {
    const blobUrls: string[] = [];
    let cancelled = false;

    (async () => {
      try {
        const jsmTag = await import("jsmediatags");
        // CJS default export
        const jsmediatags = (jsmTag as any).default ?? jsmTag;

        urls.forEach((url, i) => {
          try {
            jsmediatags.read(url, {
              onSuccess: (tag: any) => {
                if (cancelled) return;
                const { title, artist, album, picture } = tag.tags ?? {};
                let coverArt: string | undefined;

                if (picture?.data) {
                  const bytes = new Uint8Array(picture.data);
                  const blob = new Blob([bytes], {
                    type: picture.format ?? "image/jpeg",
                  });
                  coverArt = URL.createObjectURL(blob);
                  blobUrls.push(coverArt);
                }

                setMetaMap((prev) => ({
                  ...prev,
                  [i]: { title, artist, album, coverArt },
                }));
              },
              onError: () => {
                // Silently ignore — component falls back to JSON values
              },
            });
          } catch {
            // Per-track error ignored
          }
        });
      } catch {
        // jsmediatags failed to import — all tracks fall back to JSON
      }
    })();

    return () => {
      cancelled = true;
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — urls are static

  return metaMap;
}
