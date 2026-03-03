import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { getPublicRentalsData, getPublicBrandData } from "@/lib/public-site-data";
import { isPublishedMediaUrl, stripMediaUrlDecorators } from "@/lib/media-url";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

interface Props {
  params: Promise<{ id: string }>;
}

function toAbsoluteUrl(baseUrl: string, pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, `${baseUrl}/`).toString();
  } catch {
    return pathOrUrl;
  }
}

function toPropertyValue(spec: string): { "@type": "PropertyValue"; name?: string; value: string } {
  const [name, ...rest] = spec.split(":");
  if (rest.length === 0) {
    return { "@type": "PropertyValue", value: spec };
  }

  return {
    "@type": "PropertyValue",
    name: name.trim(),
    value: rest.join(":").trim(),
  };
}

export async function generateStaticParams() {
  const { rentals } = await getPublicRentalsData();
  return rentals.items.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [{ rentals }, { brand }] = await Promise.all([getPublicRentalsData(), getPublicBrandData()]);
  const item = rentals.items.find((entry) => entry.id === id);

  if (!item) return { title: "Not Found" };
  const canonicalPath = `/rentals/${item.slug}`;
  const imageUrl = isPublishedMediaUrl(item.imageUrl)
    ? toAbsoluteUrl(brand.url, stripMediaUrlDecorators(item.imageUrl))
    : null;

  return {
    title: `${item.name} Rental`,
    description: item.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${item.name} | ${item.brand}`,
      description: item.description,
      url: canonicalPath,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const [{ rentals }, { brand }] = await Promise.all([getPublicRentalsData(), getPublicBrandData()]);
  const item = rentals.items.find((entry) => entry.id === id);
  if (!item) notFound();

  const relatedItems = rentals.items.filter((entry) => item.frequentlyRentedTogether?.includes(entry.id));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${brand.url}/rentals/${item.slug}#product`,
    name: item.name,
    sku: item.id,
    category: item.category,
    url: `${brand.url}/rentals/${item.slug}`,
    description: item.description,
    brand: { "@type": "Brand", name: item.brand },
    ...(isPublishedMediaUrl(item.imageUrl)
      ? { image: toAbsoluteUrl(brand.url, stripMediaUrlDecorators(item.imageUrl)) }
      : {}),
    additionalProperty: item.specs.map(toPropertyValue),
    offers: {
      "@type": "Offer",
      url: `${brand.url}/rentals/${item.slug}`,
      availability: item.available
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        "@id": `${brand.url}/#organization`,
        name: brand.name,
      },
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    },
  };

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "Inventory", href: "/rentals" },
            { name: item.name, href: `/rentals/${item.id}` },
          ]}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }}
        />
        <Link
          href="/rentals"
          className="mono-label mb-10 inline-flex items-center gap-2 !text-muted transition-colors hover:!text-laser-cyan"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to inventory
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="overflow-hidden border border-border bg-surface">
            {isPublishedMediaUrl(item.imageUrl) ? (
              <div className="relative aspect-square w-full">
                <CmsImage
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <MediaPlaceholder label="Inventory image" aspect="square" />
            )}
          </div>

          <article>
            <p className="mono-label !text-laser-cyan">{item.brand}</p>
            <h1 className="mt-2 font-heading text-5xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
              {item.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{item.description}</p>

            <div className="mt-6 flex items-center gap-2 text-sm">
              {item.available ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  <span className="mono-label !text-emerald-300">Available for current dates</span>
                </>
              ) : (
                <>
                  <CircleAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                  <span className="mono-label !text-amber-200">Check availability</span>
                </>
              )}
            </div>

            {item.specs.length > 0 && (
              <section className="mt-7 border border-border bg-surface p-5">
                <p className="mono-label mb-3 !text-foreground">Key Specs</p>
                <ul className="space-y-2">
                  {item.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2 text-sm text-muted-light">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-laser-cyan" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relatedItems.length > 0 && (
              <section className="mt-7 border border-border bg-surface p-5">
                <p className="mono-label mb-3 !text-foreground">Frequently Rented Together</p>
                <ul className="space-y-2">
                  {relatedItems.map((related) => (
                    <li key={related.id}>
                      <Link className="text-sm text-laser-cyan hover:underline" href={`/rentals/${related.id}`}>
                        {related.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-7 border-t border-border pt-6">
              <GlowButton href="/contact" variant="primary">
                Inquire About This Unit
              </GlowButton>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
