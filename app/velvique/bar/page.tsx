import type { Metadata, Viewport } from "next";
import VelviqueBar from "@/components/velvique/VelviqueBar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Velvique · Bar",
  robots: { index: false, follow: false },
};

export default function VelviqueBarPage() {
  return <VelviqueBar />;
}
