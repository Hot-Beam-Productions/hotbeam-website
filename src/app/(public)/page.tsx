import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { HeroBeams } from "@/components/hero-animations";
import { InstagramFeed } from "@/components/instagram-feed";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { CmsImage } from "@/components/cms-image";
import { isPublishedMediaUrl } from "@/lib/media-url";
import { getPublicHomePageData, getPublicBrandSeoData } from "@/lib/public-site-data";
import { clampSeoDescription, clampSeoTitle } from "@/lib/seo";

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
  const heroVideoSrc = home.hero.videoUrl || "/sae%20proppa%20odd%20mob%202.mov";
  const heroVideoType = home.hero.videoUrl
    ? /\.webm(?:\?|#|$)/i.test(home.hero.videoUrl)
      ? "video/webm"
      : "video/mp4"
    : "video/quicktime";
  const heroVideoPoster = home.hero.videoPoster || "/og-default.jpg";

  return (
    <>
      <section className="relative flex h-screen items-center justify-center overflow-clip">
        <div className="absolute inset-0">
          <video className="h-full w-full object-cover" autoPlay loop muted playsInline poster={heroVideoPoster}>
            <source src={heroVideoSrc} type={heroVideoType} />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt=""
            width={600}
            height={600}
            className="h-auto w-[clamp(16rem,40vw,36rem)]"
            priority
          />
        </div>
      </section>

      <section className="relative px-6 pb-20 pt-16">
        <HeroBeams />

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <p className="mono-label mb-6 !text-laser-cyan">{home.hero.eyebrow}</p>

          <h1 className="mx-auto max-w-4xl font-heading text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            {home.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-light md:text-lg">
            {home.hero.subheadline}
          </p>

          <p className="mt-6 font-heading text-xl tracking-[0.2em] text-foreground/90 uppercase md:text-2xl">
            {home.hero.departmentLine}
          </p>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-muted-light md:text-lg">
            {home.hero.description}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <GlowButton href={home.hero.primaryCta.href} variant="primary">
              {home.hero.primaryCta.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
            <GlowButton href={home.hero.secondaryCta.href} variant="outline">
              {home.hero.secondaryCta.label}
            </GlowButton>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {home.results.map((item) => (
              <div key={item.label} className="border border-border bg-surface px-5 py-4 text-left">
                <p className="font-heading text-3xl leading-none text-foreground">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-light">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16" aria-label="Trust signals">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 border border-border bg-surface p-5 lg:grid-cols-4">
          {home.trustSignals.map((signal) => (
            <p key={signal} className="mono-label !text-foreground/70">
              {signal}
            </p>
          ))}
        </div>
      </section>

      <section id="capabilities" className="px-6 py-24" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="services-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
            Core Services
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <article className="border border-border bg-surface p-6">
              <h3 id="intelligent-lighting" className="font-heading text-3xl tracking-tight text-foreground">
                Lighting Design and Show Operation
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                We design, previsualize, and run lighting systems built for live pacing, camera needs, and
                real venue constraints. Every rig is programmed, tested, and deployment-ready before load-in.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>Previsualization and cue programming</li>
                <li>grandMA and Avolites control workflows</li>
                <li>Indoor and IP-rated outdoor systems</li>
              </ul>
            </article>

            <article className="border border-border bg-surface p-6">
              <h3 id="class-iv-lasers" className="font-heading text-3xl tracking-tight text-foreground">
                Laser Design and Operation
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                From beam architecture to live playback, we build laser moments that fit the music and
                integrate with the rest of your show file. Safety and variance compliance stay built in from
                day one.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>Pangolin Beyond Programming</li>
                <li>FDA variance-compliant workflows</li>
                <li>Timecode, DMX, and Art-Net integration</li>
              </ul>
            </article>

            <article className="border border-border bg-surface p-6">
              <h3 id="led-video-walls" className="font-heading text-3xl tracking-tight text-foreground">
                LED Video and Media Systems
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                We deploy LED walls and media servers that hold up under show pressure. Content playback,
                IMAG, and venue-specific mapping are configured for stable operation and fast recovery.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>LED wall processing and mapping</li>
                <li>Media server and playback systems</li>
                <li>Multi-camera and IMAG support</li>
              </ul>
            </article>
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
        <div className="mx-auto max-w-7xl border border-border bg-surface p-8">
          <h2 id="equipment-inventory-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
            Show-Ready Inventory
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-light">
            Lighting, laser, video, rigging, and power systems maintained for fast deployment and predictable
            performance.
          </p>
          <ul className="mt-6 grid list-disc gap-3 pl-5 text-sm text-muted-light md:grid-cols-2 lg:grid-cols-3">
            <li>Laser control and projector packages</li>
            <li>Moving lights, strobes, and wash fixtures</li>
            <li>LED wall and media server systems</li>
            <li>Truss, lifts, and rigging hardware</li>
            <li>Stage decks and support infrastructure</li>
            <li>Power distribution and cabling</li>
          </ul>
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
