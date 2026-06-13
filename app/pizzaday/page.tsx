import type { Metadata } from "next";
import PizzaDayApp from "@/components/pizzaday/PizzaDayApp";

export const metadata: Metadata = {
  title: "Pizza Day Quest Archive",
  description:
    "Archive of AXIS Pizza Day Quest, a concluded one-day pizza quest at Supremo, Dr. Carmona y Valle 147, Doctores, CDMX.",
  alternates: { canonical: "/pizzaday" },
  openGraph: {
    title: "AXIS · Pizza Day Quest Archive",
    description:
      "Archive of the concluded AXIS Pizza Day Quest at Supremo, Doctores, CDMX.",
    url: "https://axis.show/pizzaday",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PizzaDayPage() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: 74,
          zIndex: 180,
          width: "min(92vw, 720px)",
          transform: "translateX(-50%)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 10,
          background: "rgba(5,5,5,0.78)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          color: "#f5f5f5",
          fontFamily: "var(--font-body), sans-serif",
          fontSize: 12,
          lineHeight: 1.45,
          padding: "10px 14px",
          textAlign: "center",
          backdropFilter: "blur(18px)",
          pointerEvents: "none",
        }}
      >
        <strong style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>Archive</strong>
        <span style={{ color: "rgba(245,245,245,0.72)" }}>
          {" "}
          Pizza Day Quest has concluded. This page remains for reference; RSVP and live participation are closed.
        </span>
      </div>
      <PizzaDayApp archiveMode />
    </>
  );
}
