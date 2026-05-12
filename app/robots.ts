import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/magazine",
          "/magazine/artists",
          "/magazine/mixtapes",
          "/magazine/markets",
          "/arapp",
          "/arapp/collect",
          "/membership",
          "/members",
        ],
        disallow: [
          "/owner/",
          "/api/",
          "/tools/",
        ],
      },
    ],
    sitemap: "https://axis.show/sitemap.xml",
    host: "https://axis.show",
  };
}
