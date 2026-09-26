import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-marketplace/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-marketplace/FutureRenaissancePlanContent";

const title = "Future Renaissance · Marketplace Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a digital-art marketplace: one night at Casa Luma, Mexico City, October 29 2026, where a 100-seat Claude workshop and a live-coding after party generate collectible work inside the room. The marketplace lists it, sells it, and reports it.";

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
