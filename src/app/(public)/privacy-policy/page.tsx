import type { Metadata } from "next";
import { getPublicBrandData } from "@/lib/public-site-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Hot Beam Productions collects, uses, and protects personal information shared through this website.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const {
    brand: { name, email, location },
  } = await getPublicBrandData();

  const effectiveDate = "February 27, 2026";

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
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Data Retention & Security</h2>
            <p className="mt-3">
              We retain personal information only as long as reasonably necessary for business and legal
              purposes. We use commercially reasonable safeguards to protect information, but no internet
              transmission or storage method is guaranteed to be fully secure.
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
