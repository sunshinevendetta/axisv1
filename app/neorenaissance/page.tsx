import type { Metadata } from "next";
import NeoRenaissanceDeck from "@/components/neorenaissance/NeoRenaissanceDeck";
import NeoRenaissancePlanContent from "@/components/neorenaissance/NeoRenaissancePlanContent";

const title = "Neo Renaissance · AXIS Sponsor Presentation";
const description =
  "Private AXIS sponsor presentation for Neo Renaissance at Owl Condesa in Mexico City on October 28, 2026.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Neo Renaissance",
    "AXIS",
    "Owl Condesa",
    "October 28 2026",
    "Mexico City event",
    "partner proposal",
  ],
  alternates: { canonical: "/neorenaissance" },
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
    url: "https://axis.show/neorenaissance",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/neorenaissance/poster-horizontal.png",
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
    images: ["https://axis.show/neorenaissance/poster-horizontal.png"],
  },
};

export default function NeoRenaissancePage() {
  return (
    <>
      <NeoRenaissancePlanContent />
      <NeoRenaissanceDeck />
    </>
  );
}
