import type { Metadata } from "next";
import Link from "next/link";
import { getPublicNavigationData } from "@/lib/public-site-data";

export const metadata: Metadata = {
  title: "Site Map",
  description: "Browse all major pages on the Hot Beam Productions website.",
  alternates: { canonical: "/site-map" },
};

export default async function SiteMapPage() {
  const { navigation } = await getPublicNavigationData();

  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: "/site-map", label: "Site Map" },
  ];

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mono-label !text-laser-cyan">Website</p>
        <h1 className="mt-3 font-heading text-5xl tracking-tight text-foreground md:text-6xl">Site Map</h1>
        <p className="mt-4 text-sm text-muted">Quick links to key pages and legal information.</p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Primary Pages</h2>
            <ul className="mt-4 space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-laser-cyan">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-border bg-surface p-6">
            <h2 className="font-heading text-2xl tracking-tight text-foreground">Legal Pages</h2>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-laser-cyan">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
