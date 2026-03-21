import { notFound } from "next/navigation";
import { artistProfiles, findArtistProfile } from "@/src/content/artists";
import { magazineNavItems } from "@/src/lib/navigation";
import ArtistProfileClient from "./ArtistProfileClient";

export function generateStaticParams() {
  return artistProfiles.map((artist) => ({ slug: artist.slug }));
}

export default async function MagazineArtistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = findArtistProfile(slug);

  if (!artist) {
    notFound();
  }

  const relatedArtists = artistProfiles
    .filter((entry) => entry.slug !== artist.slug && entry.artistTypes.some((type) => artist.artistTypes.includes(type)))
    .slice(0, 3);

  return (
    <ArtistProfileClient
      artist={artist}
      relatedArtists={relatedArtists}
      allArtists={artistProfiles}
      navItems={magazineNavItems}
    />
  );
}
