import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissance-defi/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissance-defi/NeoRenaissancePlanContent";

const title = "Neo Renaissance · DeFi Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation for a lending, yield or staking protocol: one night at Casa Luma, Mexico City, on October 29, 2026, where a deposit is opened in a seated 100-person workshop, runs through the night, and is settled and withdrawn before the guest goes home.";

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
    "DeFi partnership",
    "DeFi activation",
  ],
  alternates: { canonical: "/neorenaissance-defi" },
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
    url: "https://axis.show/neorenaissance-defi",
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
