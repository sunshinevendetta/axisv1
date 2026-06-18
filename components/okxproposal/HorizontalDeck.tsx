"use client";

export default function HorizontalDeck({ onLoad }: { onLoad?: () => void }) {
  return (
    <iframe
      data-pbo-deck="true"
      src="/okxproposal/axis-horizontal.html"
      title="AXIS Sponsor Deck Desktop"
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
