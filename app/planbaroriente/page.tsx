import type { Metadata } from "next";
import PlanBarOrienteDeck from "@/components/planbaroriente/PlanBarOrienteDeck";

export const metadata: Metadata = {
  title: "AXIS, Programa de Junio, Propuesta de Sede",
  alternates: { canonical: "/planbaroriente" },
  openGraph: {
    title: "AXIS · Programa de Junio · Propuesta de Sede",
    url: "https://axis.show/planbaroriente",
  },
};

export default function PlanBarOrientePage() {
  return <PlanBarOrienteDeck />;
}
