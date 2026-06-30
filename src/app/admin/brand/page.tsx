"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { BrandForm } from "@/components/admin/brand-form";
import { getBrandAdmin, saveBrand } from "./actions";
import type { BrandData } from "@/lib/types";

export default function BrandEditorPage() {
  const [data, setData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBrandAdmin()
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

  if (loading) return <LoadingSpinner message="Loading brand settings..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Brand & Info" }]} />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Brand &amp; Info</h1>
        <p className="mt-1 text-sm text-muted">Company name, contact details, logo, and value proposition.</p>
      </div>
      {error && <FormStatus type="error" message={error} />}
      {data && <BrandForm initial={data} onSubmit={saveBrand} />}
    </div>
  );
}
