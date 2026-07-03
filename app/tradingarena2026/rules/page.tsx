import type { Metadata } from "next";
import RulebookPageContent from "@/components/tradingarena2026/RulebookPageContent";

export const metadata: Metadata = {
  title: "Trading Arena League Official Rulebook",
  description:
    "Official sporting and technical regulations for Trading Arena League Human, AI and Team competition.",
  alternates: { canonical: "/tradingarena2026/rules" },
};

export default function TradingArenaRulesPage() {
  return <RulebookPageContent />;
}
