import { notFound } from "next/navigation";
import { artistProfiles, findArtistProfile } from "@/src/content/artists";
import { magazineNavItems } from "@/src/lib/navigation";
import { getEditorialPublicIndexEntries } from "@/src/lib/editorial-public";
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

  // Articles that mention this artist by name or alias
  const allArticles = await getEditorialPublicIndexEntries();
  const nameLower = artist.name.toLowerCase();
  const aliasesLower = artist.aliases.map((a) => a.toLowerCase());
  const artistArticles = allArticles
    .filter((article) =>
      Array.isArray(article.linkedArtists) &&
      article.linkedArtists.some(
        (linked) =>
          linked.toLowerCase() === nameLower ||
          aliasesLower.some((alias) => alias === linked.toLowerCase()),
      ),
    )
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      date: article.date,
      excerpt: article.excerpt,
      readTime: article.readTime,
    }));

  return (
    <ArtistProfileClient
      artist={artist}
      relatedArtists={relatedArtists}
      allArtists={artistProfiles}
      navItems={magazineNavItems}
      artistArticles={artistArticles}
    />
  );
}
