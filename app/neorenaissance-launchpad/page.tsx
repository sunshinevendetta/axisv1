import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissance-launchpad/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissance-launchpad/NeoRenaissancePlanContent";

const title = "Neo Renaissance · Launchpad Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a creator launchpad: one night at Casa Luma, Mexico City, October 29 2026, where a 100-seat Claude workshop seats the music industry and the after party hosts a live launch in the room. Allocation is earned by participation and delivered as a named holder cohort.";

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
    "Launchpad partnership",
    "Launchpad activation",
  ],
  alternates: { canonical: "/neorenaissance-launchpad" },
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
    url: "https://axis.show/neorenaissance-launchpad",
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
