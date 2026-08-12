import type { Metadata } from "next";
import FutureRenaissanceDeck from "@/components/futurerenaissance/FutureRenaissanceDeck";
import FutureRenaissancePlanContent from "@/components/futurerenaissance/FutureRenaissancePlanContent";

const title = "Future Renaissance · AXIS Proposal";
const description =
  "Future Renaissance at Owl Condesa on October 28, 2026: a 120-person AXIS event proposal with music, digital art, beer and canapés, measurable partner activations, and post-event media.";

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
  openGraph: {
    title,
    description,
    url: "https://axis.show/futurerenaissance",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissance/og.png",
        width: 1728,
        height: 912,
        alt: "Future Renaissance at Owl Condesa, October 28, 2026, 120 pax",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/futurerenaissance/og.png"],
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
