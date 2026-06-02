import type { Metadata } from "next";
import ClubMexaRsvp from "@/components/clubmexa/ClubMexaRsvp";

export const metadata: Metadata = {
  title: "Clubmexa Check In",
  description: "Welcome to Club Mexa.",
  alternates: { canonical: "/clubmexa" },
  openGraph: {
    title: "Clubmexa Check In",
    description: "Welcome to Club Mexa.",
    url: "https://axis.show/clubmexa",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AXIS",
      },
    ],
  },
};

export default function ClubMexaPage() {
  return <ClubMexaRsvp />;
}
