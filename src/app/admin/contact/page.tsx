"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { ContactForm } from "@/components/admin/contact-form";
import { getContactAdmin, saveContact } from "./actions";
import type { ContactData } from "@/lib/types";

export default function ContactEditorPage() {
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getContactAdmin()
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

  if (loading) return <LoadingSpinner message="Loading contact page..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Contact" }]} />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Contact Page</h1>
        <p className="mt-1 text-sm text-muted">Headline, next-step list, info cards, form options, and success message.</p>
      </div>
      {error && <FormStatus type="error" message={error} />}
      {data && <ContactForm initial={data} onSubmit={saveContact} />}
    </div>
  );
}
