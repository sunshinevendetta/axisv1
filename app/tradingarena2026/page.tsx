import type { Metadata } from "next";
import ArenaDeck2026 from "@/components/tradingarena2026/ArenaDeck2026";

const DESCRIPTION =
  "Trading Arena en Bar Oriente: el torneo de trading mas intenso jamas realizado en LATAM, " +
  "con Human Traders, AI Agents, mercados en movimiento y leaderboards en vivo.";

export const metadata: Metadata = {
  title: "Trading Arena 2026 · Bar Oriente",
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
  alternates: { canonical: "/tradingarena2026" },
  openGraph: {
    title: "Trading Arena 2026 · Bar Oriente",
    description: DESCRIPTION,
    url: "https://axis.show/tradingarena2026",
    type: "website",
    images: ["/tradingarena/baroriente.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Arena 2026 · Bar Oriente",
    description: DESCRIPTION,
    images: ["/tradingarena/baroriente.jpg"],
  },
};

export default function TradingArena2026Page() {
  return <ArenaDeck2026 />;
}
