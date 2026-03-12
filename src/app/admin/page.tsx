"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Package } from "lucide-react";
import { getProjectsAdmin } from "@/app/admin/portfolio/actions";
import { getRentalsAdmin } from "@/app/admin/rentals/actions";

const quickLinks = [
  { href: "/admin/portfolio", label: "Portfolio", description: "Manage productions", icon: Film, countKey: "projects" as const },
  { href: "/admin/rentals", label: "Rental Items", description: "Equipment catalog", icon: Package, countKey: "rentals" as const },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<{ projects: number | null; rentals: number | null }>({
    projects: null,
    rentals: null,
  });

  useEffect(() => {
    let active = true;

    async function loadCounts() {
      try {
        const [projects, rentals] = await Promise.all([getProjectsAdmin(), getRentalsAdmin()]);

        if (!active) return;
        setCounts({
          projects: projects.length,
          rentals: rentals.length,
        });
      } catch {
        if (!active) return;
        setCounts({ projects: 0, rentals: 0 });
      }
    }

    void loadCounts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your site content
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface/70 p-5">
          <p className="font-heading text-2xl text-laser-cyan">
            {counts.projects ?? "—"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">Portfolio Projects</p>
        </div>
        <div className="rounded-lg border border-border bg-surface/70 p-5">
          <p className="font-heading text-2xl text-laser-cyan">
            {counts.rentals ?? "—"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted">Rental Items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const count = link.countKey ? counts[link.countKey] : null;
          const countSuffix = count === null ? "" : ` · ${count} items`;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-laser-cyan/40"
            >
              <link.icon className="mb-3 h-5 w-5 text-muted transition-colors group-hover:text-laser-cyan" />
              <h2 className="font-heading text-lg tracking-wide text-foreground">
                {link.label}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {link.description}
                {countSuffix}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
