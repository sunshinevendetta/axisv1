"use client";

export default function VerticalDeck({ onLoad }: { onLoad?: () => void }) {
  return (
    <iframe
      data-pbo-deck="true"
      src="/okxproposal/axis-vertical.html"
      title="AXIS Sponsor Deck Mobile"
      onLoad={onLoad}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        background: "#000",
      }}
    />
  );
}
