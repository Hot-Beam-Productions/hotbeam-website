import type { Metadata } from "next";
import { getPublicBrandData } from "@/lib/public-site-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Hot Beam Productions collects, uses, and protects personal information submitted through this website.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const {
    brand: { name, email, location },
  } = await getPublicBrandData();

  const effectiveDate = "March 9, 2026";

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mono-label !text-laser-cyan">Legal</p>
        <h1 className="mt-3 font-heading text-5xl tracking-tight text-foreground md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted">Effective date: {effectiveDate}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted md:text-base">
          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Information We Collect</h2>
            <p className="mt-3">
              {name} collects information you provide directly, such as your name, email address, phone
              number, event details, and any other details you submit through our contact form.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">How We Use Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Respond to inquiries and provide project estimates.</li>
              <li>Plan, coordinate, and deliver requested production services.</li>
              <li>Improve our website, service offerings, and client communication.</li>
              <li>Comply with legal obligations and safety requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Information Sharing</h2>
            <p className="mt-3">
              We do not sell your personal information. We may share information with trusted service
              providers who support website hosting, communication tools, and business operations, and only
              as needed to provide our services.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Technologies & Third-Party Services</h2>
            <p className="mt-3">
              This website uses the following third-party technologies, which may process limited
              technical information as described below.
            </p>
            <ul className="mt-4 list-disc space-y-4 pl-6">
              <li>
                <strong className="text-foreground">Cloudflare Turnstile</strong> — Used on our contact
                form to distinguish human visitors from automated bots. Turnstile may process your IP
                address, browser characteristics, and interaction patterns to complete this verification.
                No personal information you submit in the form is shared with Cloudflare. See{" "}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-laser-cyan transition-colors hover:text-foreground"
                >
                  Cloudflare&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Vercel Speed Insights</strong> — Used to collect
                anonymized website performance metrics such as page load times and Core Web Vitals. This
                data helps us improve site experience. Vercel may process your IP address and user-agent
                string, though data is aggregated and not used to identify individual visitors. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-laser-cyan transition-colors hover:text-foreground"
                >
                  Vercel&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Google Fonts</strong> — We use typefaces loaded from
                Google&apos;s servers. When your browser requests these font files, Google may receive
                your IP address as part of the standard HTTP request. See{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-laser-cyan transition-colors hover:text-foreground"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Firebase / Firestore</strong> — We use Google
                Firebase to store and retrieve website content and contact form submissions on secure,
                cloud-hosted servers. Firebase is subject to Google&apos;s data processing terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Data Retention & Security</h2>
            <p className="mt-3">
              Contact form submissions are retained for 24 months after last communication, after which
              they are deleted unless a longer retention period is required by law. Website performance
              data collected by third-party services is subject to those providers&apos; own retention
              policies. We use commercially reasonable safeguards to protect information, but no internet
              transmission or storage method is guaranteed to be fully secure.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Children&apos;s Privacy</h2>
            <p className="mt-3">
              This website is intended for business and professional use and is not directed at children
              under the age of 13. We do not knowingly collect personal information from children. If you
              believe a child has submitted information through this site, please contact us at
              <a className="ml-1 text-laser-cyan transition-colors hover:text-foreground" href={`mailto:${email}`}>
                {email}
              </a>
              {" "}and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Your Choices</h2>
            <p className="mt-3">
              You may request to update or delete your personal information by contacting us at
              <a className="ml-1 text-laser-cyan transition-colors hover:text-foreground" href={`mailto:${email}`}>
                {email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Contact</h2>
            <p className="mt-3">
              If you have questions about this policy, contact {name} at {email} in {location}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
