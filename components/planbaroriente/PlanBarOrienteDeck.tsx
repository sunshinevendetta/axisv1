"use client";

import HorizontalDeck from "./HorizontalDeck";
import VerticalDeck from "./VerticalDeck";

const BREAKPOINT = 820;

export default function PlanBarOrienteDeck() {
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
        <HorizontalDeck />
      </div>
      <div className="pbo-deck-mobile">
        <VerticalDeck />
      </div>
    </>
  );
}
