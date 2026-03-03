import type { MetadataRoute } from "next";
import { getPublicSitemapData } from "@/lib/public-site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {
    brand: { url },
    navigation,
    work,
    rentals,
  } = await getPublicSitemapData();

  const baseRoutes = navigation
    .map((item) => item.href)
    .map((href) => {
      if (!href.startsWith("/")) {
        return null;
      }

      const route = href.split(/[?#]/)[0] || "/";

      return route.startsWith("/") ? route : null;
    })
    .filter((route): route is string => Boolean(route));
  const legalRoutes = ["/privacy-policy", "/terms-of-use", "/site-map"];

  const projectRoutes = work.projects.map((project) => `/work/${project.slug}`);
  const rentalRoutes = rentals.items.map((rental) => `/rentals/${rental.slug}`);

  const allRoutes = [...new Set(["/", ...baseRoutes, ...legalRoutes, ...projectRoutes, ...rentalRoutes])];

  const now = new Date();

  return allRoutes.map((route) => ({
    url: `${url}${route}`,
    lastModified: now,
    changeFrequency: getChangeFrequency(route),
    priority: getRoutePriority(route),
  }));
}

function getRoutePriority(route: string): number {
  if (route === "/") return 1.0;
  if (route === "/contact") return 0.9;
  if (route === "/work" || route === "/rentals" || route === "/about") return 0.8;
  if (route.startsWith("/work/") || route.startsWith("/rentals/")) return 0.6;
  return 0.3;
}

function getChangeFrequency(route: string): "weekly" | "monthly" | "yearly" {
  if (route === "/" || route === "/work" || route === "/rentals" || route === "/contact") return "weekly";
  if (route.startsWith("/work/") || route.startsWith("/rentals/")) return "monthly";
  return "yearly";
}
