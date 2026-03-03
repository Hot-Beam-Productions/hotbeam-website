import type { Metadata } from "next";
import { RentalsFilter } from "@/components/rentals-filter";
import { SectionHeading } from "@/components/section-heading";
import { getPublicRentalsData, getPublicBrandData } from "@/lib/public-site-data";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse show-ready rental inventory from Hot Beam Productions, including lighting, laser, video, staging, rigging, and power systems.",
  alternates: { canonical: "/rentals" },
};

export default async function RentalsPage() {
  const [{ rentals }, { brand }] = await Promise.all([getPublicRentalsData(), getPublicBrandData()]);

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "Inventory", href: "/rentals" },
          ]}
        />
        <SectionHeading
          as="h1"
          label={rentals.heading.label}
          title={rentals.heading.title}
          subtitle={rentals.heading.subtitle}
        />
        <RentalsFilter items={rentals.items} categories={rentals.categories} footerNote={rentals.footerNote} />
      </div>
    </div>
  );
}
