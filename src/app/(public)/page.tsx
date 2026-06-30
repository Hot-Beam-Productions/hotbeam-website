import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lightbulb, Monitor, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { HeroBeams } from "@/components/hero-animations";
import { ScrollCue } from "@/components/scroll-cue";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { InstagramFeed } from "@/components/instagram-feed";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { CmsImage } from "@/components/cms-image";
import { getSupportedVideoMimeType, isPublishedMediaUrl, isSupportedVideoUrl } from "@/lib/media-url";
import { getPublicHomePageData, getPublicBrandSeoData } from "@/lib/public-site-data";
import { clampSeoDescription, clampSeoTitle } from "@/lib/seo";

const serviceIcons: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  monitor: Monitor,
  zap: Zap,
  sparkles: Sparkles,
};

export async function generateMetadata(): Promise<Metadata> {
  const { brand, seo } = await getPublicBrandSeoData();
  const description = clampSeoDescription(seo.description);

  return {
    title: { absolute: clampSeoTitle(seo.defaultTitle) },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: brand.name,
      description,
      url: "/",
      type: "website",
    },
  };
}

export default async function Home() {
  const { home, work, brand } = await getPublicHomePageData();
  const featuredProjects = work.projects.filter((project) => project.featured).slice(0, 3);
  const heroVideoSrc = isSupportedVideoUrl(home.hero.videoUrl) ? home.hero.videoUrl : "/hero-showreel.mp4";
  const heroVideoType = getSupportedVideoMimeType(heroVideoSrc);
  const heroVideoPoster = home.hero.videoPoster || "/hero-showreel-poster.jpg";

  return (
    <>
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-clip px-6 py-24 text-center">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={heroVideoPoster}
            aria-hidden="true"
          >
            <source src={heroVideoSrc} type={heroVideoType} />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(3,5,14,0.6))]" />
        </div>

        <HeroBeams />

        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
          <p className="mono-label mb-7 !text-laser-cyan">{home.hero.departmentLine}</p>
          <Image
            src="/logo.png"
            alt={brand.name}
            width={6000}
            height={3273}
            priority
            className="h-auto w-[min(86vw,44rem)] drop-shadow-[0_10px_45px_rgba(0,0,0,0.6)]"
          />
          <h1 className="mt-9 max-w-3xl font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-[2.6rem]">
            {home.hero.headline}
          </h1>
          <div className="mt-9">
            <GlowButton href={home.hero.primaryCta.href} variant="primary">
              {home.hero.primaryCta.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </div>

        <ScrollCue />
      </section>

      <section className="px-6 py-20 md:py-28" aria-labelledby="intro-heading">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="mono-label !text-laser-cyan">{home.hero.eyebrow}</p>
            <h2
              id="intro-heading"
              className="mt-5 max-w-4xl font-heading text-3xl leading-[1.1] tracking-tight text-foreground md:text-5xl"
            >
              {home.hero.subheadline}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-light md:text-lg">
              {home.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-light">
              {home.quickDecisionSignals.map((signal) => (
                <p key={signal} className="flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-laser-cyan"
                    aria-hidden="true"
                  />
                  {signal}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {home.results.map((item) => (
                <div key={item.label} className="border border-border bg-surface px-6 py-6">
                  <p className="font-heading text-4xl leading-none text-foreground">{item.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-light">{item.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 border border-border bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
              {home.trustSignals.map((signal) => (
                <p key={signal} className="flex gap-2.5 text-xs leading-relaxed text-muted-light">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 bg-laser-cyan" aria-hidden="true" />
                  {signal}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="booking-flow-heading">
        <div className="mx-auto max-w-7xl border border-border bg-surface p-8 md:p-10">
          <p className="mono-label !text-laser-cyan">{home.bookingFlow.label}</p>
          <h2 id="booking-flow-heading" className="mt-3 font-heading text-4xl tracking-tight md:text-5xl">
            {home.bookingFlow.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-light md:text-base">
            {home.bookingFlow.description}
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {home.bookingFlow.steps.map((step, index) => (
              <article key={step.title} className="border border-border bg-surface-light/30 p-6">
                <p className="mono-label !text-laser-cyan">Step {index + 1}</p>
                <h3 className="mt-3 font-heading text-2xl tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-light">{step.description}</p>
              </article>
            ))}
          </div>

          <p className="mt-7 text-xs leading-relaxed text-muted">
            {home.bookingFlow.assurance}
          </p>
          <Link
            href={home.bookingFlow.cta.href}
            className="mono-label mt-5 inline-block !text-laser-cyan transition-colors hover:!text-foreground"
          >
            {home.bookingFlow.cta.label} &rarr;
          </Link>
        </div>
      </section>

      <section id="capabilities" className="px-6 py-24" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            as="h2"
            label={home.services.label}
            title={home.services.title}
            subtitle={home.services.subtitle}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {home.services.items.map((service) => {
              const Icon = serviceIcons[service.icon] ?? Zap;
              return (
                <Reveal key={service.id}>
                  <article className="h-full border border-border bg-surface p-7 transition-colors hover:border-laser-cyan/40">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-laser-cyan/30 bg-laser-cyan/10 text-laser-cyan">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-heading text-2xl tracking-tight text-foreground">{service.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-light">{service.description}</p>
                    <ul className="mt-5 space-y-2 text-sm text-muted-light">
                      {service.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2.5">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-laser-cyan" aria-hidden="true" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="event-categories-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="event-categories-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
            Who We Work With
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="border border-border bg-surface p-6">
              <h3 className="font-heading text-2xl tracking-tight text-foreground">Touring Artists</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-light">
                Rider-aware production packages that travel cleanly and adapt across venues without sacrificing
                consistency.
              </p>
            </article>
            <article className="border border-border bg-surface p-6">
              <h3 className="font-heading text-2xl tracking-tight text-foreground">Corporate & Brand Events</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-light">
                Polished technical execution for keynotes, launches, and broadcasts where timing and brand
                control matter.
              </p>
            </article>
            <article className="border border-border bg-surface p-6">
              <h3 className="font-heading text-2xl tracking-tight text-foreground">Collegiate & Campus Events</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-light">
                High-impact concert environments for campus events, with practical planning that keeps safety
                and schedule on track.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="equipment-inventory-heading">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border border-border bg-surface p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 id="equipment-inventory-heading" className="font-heading text-3xl tracking-tight md:text-4xl">
              Show-Ready Inventory
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-light">
              Lighting, laser, video, rigging, and power systems &mdash; maintained in-house for fast
              deployment and predictable performance on show day.
            </p>
          </div>
          <GlowButton href="/rentals" variant="outline">
            Browse Inventory
            <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
          </GlowButton>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="featured-work-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mono-label mb-3 !text-laser-cyan">Case Studies</p>
              <h2 id="featured-work-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
                Selected Projects
              </h2>
            </div>
            <Link
              href="/work"
              className="mono-label !text-muted-light transition-colors hover:!text-laser-cyan"
            >
              View all work &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className="group overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-laser-cyan/45"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-light">
                  {isPublishedMediaUrl(project.mainImageUrl) ? (
                    <CmsImage
                      src={project.mainImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <MediaPlaceholder label="Project media" aspect="video" className="!aspect-auto h-full" />
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="mono-label !text-muted-light">{project.client}</p>
                  <h3 className="font-heading text-2xl tracking-tight text-foreground transition-colors group-hover:text-laser-cyan">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-light">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InstagramFeed brand={brand} />

      <section className="px-6 pb-28 pt-16">
        <div className="mx-auto max-w-4xl border border-laser-cyan/20 bg-surface px-8 py-14 text-center md:px-14 md:py-20">
          <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
            {home.closingCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-light">
            {home.closingCta.description}
          </p>
          <div className="mt-9">
            <GlowButton href={home.closingCta.button.href} variant="primary">
              {home.closingCta.button.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}
