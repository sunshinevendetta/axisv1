import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-launchpad/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-launchpad/FutureRenaissancePlanContent";

const title = "Future Renaissance · Launchpad Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a creator launchpad: one night at Bar Oriente, Mexico City, October 28 2026, where a 200-seat Claude workshop seats the music industry and the after party hosts a live launch in the room. Allocation is earned by participation and delivered as a named holder cohort.";

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
    "Launchpad partnership",
    "Launchpad activation",
  ],
  alternates: { canonical: "/futurerenaissance-launchpad" },
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
    url: "https://axis.show/futurerenaissance-launchpad",
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
