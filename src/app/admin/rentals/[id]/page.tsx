"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RentalForm } from "@/components/admin/rental-form";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { getRentalAdmin, updateRental } from "../actions";
import type { RentalItem } from "@/lib/types";

export default function EditRentalPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<RentalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getRentalAdmin(id);
      if (!data) setNotFound(true);
      else setItem(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading item..." />;
  if (notFound) return <div className="mx-auto max-w-3xl"><FormStatus type="error" message={`Item "${id}" not found`} /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Rental Items", href: "/admin/rentals" },
          { label: item?.name ?? "Edit Rental" },
        ]}
      />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Edit Rental</h1>
        <p className="mt-1 text-sm text-muted">{item?.name}</p>
      </div>
      <RentalForm initial={item!} onSubmit={(data) => updateRental(id, data)} submitLabel="Save Changes" />
    </div>
  );
}
