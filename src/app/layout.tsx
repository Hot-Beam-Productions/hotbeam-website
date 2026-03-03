import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getPublicBrandSeoData } from "@/lib/public-site-data";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { brand, seo } = await getPublicBrandSeoData();

  return {
    metadataBase: new URL(brand.url),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      siteName: brand.name,
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: brand.name }],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { brand, seo } = await getPublicBrandSeoData();

  const offerCatalog = {
    "@type": "OfferCatalog",
    name: "Event Production Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Concert Lighting Rental" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Class IV Laser Operations" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "LED Video Wall Deployment" },
      },
    ],
  };

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${brand.url}/#website`,
        name: brand.name,
        url: brand.url,
        description: seo.description,
        publisher: { "@type": "Organization", "@id": `${brand.url}/#organization` },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${brand.url}/#local-business`,
        name: brand.name,
        url: brand.url,
        telephone: brand.phoneHref,
        email: brand.email,
        description: seo.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Denver",
          addressRegion: "CO",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "39.7392",
          longitude: "-104.9903",
        },
        areaServed: [
          { "@type": "State", name: "Colorado" },
          { "@type": "Country", name: "United States" },
        ],
        hasOfferCatalog: offerCatalog,
      },
      {
        "@type": "Organization",
        "@id": `${brand.url}/#organization`,
        name: brand.name,
        url: brand.url,
        email: brand.email,
        hasOfferCatalog: offerCatalog,
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaGraph),
          }}
        />
      </head>
      <body
        className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
