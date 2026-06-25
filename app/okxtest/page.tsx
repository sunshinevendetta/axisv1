import type { Metadata } from "next";
import OkxOnboarding from "@/components/okx/OkxOnboarding";
import OkxTestConsole from "@/components/okx/OkxTestConsole";

export const metadata: Metadata = {
  title: "OKX Test Console | AXIS",
  description: "Internal OKX UID OCR and proof email test console.",
  alternates: { canonical: "/okxtest" },
};

export default function OkxTestPage() {
  return (
    <>
      <OkxTestConsole />
      <OkxOnboarding />
    </>
  );
}
