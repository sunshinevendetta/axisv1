import type { Mixtape } from "@/components/magazine/mixtapes/types";
import type { MagazineArticle } from "@/components/magazine/types";
import HomePageClient from "@/components/home/HomePageClient";
import { artistGenreIndex, artistTypeIndex, featuredArtistProfiles } from "@/src/content/artists";
import { getEditorialPublicMagazineData } from "@/src/lib/editorial-public";
import { getUpcomingEpisodes } from "@/src/lib/episodes";
import { arappDrops } from "@/src/lib/arapp-catalog";
import rawMixtapes from "@/content/mixtapes.json";

const mixtapes = rawMixtapes as Mixtape[];

export default async function Home() {
  const { articles } = await getEditorialPublicMagazineData();
  const upcomingEpisodes = getUpcomingEpisodes().map((ep) => ({
    title: ep.title,
    startsAtISO: ep.startsAt,
    city: ep.city,
  }));

  return (
    <HomePageClient
      upcomingEpisodes={upcomingEpisodes}
      mixtapes={mixtapes}
      articles={articles}
      featuredArtists={featuredArtistProfiles}
      musicCount={artistTypeIndex.find((entry) => entry.slug === "music")?.count ?? 0}
      visualCount={artistTypeIndex.find((entry) => entry.slug === "visual")?.count ?? 0}
      genreLabels={artistGenreIndex.slice(0, 6).map((entry) => entry.label)}
      drops={arappDrops}
    />
  );
}
