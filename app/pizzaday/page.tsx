import type { Metadata } from "next";
import PizzaDayApp from "@/components/pizzaday/PizzaDayApp";

export const metadata: Metadata = {
  title: "Pizza Day Quest",
  description:
    "AXIS Pizza Day Quest — a one-day pizza quest at Chihuahua 10, Roma Norte, CDMX. Medals for presence.",
  alternates: { canonical: "/pizzaday" },
  openGraph: {
    title: "AXIS · Pizza Day Quest",
    description:
      "One day. One building. Three floors and a terrace. Real chips, augmented medals, ranks that travel with you.",
    url: "https://axis.show/pizzaday",
  },
};

export default function PizzaDayPage() {
  return <PizzaDayApp />;
}
