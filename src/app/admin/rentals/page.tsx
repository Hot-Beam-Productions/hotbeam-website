"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormStatus } from "@/components/admin/form-status";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/components/admin/toast";
import { getRentalsAdmin, deleteRental } from "./actions";
import { isPublishedMediaUrl } from "@/lib/media-url";
import type { RentalItem } from "@/lib/types";

type ImageStatus = "ok" | "missing" | "needs_review";

function getImageStatus(item: RentalItem): ImageStatus {
  const imageUrl = item.imageUrl?.trim() ?? "";
  if (!imageUrl) return "missing";
  if (imageUrl.includes("pub-XXXX") || imageUrl.includes("picsum.photos")) return "needs_review";
  return isPublishedMediaUrl(imageUrl) ? "ok" : "needs_review";
}

function imageStatusClasses(status: ImageStatus): string {
  if (status === "ok") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "missing") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-200";
}

function imageStatusLabel(status: ImageStatus): string {
  if (status === "ok") return "OK";
  if (status === "missing") return "Missing";
  return "Needs Review";
}

export default function RentalsListPage() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RentalItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [imageStatusFilter, setImageStatusFilter] = useState<"all" | ImageStatus>("all");
  const { addToast } = useToast();

  const refreshRentals = useCallback(async () => {
    const data = await getRentalsAdmin();
    setItems(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRentals() {
      try {
        const data = await getRentalsAdmin();
        if (!active) return;
        setItems(data);
      } catch {
        if (!active) return;
        setError("Failed to load rentals");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRentals();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = term ? item.name.toLowerCase().includes(term) : true;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const status = getImageStatus(item);
      const matchesImageStatus = imageStatusFilter === "all" || status === imageStatusFilter;
      return matchesSearch && matchesCategory && matchesImageStatus;
    });
  }, [items, searchQuery, categoryFilter, imageStatusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteRental(deleteTarget.id);
    setDeleteTarget(null);
    if (result.success) {
      addToast("success", `"${deleteTarget.name}" deleted`);
      void refreshRentals();
    } else {
      setError(result.error || "Delete failed");
    }
  }

  if (loading) return <LoadingSpinner message="Loading rentals..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">Rental Items</h1>
          <p className="mt-1 text-sm text-muted">
            {filteredItems.length} of {items.length} items
          </p>
        </div>
        <Link
          href="/admin/rentals/new"
          className="flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Link>
      </div>

      {error && <FormStatus type="error" message={error} />}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_200px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by rental name..."
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-laser-cyan focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={imageStatusFilter}
          onChange={(event) => setImageStatusFilter(event.target.value as "all" | ImageStatus)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-laser-cyan focus:outline-none"
        >
          <option value="all">All image statuses</option>
          <option value="ok">OK</option>
          <option value="missing">Missing</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No rental items yet"
          description="Create your first rental item to build your inventory."
          actionLabel="Add Item"
          actionHref="/admin/rentals/new"
        />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface/50 p-8 text-center text-sm text-muted">
          No rental items match the current search/filter.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredItems.map((item) => {
              const status = getImageStatus(item);
              const hasImage = isPublishedMediaUrl(item.imageUrl);
              return (
                <div key={item.id} className="rounded-lg border border-border bg-surface/60 p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-border bg-surface-light p-1">
                      {hasImage ? (
                        <CmsImage src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">--</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted">{item.brand}</p>
                      <p className="text-xs text-muted capitalize">{item.category}</p>
                      <p className={`mt-1 inline-flex border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${imageStatusClasses(status)}`}>
                        {imageStatusLabel(status)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Link href={`/admin/rentals/${item.id}`} className="rounded p-1.5 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setDeleteTarget(item)} className="rounded p-1.5 text-muted-light transition-colors hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getImageStatus(item);
                  const hasImage = isPublishedMediaUrl(item.imageUrl);
                  return (
                    <tr key={item.id} className="border-b border-border transition-colors hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-surface-light p-1">
                            {hasImage ? (
                              <CmsImage src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">--</div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{item.name}</span>
                            <p className="text-xs text-muted">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-light capitalize">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex border px-2 py-1 text-[10px] uppercase tracking-wide ${imageStatusClasses(status)}`}>
                          {imageStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/rentals/${item.id}`} className="rounded p-1.5 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setDeleteTarget(item)} className="rounded p-1.5 text-muted-light transition-colors hover:bg-red-500/10 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Rental Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
