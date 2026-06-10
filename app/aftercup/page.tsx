import type { Metadata } from "next";
import AftercupApp from "@/components/aftercup/AftercupApp";

export const metadata: Metadata = {
  title: "Aftercup Quest",
  description:
    "AXIS Aftercup Quest - a bilingual Match Cup and After Cup quest at Fronton Bucareli, Bucareli 118, CDMX.",
  alternates: { canonical: "/aftercup" },
  openGraph: {
    title: "AXIS · Aftercup Quest",
    description:
      "One venue. Two zones. Match-day quests, restaurant missions, After Cup events, and digital art medals.",
    url: "https://axis.show/aftercup",
  },
};

export default function AftercupPage() {
  return <AftercupApp />;
}
