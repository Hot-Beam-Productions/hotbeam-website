import type { MetadataRoute } from "next";
import { getPublicBrandData } from "@/lib/public-site-data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const {
    brand: { url },
  } = await getPublicBrandData();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
  };
}
