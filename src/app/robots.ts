import type { MetadataRoute } from "next";
import { getPublicBrandData } from "@/lib/public-site-data";

// Explicitly welcome AI answer/search crawlers for maximum generative-engine
// visibility, while still keeping the admin area out of all indexes.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "Meta-ExternalAgent",
  "cohere-ai",
  "CCBot",
];

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
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
  };
}
