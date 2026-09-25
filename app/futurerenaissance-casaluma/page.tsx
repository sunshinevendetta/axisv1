import type { Metadata } from "next";
import FutureRenaissanceDeck from "@/components/futurerenaissance-casaluma/FutureRenaissanceDeck";
import FutureRenaissancePlanContent from "@/components/futurerenaissance-casaluma/FutureRenaissancePlanContent";

/* Next's dev-mode static route cache goes stale whenever any other route
   recompiles (shared chunk hashes shift under it), serving this page's HTML
   with asset references that 404 and never hydrate. Opting out of caching
   avoids that class of bug; this route has no traffic volume to benefit
   from it anyway. */
export const dynamic = "force-dynamic";

const title = "Future Renaissance · Claude Community Workshop · Casa Luma";
const description =
  "A Claude community event at Casa Luma, Mexico City, during Mexico Tech Week on Thursday, October 29, 2026: the event window runs 16:00 to 02:00, with a seated, hands-on Claude workshop for the music industry from 17:00 to 21:00 for 100 attendees, followed from 21:00 to 02:00 by the Future Renaissance party for 120 more guests. The Gallery forms part of the experience. Host venue: Casa Luma, Tinala 145, Roma Norte, CDMX. Produced by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Future Renaissance",
    "Claude community event",
    "Claude workshop for the music industry",
    "Mexico Tech Week 2026",
    "Casa Luma",
    "AXIS",
    "October 29 2026",
    "Mexico City event",
    "live coding",
  ],
  alternates: { canonical: "/futurerenaissance-casaluma" },
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
    url: "https://axis.show/futurerenaissance-casaluma",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissance-casaluma/poster-horizontal.png",
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
    images: ["https://axis.show/futurerenaissance-casaluma/poster-horizontal.png"],
  },
};

export default function FutureRenaissanceCasaLumaPage() {
  return (
    <>
      <FutureRenaissancePlanContent />
      <FutureRenaissanceDeck />
    </>
  );
}
