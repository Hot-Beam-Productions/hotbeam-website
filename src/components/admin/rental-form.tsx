"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { ArrayEditor } from "./array-editor";
import { FormStatus } from "./form-status";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { RentalItem, ServiceCategory } from "@/lib/types";

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "lighting", label: "Intelligent Lighting" },
  { value: "video", label: "Visual Display" },
  { value: "lasers", label: "Laser Systems" },
  { value: "atmospherics", label: "Atmospherics" },
  { value: "audio-dj", label: "Audio & DJ" },
  { value: "rigging", label: "Rigging" },
  { value: "staging", label: "Staging" },
  { value: "power", label: "Power Distribution" },
  { value: "sfx", label: "SFX" },
];

interface RentalFormProps {
  initial?: RentalItem;
  onSubmit: (data: RentalItem) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function RentalForm({ initial, onSubmit, submitLabel }: RentalFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();
  const initialSnapshotValue = JSON.stringify({
    id: initial?.id ?? "",
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    category: initial?.category ?? "lighting",
    brand: initial?.brand ?? "",
    description: initial?.description ?? "",
    specs: initial?.specs ?? [],
    frequentlyRentedTogether: initial?.frequentlyRentedTogether ?? [],
    imageUrl: initial?.imageUrl ?? "",
    order: initial?.order ?? 0,
  });
  const [initialSnapshot, setInitialSnapshot] = useState(initialSnapshotValue);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? "lighting");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [specs, setSpecs] = useState<string[]>(initial?.specs ?? []);
  const [frequentlyRentedTogether, setFrequentlyRentedTogether] = useState<string[]>(initial?.frequentlyRentedTogether ?? []);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [autoSlug, setAutoSlug] = useState(!initial);

  function handleNameChange(val: string) {
    setName(val);
    if (autoSlug) setSlug(slugify(val));
  }

  const currentData = useMemo<RentalItem>(
    () => ({
      id: initial?.id ?? slugify(name),
      slug,
      name,
      category,
      brand,
      description,
      specs,
      frequentlyRentedTogether,
      imageUrl,
      order,
    }),
    [
      brand,
      category,
      description,
      frequentlyRentedTogether,
      imageUrl,
      initial?.id,
      name,
      order,
      slug,
      specs,
    ]
  );

  const isDirty = useMemo(
    () => JSON.stringify(currentData) !== initialSnapshot,
    [currentData, initialSnapshot]
  );

  useUnsavedWarning(isDirty);

  useKeyboardShortcut(
    "s",
    (event) => {
      event.preventDefault();
      formRef.current?.requestSubmit();
    },
    { meta: true, disabled: saving }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await onSubmit(currentData);
      if (result.success) {
        const serializedCurrentData = JSON.stringify(currentData);
        setInitialSnapshot(serializedCurrentData);
        addToast("success", "Saved successfully");
        setTimeout(() => router.push("/admin/rentals"), 1000);
      } else {
        setError(result.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
  const labelClass = "block text-sm font-medium text-muted-light mb-1.5";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && <FormStatus type="error" message={error} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)} className={inputClass}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className={inputClass} />
      </div>

      <ArrayEditor label="Specs" value={specs} onChange={setSpecs} placeholder="Spec line..." />
      <ArrayEditor
        label="Frequently Rented Together (rental IDs)"
        value={frequentlyRentedTogether}
        onChange={setFrequentlyRentedTogether}
        placeholder="Related rental ID..."
      />

      <ImageUploader value={imageUrl} onChange={setImageUrl} folder="rentals" label="Image" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-light">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} min={0} className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground focus:border-laser-cyan focus:outline-none" />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <button type="button" onClick={() => router.push("/admin/rentals")} className="rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="relative rounded-md bg-laser-cyan px-6 py-2 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:opacity-50">
          {isDirty && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-laser-cyan ring-2 ring-background"
            />
          )}
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
