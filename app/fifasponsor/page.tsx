import type { Metadata } from "next";
import FifaSponsorDeck from "@/components/fifa/FifaSponsorDeck";

export const metadata: Metadata = {
  title: "AXIS, June Program, Sponsor Deck",
  alternates: { canonical: "/fifasponsor" },
  openGraph: {
    title: "AXIS · June Program · Sponsor Deck",
    url: "https://axis.show/fifasponsor",
  },
};

export default function FifaSponsorPage() {
  return <FifaSponsorDeck />;
}
