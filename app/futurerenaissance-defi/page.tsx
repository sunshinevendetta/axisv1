import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-defi/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-defi/FutureRenaissancePlanContent";

const title = "Future Renaissance · DeFi Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation for a lending, yield or staking protocol: one night at Casa Luma, Mexico City, on October 29, 2026, where a deposit is opened in a seated 100-person workshop, runs through the night, and is settled and withdrawn before the guest goes home.";

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
    "DeFi partnership",
    "DeFi activation",
  ],
  alternates: { canonical: "/futurerenaissance-defi" },
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
    url: "https://axis.show/futurerenaissance-defi",
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
