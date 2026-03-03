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

export async function generateMetadata(): Promise<Metadata> {
  const { brand, seo } = await getPublicBrandSeoData();

  return {
    title: { absolute: seo.defaultTitle },
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: brand.name,
      description: seo.description,
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
  const heroVideoPoster = home.hero.videoPoster || undefined;

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
            What We Do
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <article className="border border-border bg-surface p-6">
              <h3 id="intelligent-lighting" className="font-heading text-3xl tracking-tight text-foreground">
                Lighting Design & Operation
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                From CAD pre-vis to live FOH operation, we design and run lighting rigs that move with the
                performance. Our inventory includes IP-rated moving heads, LED wash fixtures, and custom truss
                packages — all programmed, tested, and show-ready before we ever leave the shop.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>Avolites & grandMA Control</li>
                <li>IP65 Outdoor-Rated Fixtures</li>
                <li>Full CAD Pre-Visualization</li>
              </ul>
            </article>

            <article className="border border-border bg-surface p-6">
              <h3 id="class-iv-lasers" className="font-heading text-3xl tracking-tight text-foreground">
                Laser Shows & Programming
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                We specialize in Class IV laser programming and live operation using Pangolin Beyond. From
                aerial beam shows to projection mapping, every laser element integrates cleanly into your
                existing DMX universe. Every show is fully FDA variance-compliant — no shortcuts on safety, ever.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>Pangolin Beyond Programming</li>
                <li>FDA Variance-Compliant</li>
                <li>Full DMX Integration</li>
              </ul>
            </article>

            <article className="border border-border bg-surface p-6">
              <h3 id="led-video-walls" className="font-heading text-3xl tracking-tight text-foreground">
                LED Video & Media Servers
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-light">
                Scalable LED video walls and media server programming built for immersive visual storytelling.
                Whether it&apos;s live IMAG, custom motion graphics, or venue-mapped content, we tailor every
                pixel to your stage and your story.
              </p>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-light">
                <li>Resolume Media Servers</li>
                <li>Live Multi-Camera IMAG</li>
                <li>Venue-Specific Deployment Planning</li>
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
                Scalable lighting and visual packages that integrate with your rider and adapt to every room
                on the run. We work directly with TMs and PMs to make advancing seamless.
              </p>
            </article>
            <article className="border border-border bg-surface p-6">
              <h3 className="font-heading text-2xl tracking-tight text-foreground">Corporate & Brand Events</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-light">
                Clean, reliable production for keynotes, brand activations, and live broadcasts. Everything
                runs on time, looks polished, and stays on-brand.
              </p>
            </article>
            <article className="border border-border bg-surface p-6">
              <h3 className="font-heading text-2xl tracking-tight text-foreground">Collegiate & Campus Events</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-light">
                Festival-grade lighting, lasers, and staging for Greek life, campus organizations, and
                university events. We handle the production so you can focus on the experience.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="equipment-inventory-heading">
        <div className="mx-auto max-w-7xl border border-border bg-surface p-8">
          <h2 id="equipment-inventory-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
            Rider-Ready Gear
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-light">
            Tour-tested hardware from leading manufacturers — maintained, prepped, and ready to meet your rider.
          </p>
          <ul className="mt-6 grid list-disc gap-3 pl-5 text-sm text-muted-light md:grid-cols-2 lg:grid-cols-3">
            <li>Pangolin Beyond Laser Control</li>
            <li>Chauvet Professional Moving Fixtures</li>
            <li>Resolume Media Server Packages</li>
            <li>IP-Rated Laser Projectors</li>
            <li>Touring-Grade Truss & Rigging</li>
            <li>Signal & Power Distribution</li>
          </ul>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="featured-work-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mono-label mb-3 !text-laser-cyan">Our Work</p>
              <h2 id="featured-work-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
                Recent Projects
              </h2>
            </div>
            <Link
              href="/work"
              className="mono-label !text-muted-light transition-colors hover:!text-laser-cyan"
            >
              See all projects &rarr;
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
