import type { Metadata, Viewport } from "next";
import VelviqueExperience from "@/components/velvique/VelviqueExperience";

const title = "Velvique · AI Mixology";
const description =
  "Five worlds, five questions. Your answers become a one-of-a-kind trading card holding a 45 ml Velvique Añejo Cristalino recipe made for you alone. Produced by AXIS.";

/* viewport-fit=cover lets the layout use iPhone safe-area insets. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/velvique" },
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: "https://axis.show/velvique",
    siteName: "AXIS",
    type: "website",
  },
  twitter: { card: "summary", title, description },
};

export default function VelviquePage() {
  return <VelviqueExperience />;
}
