"use client";

import { useCallback, useEffect } from "react";
import { useSiteLanguage } from "@/components/site-language";

const BREAKPOINT = 820;

export default function FutureRenaissanceDeck() {
  const { language } = useSiteLanguage();

  const syncDeckLanguage = useCallback(() => {
    if (typeof window === "undefined") return;

    document
      .querySelectorAll<HTMLIFrameElement>('iframe[data-future-renaissance-deck="true"]')
      .forEach((iframe) => {
        iframe.contentWindow?.postMessage(
          {
            type: "axis:language",
            language,
          },
          window.location.origin,
        );
      });
  }, [language]);

  useEffect(() => {
    syncDeckLanguage();
  }, [syncDeckLanguage]);

  return (
    <>
      <style>{`
        .future-deck-desktop,
        .future-deck-mobile {
          position: fixed;
          inset: 0;
        }

        .future-deck-mobile {
          display: none;
        }

        @media (max-width: ${BREAKPOINT}px) {
          .future-deck-desktop {
            display: none;
          }

          .future-deck-mobile {
            display: block;
          }
        }
      `}</style>

      <div className="future-deck-desktop">
        <iframe
          data-future-renaissance-deck="true"
          src="/futurerenaissance/axis-horizontal.html"
          title="Future Renaissance proposal, desktop deck"
          onLoad={syncDeckLanguage}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            background: "#000",
          }}
        />
      </div>

      <div className="future-deck-mobile">
        <iframe
          data-future-renaissance-deck="true"
          src="/futurerenaissance/axis-vertical.html"
          title="Future Renaissance proposal, mobile deck"
          onLoad={syncDeckLanguage}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            background: "#000",
          }}
        />
      </div>
    </>
  );
}
