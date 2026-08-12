import type { Metadata } from "next";
import FutureRenaissanceDeck from "@/components/futurerenaissance/FutureRenaissanceDeck";
import FutureRenaissancePlanContent from "@/components/futurerenaissance/FutureRenaissancePlanContent";

const title = "Future Renaissance · AXIS Sponsor Presentation";
const description =
  "Private AXIS sponsor presentation for Future Renaissance at Owl Condesa in Mexico City on October 28, 2026.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Future Renaissance",
    "AXIS",
    "Owl Condesa",
    "October 28 2026",
    "Mexico City event",
    "partner proposal",
  ],
  alternates: { canonical: "/futurerenaissance" },
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
    url: "https://axis.show/futurerenaissance",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissance/poster-horizontal.png",
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
    images: ["https://axis.show/futurerenaissance/poster-horizontal.png"],
  },
};

export default function FutureRenaissancePage() {
  return (
    <>
      <FutureRenaissancePlanContent />
      <FutureRenaissanceDeck />
    </>
  );
}
