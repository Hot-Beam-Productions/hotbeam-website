"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { HomeForm } from "@/components/admin/home-form";
import { getHomeAdmin, saveHome } from "./actions";
import type { HomeData } from "@/lib/types";

export default function HomeEditorPage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHomeAdmin()
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

  if (loading) return <LoadingSpinner message="Loading home page..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Home Page" }]} />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Home Page</h1>
        <p className="mt-1 text-sm text-muted">Hero, proof signals, stats, services, booking flow, and the closing CTA.</p>
      </div>
      {error && <FormStatus type="error" message={error} />}
      {data && <HomeForm initial={data} onSubmit={saveHome} />}
    </div>
  );
}
