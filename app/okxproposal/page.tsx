import type { Metadata } from "next";
import OkxProposalDeck from "@/components/okxproposal/OkxProposalDeck";
import PlanContent from "@/components/okxproposal/PlanContent";

const DESCRIPTION =
  "Programa de junio de AXIS: takeover del Cuarto Rosa en Bar Oriente, " +
  "Ciudad de México — 25 de junio de 2026. Propuesta de sede con " +
  "acceso por OKX app, recompensas, medios en sitio (LED 12 m, livestream, fotografía) y documentación.";

export const metadata: Metadata = {
  title: "AXIS, Programa de Junio, Propuesta de Sede",
  description: DESCRIPTION,
  keywords: [
    "AXIS",
    "Bar Oriente",
    "Cuarto Rosa",
    "25 junio 2026",
    "Ciudad de México",
    "evento de música",
    "propuesta de sede",
  ],
  alternates: { canonical: "/okxproposal" },
  openGraph: {
    title: "AXIS · Programa de Junio · Propuesta de Sede",
    description: DESCRIPTION,
    url: "https://axis.show/okxproposal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS · Programa de Junio · Propuesta de Sede",
    description: DESCRIPTION,
  },
};

export default function OkxProposalPage() {
  return (
    <>
      <PlanContent />
      <OkxProposalDeck />
    </>
  );
}
