import type { Metadata } from "next";
import AiCreativeClubDeck from "@/components/aicreativeclub/AiCreativeClubDeck";
import AiCreativeClubPlanContent from "@/components/aicreativeclub/AiCreativeClubPlanContent";

/* Next's dev-mode static route cache goes stale whenever any other route
   recompiles (shared chunk hashes shift under it), serving this page's HTML
   with asset references that 404 and never hydrate. Opting out of caching
   avoids that class of bug; this route has no traffic volume to benefit
   from it anyway. */
export const dynamic = "force-dynamic";

const title = "AI Creative Club";
const description =
  "AI Creative Club Level 01 at Casa Luma, Mexico City, on December 4, 2026. Anana leads art and business content creation with base images, image editing and video. Sunshine Vendetta leads AI workflows and agent integrations. Create content for a business, automate its workflows with AI agents, then explore investing profits onchain. Four traders compete onsite; the first to reach the goal wins a prize. Art features a national and international selection plus onsite creators. The existing workshop, cultural program, gallery and social experience are produced by AXIS.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI Creative Club",
    "Creative AI community event",
    "Art and business content creation, AI agents and workflows",
    "AI Creative Club ? Level 01",
    "Casa Luma",
    "AXIS",
    "December 4, 2026",
    "Mexico City event",
    "AI agents",
    "blockchain investment literacy",
  ],
  alternates: { canonical: "/aicreativeclub" },
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
    url: "https://axis.show/aicreativeclub",
    siteName: "AXIS",
    type: "website",
    images: [
      {
        url: "https://axis.show/aicreativeclub/poster.jpg",
        width: 2000,
        height: 2000,
        alt: "Official AI Creative Club campaign poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://axis.show/aicreativeclub/poster.jpg"],
  },
};

export default function AiCreativeClubPage() {
  return (
    <>
      <AiCreativeClubPlanContent />
      <AiCreativeClubDeck />
    </>
  );
}
