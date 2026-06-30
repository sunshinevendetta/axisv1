import type { Metadata } from "next";
import TradingTournamentContent from "@/components/tradingtournament/TradingTournamentContent";
import TradingTournamentDeck from "@/components/tradingtournament/TradingTournamentDeck";

const DESCRIPTION =
  "Trading Arena by OKX en Bar Oriente: el torneo de trading mas intenso jamas realizado en LATAM, " +
  "con Human Traders, AI Agents, mercados en movimiento y leaderboards en vivo.";

export const metadata: Metadata = {
  title: "Trading Arena by OKX · Bar Oriente",
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
  alternates: { canonical: "/tradingtournament" },
  openGraph: {
    title: "Trading Arena by OKX · Bar Oriente",
    description: DESCRIPTION,
    url: "https://axis.show/tradingtournament",
    type: "website",
    images: ["/tradingtournament/baroriente.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Arena by OKX · Bar Oriente",
    description: DESCRIPTION,
    images: ["/tradingtournament/baroriente.jpg"],
  },
};

export default function TradingTournamentPage() {
  return (
    <>
      <TradingTournamentContent />
      <TradingTournamentDeck />
    </>
  );
}
