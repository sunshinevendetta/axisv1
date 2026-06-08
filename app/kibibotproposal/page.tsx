import type { Metadata } from "next";
import KibibotProposalDeck from "@/components/kibibotproposal/KibibotProposalDeck";
import PlanContent from "@/components/kibibotproposal/PlanContent";

const DESCRIPTION =
  "Programa de junio de AXIS: dos noches de takeover del Cuarto Rosa en Bar Oriente, " +
  "Ciudad de México — 18 y 25 de junio de 2026. Noche uno: lanzamiento de Brugee Records " +
  "con Sunshine Vendetta, Coronela b2b Chino Marley y Santi Santana. Propuesta Kibibot con " +
  "onboarding en sitio, foto-token, redención de bebidas, staff, visuales, instrucciones y documentación.";

export const metadata: Metadata = {
  title: "AXIS, Programa de Junio, Propuesta Kibibot",
  description: DESCRIPTION,
  keywords: [
    "AXIS",
    "Bar Oriente",
    "Cuarto Rosa",
    "Brugee Records",
    "Sunshine Vendetta",
    "18 junio 2026",
    "25 junio 2026",
    "Ciudad de México",
    "evento de música",
    "propuesta Kibibot",
    "foto-token",
    "redención de bebidas",
  ],
  alternates: { canonical: "/kibibotproposal" },
  openGraph: {
    title: "AXIS · Programa de Junio · Propuesta Kibibot",
    description: DESCRIPTION,
    url: "https://axis.show/kibibotproposal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS · Programa de Junio · Propuesta Kibibot",
    description: DESCRIPTION,
  },
};

export default function KibibotProposalPage() {
  return (
    <>
      <PlanContent />
      <KibibotProposalDeck />
    </>
  );
}
