import { getSettings } from "@/lib/content";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const settings = getSettings();
  return {
    rules: settings.indexable
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${settings.siteUrl}/sitemap.xml`,
  };
}
