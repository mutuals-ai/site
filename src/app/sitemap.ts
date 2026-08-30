import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(),
      lastModified: new Date(),
    },
  ];
}
