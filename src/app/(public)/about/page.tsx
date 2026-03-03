import type { Metadata } from "next";
import { ArrowRight, Award, MapPin, Users, Zap } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { SectionHeading } from "@/components/section-heading";
import { isPublishedMediaUrl } from "@/lib/media-url";
import { getPublicAboutData, getPublicBrandData } from "@/lib/public-site-data";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the operators behind Hot Beam Productions. We plan and run live event systems for concerts, campus shows, and brand events.",
  alternates: { canonical: "/about" },
};

const statIcons = [Zap, Users, MapPin, Award];

export default async function AboutPage() {
  const [{ about }, { brand }] = await Promise.all([getPublicAboutData(), getPublicBrandData()]);

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]}
        />
        <SectionHeading
          label={about.heading.label}
          title={about.heading.title}
          subtitle={about.heading.subtitle}
        />

        <section className="mb-24" aria-labelledby="founders-heading">
          <p id="founders-heading" className="mono-label mb-8 !text-laser-cyan">
            Founders
          </p>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {about.partners.map((partner) => (
              <article
                key={partner.id}
                className="border border-border bg-surface p-7 transition-colors hover:border-laser-cyan/30"
              >
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden border border-border bg-surface-light">
                    {isPublishedMediaUrl(partner.imageUrl) ? (
                      <CmsImage
                        src={partner.imageUrl}
                        alt={partner.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder
                        label="Headshot"
                        aspect="square"
                        className="!aspect-auto !h-full"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-3xl tracking-tight text-foreground">
                      {partner.name}
                    </h3>
                    <p className="mono-label mt-1 !text-laser-cyan">{partner.role}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-light">{partner.bio}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-24 grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
              {about.storyTitle}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-light">
              {about.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative">
            <MediaPlaceholder label="Behind the scenes" aspect="portrait" className="border border-border" />
            <div className="absolute -bottom-4 -right-4 h-full w-full border border-laser-cyan/20 -z-10" />
          </div>
        </section>

        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Company statistics">
          {about.stats.map((stat, index) => {
            const Icon = statIcons[index] ?? Zap;

            return (
              <article key={stat.label} className="border border-border bg-surface p-6 text-center">
                <Icon className="mx-auto h-5 w-5 text-laser-cyan" aria-hidden="true" />
                <p className="mt-4 font-heading text-4xl leading-none text-foreground">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.13em] text-muted-light">{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section className="mb-24">
          <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
            Operating Principles
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {about.values.map((value) => (
              <article
                key={value.title}
                className="scanline-overlay border border-border bg-surface p-7 transition-colors hover:border-laser-cyan/30"
              >
                <h3 className="font-heading text-2xl tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-light">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {about.crew.length > 0 && (
          <section className="mb-24">
            <p className="mono-label mb-6 !text-laser-cyan">Specialists</p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {about.crew.map((member) => (
                <article key={member.id} className="text-center">
                  <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-light">
                    {isPublishedMediaUrl(member.imageUrl) ? (
                      <CmsImage
                        src={member.imageUrl}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder
                        label=""
                        aspect="square"
                        className="!aspect-auto !h-full"
                      />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{member.name}</p>
                  <p className="mono-label mt-1 !text-muted">{member.role}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="border border-border bg-surface px-8 py-12 text-center md:px-12 md:py-14">
          <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
            {about.closingCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-light">
            {about.closingCta.description}
          </p>
          <div className="mt-8">
            <GlowButton href={about.closingCta.button.href} variant="primary">
              {about.closingCta.button.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </section>
      </div>
    </div>
  );
}
