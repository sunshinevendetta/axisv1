import type { Metadata } from "next";
import PlanBarOrienteDeck from "@/components/planbaroriente/PlanBarOrienteDeck";
import PlanContent from "@/components/planbaroriente/PlanContent";

const DESCRIPTION =
  "Programa de junio de AXIS: dos noches de takeover del Cuarto Rosa en Bar Oriente, " +
  "Ciudad de México — 18 y 25 de junio de 2026. Noche uno: lanzamiento de Brugee Records " +
  "con Sunshine Vendetta, Coronela b2b Chino Marley y Santi Santana. Propuesta de sede con " +
  "acceso por wallet, recompensas, medios en sitio (LED 12 m, livestream, fotografía) y documentación.";

export const metadata: Metadata = {
  title: "AXIS, Programa de Junio, Propuesta de Sede",
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
    "propuesta de sede",
  ],
  alternates: { canonical: "/planbaroriente" },
  openGraph: {
    title: "AXIS · Programa de Junio · Propuesta de Sede",
    description: DESCRIPTION,
    url: "https://axis.show/planbaroriente",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIS · Programa de Junio · Propuesta de Sede",
    description: DESCRIPTION,
  },
};

export default function PlanBarOrientePage() {
  return (
    <>
      <PlanContent />
      <PlanBarOrienteDeck />
    </>
  );
}
