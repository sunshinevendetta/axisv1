import type { Metadata } from "next";
import FutureRenaissanceExtendedDeck from "@/components/futurerenaissance-wallet/FutureRenaissanceDeck";
import FutureRenaissanceExtendedPlanContent from "@/components/futurerenaissance-wallet/FutureRenaissancePlanContent";

const title = "Future Renaissance · Wallet Partner · Claude Community Event · AXIS";
const description =
  "Private AXIS partnership presentation built for a wallet product: one night at Bar Oriente, Mexico City, October 28 2026, where the wallet is the door, the signature, the bar tab and the address that is still reachable the next morning.";

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
    "Wallet partnership",
    "Wallet activation",
  ],
  alternates: { canonical: "/futurerenaissance-wallet" },
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
    url: "https://axis.show/futurerenaissance-wallet",
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
