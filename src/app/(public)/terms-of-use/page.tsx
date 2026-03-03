import type { Metadata } from "next";
import { getPublicBrandData } from "@/lib/public-site-data";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms that govern access to and use of the Hot Beam Productions website.",
  alternates: { canonical: "/terms-of-use" },
};

export default async function TermsOfUsePage() {
  const {
    brand: { name, email },
  } = await getPublicBrandData();

  const effectiveDate = "February 27, 2026";

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mono-label !text-laser-cyan">Legal</p>
        <h1 className="mt-3 font-heading text-5xl tracking-tight text-foreground md:text-6xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-sm text-muted">Effective date: {effectiveDate}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted md:text-base">
          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing this website, you agree to these Terms of Use and all applicable laws. If you do
              not agree, please do not use this site.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Permitted Use</h2>
            <p className="mt-3">
              You may use this website only for lawful purposes, including learning about {name} and
              requesting services. You may not interfere with site operations, attempt unauthorized access,
              or misuse content.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Intellectual Property</h2>
            <p className="mt-3">
              All content, designs, logos, text, graphics, and media on this website are owned by {name} or
              used with permission. You may not reproduce or distribute any content without prior written
              consent.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">No Warranty</h2>
            <p className="mt-3">
              This website is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties,
              express or implied, regarding site availability, accuracy, or fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Limitation of Liability</h2>
            <p className="mt-3">
              To the fullest extent permitted by law, {name} is not liable for any direct, indirect,
              incidental, or consequential damages arising from your use of this website.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Changes to Terms</h2>
            <p className="mt-3">
              We may update these Terms of Use at any time by posting revised terms on this page. Continued
              use of the website after updates means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Contact</h2>
            <p className="mt-3">
              For questions regarding these terms, contact us at
              <a className="ml-1 text-laser-cyan transition-colors hover:text-foreground" href={`mailto:${email}`}>
                {email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
