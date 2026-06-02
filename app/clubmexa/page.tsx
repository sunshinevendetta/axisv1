import type { Metadata } from "next";
import ClubMexaRsvp from "@/components/clubmexa/ClubMexaRsvp";

export const metadata: Metadata = {
  title: "Clubmexa RSVP",
  description: "A simple Clubmexa RSVP check-in by AXIS.",
  alternates: { canonical: "/clubmexa" },
  openGraph: {
    title: "Clubmexa RSVP",
    description: "A simple Clubmexa RSVP check-in by AXIS.",
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
