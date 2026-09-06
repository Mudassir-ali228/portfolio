import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
