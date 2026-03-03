import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { SectionHeading } from "@/components/section-heading";
import { isPublishedMediaUrl } from "@/lib/media-url";
import { getPublicWorkData, getPublicBrandData } from "@/lib/public-site-data";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected live event productions by Hot Beam Productions, including amphitheater, festival, and corporate technical environments.",
  alternates: { canonical: "/work" },
};

const serviceStyles: Record<string, string> = {
  audio: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  lighting: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  video: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  lasers: "border-laser-cyan/35 bg-laser-cyan/10 text-laser-cyan",
  sfx: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default async function WorkPage() {
  const [{ work }, { brand }] = await Promise.all([getPublicWorkData(), getPublicBrandData()]);

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "Work", href: "/work" },
          ]}
        />
        <SectionHeading
          label={work.heading.label}
          title={work.heading.title}
          subtitle={work.heading.subtitle}
        />

        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {work.projects.map((project, index) => (
            <div key={project.id} className="break-inside-avoid">
              <Link
                href={`/work/${project.slug}`}
                className="group block overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-laser-cyan/45"
                aria-label={`Open project details for ${project.title}`}
              >
                <div
                  className="relative w-full overflow-hidden bg-surface-light"
                  style={{ height: `${260 + (index % 3) * 70}px` }}
                >
                  {isPublishedMediaUrl(project.mainImageUrl) ? (
                    <CmsImage
                      src={project.mainImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <MediaPlaceholder
                      label="Project media"
                      aspect="video"
                      className="!aspect-auto h-full"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <p className="mono-label !text-muted-light">
                    {project.client} · {project.location}
                  </p>
                  <h3 className="font-heading text-2xl tracking-tight text-foreground transition-colors group-hover:text-laser-cyan">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-light">{project.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.services.map((service) => (
                      <span
                        key={service}
                        className={`rounded border px-2 py-1 text-[11px] capitalize tracking-wide ${serviceStyles[service] ?? "border-border bg-surface-light text-muted"}`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
