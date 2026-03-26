import type { MetadataRoute } from "next";
import { episodeCatalog } from "@/src/content/episodes";
import { artistProfiles } from "@/src/content/artists";

const siteUrl = "https://axis.show";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/magazine",
    "/magazine/artists",
    "/magazine/mixtapes",
    "/magazine/markets",
    "/docs",
    "/docs/diagrams",
    "/arapp",
    "/arapp/collect",
    "/owner/episodes",
    "/owner/contracts",
    "/owner/artists",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const artistRoutes: MetadataRoute.Sitemap = artistProfiles.map((artist) => ({
    url: `${siteUrl}/magazine/artists/${artist.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const episodeRoutes: MetadataRoute.Sitemap = episodeCatalog.map((episode) => ({
    url: `${siteUrl}/arapp/collect/${episode.slug}`,
    lastModified: new Date(episode.startsAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...artistRoutes, ...episodeRoutes];
}
