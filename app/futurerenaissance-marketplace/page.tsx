import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-marketplace/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-marketplace/FutureRenaissancePlanContent";

const title = "Future Renaissance · Marketplace Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a digital-art marketplace: one night at Bar Oriente, Mexico City, October 28 2026, where a 200-seat Claude workshop and a live-coding after party generate collectible work inside the room. The marketplace lists it, sells it, and reports it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Future Renaissance",
    "Claude community event",
    "Bar Oriente",
    "Mexico Tech Week 2026",
    "Mexico City",
    "AXIS",
    "Marketplace partnership",
    "Marketplace activation",
  ],
  alternates: { canonical: "/futurerenaissance-marketplace" },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title,
    description,
    url: "https://axis.show/futurerenaissance-marketplace",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissanceextended/og-circuit.png",
        width: 1672,
        height: 941,
        alt: "Future Renaissance Mexico Tech Week After Hours circuit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/futurerenaissanceextended/og-circuit.png"],
  },
};

export default function FutureRenaissanceExtendedPage() {
  return (
    <>
      <FutureRenaissanceExtendedPlanContent />
      <FutureRenaissanceExtendedDeck />
    </>
  );
}
