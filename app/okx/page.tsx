import type { Metadata } from "next";
import OkxOnboarding from "@/components/okx/OkxOnboarding";

const DESCRIPTION =
  "OKX drinks onboarding for AXIS at Bar Oriente on June 25. Complete up to three simple OKX missions and redeem up to three drinks on-site.";

export const metadata: Metadata = {
  title: "OKX Drinks Missions | AXIS",
  description: DESCRIPTION,
  alternates: { canonical: "/okx" },
  openGraph: {
    title: "OKX Drinks Missions | AXIS",
    description: DESCRIPTION,
    url: "https://axis.show/okx",
    type: "website",
    images: [
      {
        url: "/okxproposal/25jun.webp",
        width: 1200,
        height: 630,
        alt: "AXIS at Bar Oriente, June 25",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OKX Drinks Missions | AXIS",
    description: DESCRIPTION,
  },
};

export default function OkxPage() {
  return <OkxOnboarding />;
}
