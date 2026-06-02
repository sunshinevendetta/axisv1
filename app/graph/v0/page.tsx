import type { Metadata } from "next";
import AxisGraphClient from "@/components/graph/v0/AxisGraphClient";

export const metadata: Metadata = {
  title: "Graph v0",
  description: "AXIS electronic music intelligence — relationship & influence network.",
};

export default function GraphV0Page() {
  return <AxisGraphClient />;
}
