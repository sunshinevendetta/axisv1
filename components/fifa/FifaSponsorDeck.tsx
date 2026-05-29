"use client";

import HorizontalDeck from "./HorizontalDeck";
import VerticalDeck from "./VerticalDeck";

const BREAKPOINT = 820;

export default function FifaSponsorDeck() {
  return (
    <>
      <style>{`
        .fifa-deck-desktop, .fifa-deck-mobile {
          position: fixed;
          inset: 0;
        }
        .fifa-deck-mobile { display: none; }
        @media (max-width: ${BREAKPOINT}px) {
          .fifa-deck-desktop { display: none; }
          .fifa-deck-mobile { display: block; }
        }
      `}</style>
      <div className="fifa-deck-desktop">
        <HorizontalDeck />
      </div>
      <div className="fifa-deck-mobile">
        <VerticalDeck />
      </div>
    </>
  );
}
