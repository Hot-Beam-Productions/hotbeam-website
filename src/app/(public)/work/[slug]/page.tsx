import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { getPublicWorkData, getPublicBrandData } from "@/lib/public-site-data";
import { isPublishedMediaUrl, stripMediaUrlDecorators } from "@/lib/media-url";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { buildSeoTitle, clampSeoDescription } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

function toAbsoluteUrl(baseUrl: string, pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, `${baseUrl}/`).toString();
  } catch {
    return pathOrUrl;
  }
}

const serviceStyles: Record<string, string> = {
  audio: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  lighting: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  video: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  lasers: "border-laser-cyan/35 bg-laser-cyan/10 text-laser-cyan",
  sfx: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export async function generateStaticParams() {
  const { work } = await getPublicWorkData();
  return work.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [{ work }, { brand }] = await Promise.all([getPublicWorkData(), getPublicBrandData()]);
  const project = work.projects.find((item) => item.slug === slug);

  if (!project) return { title: "Not Found" };

  const canonicalPath = `/work/${project.slug}`;
  const imageUrl = project.mainImageUrl
    ? toAbsoluteUrl(brand.url, stripMediaUrlDecorators(project.mainImageUrl))
    : null;
  const description = clampSeoDescription(project.description);
  const title = buildSeoTitle(project.title, brand.name);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "article",
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const [{ work }, { brand }] = await Promise.all([getPublicWorkData(), getPublicBrandData()]);
  const project = work.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${brand.url}/work/${project.slug}#event`,
    name: project.title,
    description: project.description,
    url: `${brand.url}/work/${project.slug}`,
    startDate: project.eventDate,
    location: { "@type": "Place", name: project.location },
    organizer: {
      "@type": "Organization",
      "@id": `${brand.url}/#organization`,
      name: brand.name,
      url: brand.url,
    },
    ...(project.mainImageUrl
      ? { image: toAbsoluteUrl(brand.url, stripMediaUrlDecorators(project.mainImageUrl)) }
      : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "Work", href: "/work" },
            { name: project.title, href: `/work/${project.slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema).replace(/</g, "\\u003c") }}
        />
        <Link
          href="/work"
          className="mono-label mb-10 inline-flex items-center gap-2 !text-muted transition-colors hover:!text-laser-cyan"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to work
        </Link>

        <header className="mb-10 space-y-4">
          <p className="mono-label !text-muted-light">
            {project.client} · {project.location}
          </p>
          <h1 className="font-heading text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-2 pt-1">
            {project.services.map((service) => (
              <span
                key={service}
                className={`rounded border px-3 py-1 text-xs capitalize tracking-wide ${serviceStyles[service] ?? "border-border bg-surface-light text-muted"}`}
              >
                {service}
              </span>
            ))}
            <span className="rounded border border-border bg-surface-light px-3 py-1 text-xs text-muted-light">
              {new Date(project.eventDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </header>

        <div className="mb-12 overflow-hidden border border-border bg-surface">
          {isPublishedMediaUrl(project.mainImageUrl) ? (
            <div className="relative aspect-video w-full">
              <CmsImage
                src={project.mainImageUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <MediaPlaceholder label="Hero image" aspect="video" />
          )}
        </div>

        <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <article className="space-y-4 text-base leading-relaxed text-muted lg:col-span-2">
            <p>{project.longDescription}</p>
          </article>

          <aside className="h-fit border border-border bg-surface p-6">
            <p className="mono-label mb-4 !text-foreground">Project Snapshot</p>
            <dl className="space-y-3 text-sm text-muted-light">
              <div className="flex items-center justify-between gap-4">
                <dt>Client</dt>
                <dd className="text-right text-foreground">{project.client}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Location</dt>
                <dd className="text-right text-foreground">{project.location}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Date</dt>
                <dd className="text-right text-foreground">
                  {new Date(project.eventDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Scope</dt>
                <dd className="text-right capitalize text-foreground">
                  {project.services.join(", ")}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        {project.gallery.length > 0 && (
          <section className="mb-16">
            <p className="mono-label mb-5 !text-foreground">Gallery</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {project.gallery.map((url, index) => (
                <div key={url} className="overflow-hidden border border-border bg-surface">
                  {isPublishedMediaUrl(url) ? (
                    <div className="relative aspect-video w-full">
                      <CmsImage src={url} alt={`${project.title} image ${index + 1}`} fill className="object-cover" />
                    </div>
                  ) : (
                    <MediaPlaceholder label="Gallery image" aspect="video" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col items-start justify-between gap-5 border-t border-border pt-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
              Planning a Similar Show?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Share your scope and timeline. We will map a practical production approach.
            </p>
          </div>
          <GlowButton href="/contact" variant="primary">
            Request a Proposal
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
