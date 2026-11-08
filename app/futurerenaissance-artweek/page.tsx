import type { Metadata } from "next";
import FutureRenaissanceDeck from "@/components/futurerenaissance-artweek/FutureRenaissanceDeck";
import FutureRenaissancePlanContent from "@/components/futurerenaissance-artweek/FutureRenaissancePlanContent";

/* Next's dev-mode static route cache goes stale whenever any other route
   recompiles (shared chunk hashes shift under it), serving this page's HTML
   with asset references that 404 and never hydrate. Opting out of caching
   avoids that class of bug; this route has no traffic volume to benefit
   from it anyway. */
export const dynamic = "force-dynamic";

const title = "Neo Renaissance · Art Week Mexico City · Casa Luma";
const description =
  "A Creative AI community event at Casa Luma, Mexico City, during Art Week Mexico City in February 2027 · date TBC: the event window runs 16:00 to 02:00, with a seated, hands-on Creative AI workshop for artists and creative practitioners from 17:00 to 21:00 for 100 attendees, followed from 21:00 to 02:00 by the Neo Renaissance party for 120 more guests. The Gallery forms part of the experience. Host venue: Casa Luma, Tinala 145, Roma Norte, CDMX. Produced by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Neo Renaissance",
    "Creative AI community event",
    "Creative AI workshop for artists and creative practitioners",
    "Art Week Mexico City 2027",
    "Casa Luma",
    "AXIS",
    "February 2027",
    "Mexico City event",
    "live coding",
  ],
  alternates: { canonical: "/futurerenaissance-artweek" },
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
    url: "https://axis.show/futurerenaissance-artweek",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/futurerenaissance-artweek/poster-horizontal.png",
        width: 1402,
        height: 1122,
        alt: "Official Neo Renaissance campaign poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/futurerenaissance-artweek/poster-horizontal.png"],
  },
};

export default function FutureRenaissanceArtWeekPage() {
  return (
    <>
      <FutureRenaissancePlanContent />
      <FutureRenaissanceDeck />
    </>
  );
}
