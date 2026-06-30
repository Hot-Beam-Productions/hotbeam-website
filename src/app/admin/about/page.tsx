"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { AboutForm } from "@/components/admin/about-form";
import { getAboutAdmin, saveAbout } from "./actions";
import type { AboutData } from "@/lib/types";

export default function AboutEditorPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAboutAdmin()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner message="Loading about page..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "About / Team" }]} />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">About / Team</h1>
        <p className="mt-1 text-sm text-muted">Story, stats, operating principles, and the founders + crew (with photos and emails).</p>
      </div>
      {error && <FormStatus type="error" message={error} />}
      {data && <AboutForm initial={data} onSubmit={saveAbout} />}
    </div>
  );
}
