import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissance-payments/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissance-payments/NeoRenaissancePlanContent";

const title = "Neo Renaissance · Payments Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation for a payments, card or stablecoin-rail product: one night at Casa Luma, Mexico City, on October 29, 2026, where the partner does not sponsor the bar but runs it as the payment rail for every drink sold and every drink AXIS funds.";

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
    "Payments partnership",
    "Payments activation",
  ],
  alternates: { canonical: "/neorenaissance-payments" },
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
    url: "https://axis.show/neorenaissance-payments",
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
