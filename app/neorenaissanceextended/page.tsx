import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissanceextended/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissanceextended/NeoRenaissancePlanContent";

const title = "Neo Renaissance · Mexico Tech Week After Hours · AXIS";
const description =
  "Private AXIS partnership presentation for a six-night Neo Renaissance after-hours circuit across Mexico Tech Week, October 27–November 1, 2026.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Neo Renaissance",
    "Mexico Tech Week after hours",
    "Mexico Tech Town",
    "AXIS",
    "Claude Official Party",
    "Mexico City",
    "sponsor partnership",
    "event circuit",
  ],
  alternates: { canonical: "/neorenaissanceextended" },
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
    url: "https://axis.show/neorenaissanceextended",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/neorenaissanceextended/og-circuit.png",
        width: 1672,
        height: 941,
        alt: "Neo Renaissance Mexico Tech Week After Hours circuit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/neorenaissanceextended/og-circuit.png"],
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
