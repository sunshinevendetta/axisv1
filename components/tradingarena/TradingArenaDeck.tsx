"use client";

import { useCallback, useEffect } from "react";
import { useSiteLanguage } from "@/components/site-language";

const BREAKPOINT = 820;

export default function TradingArenaDeck() {
  const { language } = useSiteLanguage();

  const syncDeckLanguage = useCallback(() => {
    if (typeof window === "undefined") return;
    document.querySelectorAll<HTMLIFrameElement>('iframe[data-ta-deck="true"]').forEach((iframe) => {
      iframe.contentWindow?.postMessage(
        { type: "axis:language", language },
        window.location.origin,
      );
    });
  }, [language]);

  useEffect(() => {
    syncDeckLanguage();
  }, [syncDeckLanguage]);

  const frameStyle = {
    position: "fixed" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    background: "#000",
  };

  return (
    <>
      <style>{`
        .ta-deck-desktop, .ta-deck-mobile {
          position: fixed;
          inset: 0;
        }
        .ta-deck-mobile { display: none; }
        @media (max-width: ${BREAKPOINT}px) {
          .ta-deck-desktop { display: none; }
          .ta-deck-mobile { display: block; }
        }
      `}</style>
      <div className="ta-deck-desktop">
        <iframe
          data-ta-deck="true"
          src="/tradingarena/arena-horizontal.html"
          title="Trading Arena Proposal"
          onLoad={syncDeckLanguage}
          style={frameStyle}
        />
      </div>
      <div className="ta-deck-mobile">
        <iframe
          data-ta-deck="true"
          src="/tradingarena/arena-vertical.html"
          title="Trading Arena Proposal Mobile"
          onLoad={syncDeckLanguage}
          style={frameStyle}
        />
      </div>
    </>
  );
}
