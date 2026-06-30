import type { Metadata } from "next";
import { ArrowRight, CalendarCheck, MapPin, ShieldCheck, Zap } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { GlowButton } from "@/components/glow-button";
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

const statIcons = [CalendarCheck, ShieldCheck, Zap, MapPin];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
          as="h1"
          label={about.heading.label}
          title={about.heading.title}
          subtitle={about.heading.subtitle}
        />

        <section className="mb-24 md:mb-28" aria-labelledby="founders-heading">
          <p id="founders-heading" className="mono-label !text-laser-cyan">
            Founders
          </p>
          <div className="spec-line mt-6 w-24" />
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
            {about.partners.map((partner) => (
              <article key={partner.id} className="group">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface-light">
                  {isPublishedMediaUrl(partner.imageUrl) ? (
                    <CmsImage
                      src={partner.imageUrl}
                      alt={partner.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-light to-surface font-heading text-7xl font-bold tracking-tight text-laser-cyan/80"
                      aria-hidden="true"
                    >
                      {getInitials(partner.name)}
                    </div>
                  )}
                </div>
                <h3 className="mt-6 font-heading text-3xl tracking-tight text-foreground">
                  {partner.name}
                </h3>
                <p className="mono-label mt-2 !text-laser-cyan">{partner.role}</p>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted-light">{partner.bio}</p>
                {partner.email && (
                  <a
                    href={`mailto:${partner.email}`}
                    className="mono-label mt-3 inline-block !text-laser-cyan transition-colors hover:!text-foreground"
                  >
                    {partner.email}
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mb-24 md:mb-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <h2 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
                {about.storyTitle}
              </h2>
              <div className="spec-line mt-6 w-24" />
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-muted-light">
              {about.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-24 md:mb-28" aria-label="Track record">
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {about.stats.map((stat, index) => {
              const Icon = statIcons[index] ?? ShieldCheck;

              return (
                <div key={stat.label} className="bg-background p-6">
                  <Icon className="h-5 w-5 text-laser-cyan" aria-hidden="true" />
                  <p className="mt-4 font-heading text-3xl leading-none tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.13em] text-muted-light">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-24 md:mb-28">
          <h2 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
            Operating Principles
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {about.values.map((value) => (
              <article key={value.title} className="bg-background p-7">
                <h3 className="font-heading text-2xl tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-light">{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        {about.crew.length > 0 && (
          <section className="mb-24 md:mb-28" aria-labelledby="crew-heading">
            <p id="crew-heading" className="mono-label !text-laser-cyan">
              Crew
            </p>
            <div className="spec-line mt-6 w-24" />
            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
              {about.crew.map((member) => (
                <article key={member.id} className="group">
                  <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface-light">
                    {isPublishedMediaUrl(member.imageUrl) ? (
                      <CmsImage
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-light to-surface font-heading text-6xl font-bold tracking-tight text-laser-cyan/80"
                        aria-hidden="true"
                      >
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-5 font-heading text-2xl tracking-tight text-foreground">{member.name}</h3>
                  <p className="mono-label mt-2 !text-laser-cyan">{member.role}</p>
                  {member.bio && (
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-light">{member.bio}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="mono-label mt-3 inline-block !text-muted-light transition-colors hover:!text-laser-cyan"
                    >
                      {member.email}
                    </a>
                  )}
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
