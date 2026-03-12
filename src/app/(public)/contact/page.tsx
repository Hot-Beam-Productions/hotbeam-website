import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { HashFocusTarget } from "@/components/hash-focus-target";
import { SectionHeading } from "@/components/section-heading";
import { getPublicContactData } from "@/lib/public-site-data";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a production proposal from Hot Beam Productions. Share your event scope and get clear next steps within one business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { brand, contact } = await getPublicContactData();

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <BreadcrumbJsonLd
          baseUrl={brand.url}
          items={[
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
          ]}
        />
        <SectionHeading
          as="h1"
          label={contact.heading.label}
          title={contact.heading.title}
          subtitle={contact.heading.subtitle}
        />

        <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="border border-border bg-surface p-6 lg:col-span-2">
            <p className="mono-label !text-laser-cyan">What Happens Next</p>
            <ol className="mt-4 space-y-2">
              {contact.nextSteps.map((step, index) => (
                <li key={step} className="text-sm leading-relaxed text-muted-light">
                  <span className="mr-2 font-heading text-foreground">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </article>
          <article className="border border-border bg-surface p-6">
            <h2 className="font-heading text-xl tracking-tight text-foreground">{contact.urgentCallout.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-light">
              {contact.urgentCallout.description}
            </p>
            <a
              href={`tel:${brand.phoneHref}`}
              className="mono-label mt-4 inline-block !text-laser-cyan transition-colors hover:!text-foreground"
            >
              {brand.phoneDisplay}
            </a>
          </article>
        </section>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3">
          <aside className="space-y-8">
            <div>
              <h3 className="font-heading text-2xl tracking-tight text-foreground">
                {contact.directContactTitle}
              </h3>
              <div className="mt-5 space-y-4">
                <a
                  href={`mailto:${brand.email}`}
                  className="flex items-center gap-3 text-muted transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-laser-cyan" aria-hidden="true" />
                  <span className="text-sm">{brand.email}</span>
                </a>
                <a
                  href={`tel:${brand.phoneHref}`}
                  className="flex items-center gap-3 text-muted transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 text-laser-cyan" aria-hidden="true" />
                  <span className="text-sm">{brand.phoneDisplay}</span>
                </a>
                <p className="flex items-center gap-3 text-sm text-muted">
                  <MapPin className="h-4 w-4 text-laser-cyan" aria-hidden="true" />
                  {brand.location}
                </p>
              </div>
            </div>

            {contact.cards.map((card) => (
              <div key={card.title} className="border border-border bg-surface p-6">
                <h4 className="font-heading text-lg tracking-tight text-foreground">
                  {card.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-light">{card.body}</p>
              </div>
            ))}


            <div className="border border-border bg-surface p-6">
              <h4 className="font-heading text-lg tracking-tight text-foreground">Compliance & Safety</h4>
              <ul className="mt-3 space-y-2">
                {contact.complianceBadges.map((badge) => (
                  <li key={badge} className="text-sm leading-relaxed text-muted-light">
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <HashFocusTarget id="contact-form">
              <div className="border border-border bg-surface p-6 sm:p-8">
                <ContactForm contact={contact} />
              </div>
            </HashFocusTarget>
          </div>
        </div>
      </div>
    </div>
  );
}
