import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissance-dex/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissance-dex/NeoRenaissancePlanContent";

const title = "Neo Renaissance · DEX Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation for a decentralised exchange: one night at Casa Luma, Mexico City, October 29 2026, where wallet connection, swaps, liquidity and onchain reward claims all happen on event grounds. A Claude community event during Mexico Tech Week, powered by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Neo Renaissance",
    "Claude community event",
    "Casa Luma",
    "Mexico Tech Week 2026",
    "Mexico City",
    "AXIS",
    "DEX partnership",
    "DEX activation",
  ],
  alternates: { canonical: "/neorenaissance-dex" },
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
    url: "https://axis.show/neorenaissance-dex",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/neorenaissanceextended/poster-horizontal.png",
        width: 1396,
        height: 1125,
        alt: "Official Neo Renaissance campaign poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/neorenaissanceextended/poster-horizontal.png"],
  },
};

export default function NeoRenaissanceExtendedPage() {
  return (
    <>
      <NeoRenaissanceExtendedPlanContent />
      <NeoRenaissanceExtendedDeck />
    </>
  );
}
