import type { Metadata } from "next";
import FutureRenaissanceDeck from "@/components/futurerenaissance-extended/FutureRenaissanceDeck";
import FutureRenaissancePlanContent from "@/components/futurerenaissance-extended/FutureRenaissancePlanContent";

/* Next's dev-mode static route cache goes stale whenever any other route
   recompiles (shared chunk hashes shift under it), serving this page's HTML
   with asset references that 404 and never hydrate. Opting out of caching
   avoids that class of bug; this route has no traffic volume to benefit
   from it anyway. */
export const dynamic = "force-dynamic";

const title = "Future Renaissance · Claude Community Workshop · Mexa Cocina del Alma";
const description =
  "A Claude community event at Mexa Cocina del Alma, Mexico City, during Mexico Tech Week on October 28, 2026: a seated, hands-on Claude workshop for the music industry from 18:00 to 21:00 for 200 attendees, followed from 22:00 by Future Renaissance for 250 more guests. Host venue: Mexa Cocina del Alma, Av. Álvaro Obregón 180, Roma Norte, Cuauhtémoc, 06700 Ciudad de México, CDMX. Produced by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Future Renaissance",
    "Claude community event",
    "Claude workshop for the music industry",
    "Mexico Tech Week 2026",
    "Mexa Cocina del Alma",
    "AXIS",
    "October 28 2026",
    "Mexico City event",
    "live coding",
  ],
  alternates: { canonical: "/futurerenaissance-extended" },
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
    url: "https://axis.show/futurerenaissance-extended",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissance-extended/poster-horizontal.png",
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
    images: ["https://axis.show/futurerenaissance-extended/poster-horizontal.png"],
  },
};

export default function FutureRenaissanceExtendedMexaPage() {
  return (
    <>
      <FutureRenaissancePlanContent />
      <FutureRenaissanceDeck />
    </>
  );
}
