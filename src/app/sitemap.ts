import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ["", "/docs", "/privacy", "/terms", "/imprint"].map((path) => ({
    url: `${siteUrl()}${path}`,
    lastModified,
  }));
}
