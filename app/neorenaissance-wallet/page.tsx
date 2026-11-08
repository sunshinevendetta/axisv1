import type { Metadata } from "next";
import NeoRenaissanceExtendedDeck from "@/components/neorenaissance-wallet/NeoRenaissanceDeck";
import NeoRenaissanceExtendedPlanContent from "@/components/neorenaissance-wallet/NeoRenaissancePlanContent";

const title = "Neo Renaissance · Wallet Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a wallet product: one night at Casa Luma, Mexico City, October 29 2026, where the wallet is the door, the signature, the bar tab and the address that is still reachable the next morning.";

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
    "Wallet partnership",
    "Wallet activation",
  ],
  alternates: { canonical: "/neorenaissance-wallet" },
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
    url: "https://axis.show/neorenaissance-wallet",
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
