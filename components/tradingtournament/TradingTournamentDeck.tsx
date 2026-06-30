"use client";

const BREAKPOINT = 820;

export default function TradingTournamentDeck() {
  return (
    <>
      <style>{`
        .tt-deck-desktop, .tt-deck-mobile {
          position: fixed;
          inset: 0;
        }
        .tt-deck-mobile { display: none; }
        @media (max-width: ${BREAKPOINT}px) {
          .tt-deck-desktop { display: none; }
          .tt-deck-mobile { display: block; }
        }
      `}</style>
      <div className="tt-deck-desktop">
        <iframe
          src="/tradingtournament/trading-horizontal.html"
          title="Trading Arena by OKX Proposal"
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
      <div className="tt-deck-mobile">
        <iframe
          src="/tradingtournament/trading-vertical.html"
          title="Trading Arena by OKX Proposal Mobile"
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
