import type { MetadataRoute } from "next";

import {
  getPublishedBlocks,
  getPublishedComponentsOnly,
} from "@/registry/components";

const SITE_URL = "https://2lazyui.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/components`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/blocks`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/docs`, changeFrequency: "monthly" as const, priority: 0.7 },
  ].map((r) => ({ ...r, lastModified: now }));

  const componentRoutes: MetadataRoute.Sitemap = getPublishedComponentsOnly().map(
    (c) => ({
      url: `${SITE_URL}/components/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  const blockRoutes: MetadataRoute.Sitemap = getPublishedBlocks().map((b) => ({
    url: `${SITE_URL}/blocks/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...componentRoutes, ...blockRoutes];
}
