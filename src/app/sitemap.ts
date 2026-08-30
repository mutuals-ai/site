import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://getmutuals.ai",
      lastModified: new Date(),
    },
  ];
}
