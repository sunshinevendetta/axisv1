import type { Metadata } from "next";
import TradingArenaContent from "@/components/tradingarena/TradingArenaContent";
import TradingArenaDeck from "@/components/tradingarena/TradingArenaDeck";

const DESCRIPTION =
  "Trading Arena en Bar Oriente: el torneo de trading mas intenso jamas realizado en LATAM, " +
  "con Human Traders, AI Agents, mercados en movimiento y leaderboards en vivo.";

export const metadata: Metadata = {
  title: "Trading Arena · Bar Oriente",
  description: DESCRIPTION,
  keywords: [
    "AXIS",
    "Bar Oriente",
    "trading arena",
    "AI trading",
    "traders humanos",
    "Ciudad de Mexico",
    "propuesta de sede",
  ],
  alternates: { canonical: "/tradingarena" },
  openGraph: {
    title: "Trading Arena · Bar Oriente",
    description: DESCRIPTION,
    url: "https://axis.show/tradingarena",
    type: "website",
    images: ["/tradingarena/baroriente.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Arena · Bar Oriente",
    description: DESCRIPTION,
    images: ["/tradingarena/baroriente.jpg"],
  },
};

export default function TradingArenaPage() {
  return (
    <>
      <TradingArenaContent />
      <TradingArenaDeck />
    </>
  );
}
