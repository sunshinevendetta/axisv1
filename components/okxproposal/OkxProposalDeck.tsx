"use client";

import { useCallback, useEffect } from "react";
import HorizontalDeck from "./HorizontalDeck";
import VerticalDeck from "./VerticalDeck";
import { useSiteLanguage } from "@/components/site-language";

const BREAKPOINT = 820;

export default function OkxProposalDeck() {
  const { language } = useSiteLanguage();

  const syncDeckLanguage = useCallback(() => {
    if (typeof window === "undefined") return;

    document.querySelectorAll<HTMLIFrameElement>('iframe[data-pbo-deck="true"]').forEach((iframe) => {
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
        .pbo-deck-desktop, .pbo-deck-mobile {
          position: fixed;
          inset: 0;
        }
        .pbo-deck-mobile { display: none; }
        @media (max-width: ${BREAKPOINT}px) {
          .pbo-deck-desktop { display: none; }
          .pbo-deck-mobile { display: block; }
        }
      `}</style>
      <div className="pbo-deck-desktop">
        <HorizontalDeck onLoad={syncDeckLanguage} />
      </div>
      <div className="pbo-deck-mobile">
        <VerticalDeck onLoad={syncDeckLanguage} />
      </div>
    </>
  );
}
