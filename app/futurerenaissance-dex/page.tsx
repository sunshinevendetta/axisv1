import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-dex/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-dex/FutureRenaissancePlanContent";

const title = "Future Renaissance · DEX Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation for a decentralised exchange: one night at Casa Luma, Mexico City, October 29 2026, where wallet connection, swaps, liquidity and onchain reward claims all happen on event grounds. A Claude community event during Mexico Tech Week, powered by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Future Renaissance",
    "Claude community event",
    "Casa Luma",
    "Mexico Tech Week 2026",
    "Mexico City",
    "AXIS",
    "DEX partnership",
    "DEX activation",
  ],
  alternates: { canonical: "/futurerenaissance-dex" },
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
    url: "https://axis.show/futurerenaissance-dex",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissanceextended/poster-horizontal.png",
        width: 1396,
        height: 1125,
        alt: "Official Future Renaissance campaign poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/futurerenaissanceextended/poster-horizontal.png"],
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
