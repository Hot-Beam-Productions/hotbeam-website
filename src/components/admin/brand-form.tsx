"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { FormStatus } from "./form-status";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { ActionResult } from "@/lib/action-result";
import type { BrandData } from "@/lib/types";

interface BrandFormProps {
  initial: BrandData;
  onSubmit: (data: BrandData) => Promise<ActionResult>;
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";

export function BrandForm({ initial, onSubmit }: BrandFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(initial.name);
  const [shortName, setShortName] = useState(initial.shortName);
  const [url, setUrl] = useState(initial.url);
  const [location, setLocation] = useState(initial.location);
  const [region, setRegion] = useState(initial.region);
  const [phoneDisplay, setPhoneDisplay] = useState(initial.phoneDisplay);
  const [phoneHref, setPhoneHref] = useState(initial.phoneHref);
  const [email, setEmail] = useState(initial.email);
  const [instagramHandle, setInstagramHandle] = useState(initial.instagramHandle);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [heroLogo, setHeroLogo] = useState(initial.heroLogo);
  const [valueProposition, setValueProposition] = useState(initial.valueProposition);

  const currentData = useMemo<BrandData>(
    () => ({
      name,
      shortName,
      url,
      location,
      region,
      phoneDisplay,
      phoneHref,
      email,
      instagramHandle,
      instagramUrl,
      heroLogo,
      valueProposition,
    }),
    [
      name,
      shortName,
      url,
      location,
      region,
      phoneDisplay,
      phoneHref,
      email,
      instagramHandle,
      instagramUrl,
      heroLogo,
      valueProposition,
    ]
  );

  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initial));
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
        setInitialSnapshot(JSON.stringify(currentData));
        addToast("success", "Brand settings saved");
      } else {
        setError(result.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    }
    setSaving(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && <FormStatus type="error" message={error} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Brand Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Hot Beam Productions" />
        </div>
        <div>
          <label className={labelClass}>Short Name</label>
          <input className={inputClass} value={shortName} onChange={(e) => setShortName(e.target.value)} required placeholder="Hot Beam" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Value Proposition</label>
        <textarea className={inputClass} rows={2} value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} required placeholder="Technical production for live events where reliability is non-negotiable." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Website URL</label>
          <input className={inputClass} type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://www.hotbeamproductions.com" />
        </div>
        <div>
          <label className={labelClass}>Contact Email</label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="info@hotbeamproductions.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Denver, Colorado" />
        </div>
        <div>
          <label className={labelClass}>Region</label>
          <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="Front Range + Nationwide" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Phone (display)</label>
          <input className={inputClass} value={phoneDisplay} onChange={(e) => setPhoneDisplay(e.target.value)} required placeholder="(720) 955 8929" />
        </div>
        <div>
          <label className={labelClass}>Phone (dial link)</label>
          <input className={inputClass} value={phoneHref} onChange={(e) => setPhoneHref(e.target.value)} required placeholder="+17209558929" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Instagram Handle</label>
          <input className={inputClass} value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} required placeholder="@hotbeamproductions" />
        </div>
        <div>
          <label className={labelClass}>Instagram URL</label>
          <input className={inputClass} type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} required placeholder="https://www.instagram.com/hotbeamproductions/" />
        </div>
      </div>

      <ImageUploader value={heroLogo} onChange={setHeroLogo} folder="brand" label="Logo" aspect="video" />

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:text-foreground"
        >
          Back to dashboard
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-laser-cyan px-6 py-2 text-sm font-semibold text-background transition-opacity disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Brand"}
        </button>
      </div>
    </form>
  );
}
