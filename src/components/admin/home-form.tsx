"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStatus } from "./form-status";
import { ArrayEditor } from "./array-editor";
import { KeyedListEditor } from "./keyed-list-editor";
import { ServiceItemsEditor } from "./service-items-editor";
import { ImageUploader } from "./image-uploader";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { ActionResult } from "@/lib/action-result";
import type { HomeData, HomeService, ServiceCategory } from "@/lib/types";

interface HomeFormProps {
  initial: HomeData;
  onSubmit: (data: HomeData) => Promise<ActionResult>;
}

const CATEGORIES: ServiceCategory[] = [
  "lighting",
  "video",
  "lasers",
  "sfx",
  "atmospherics",
  "audio-dj",
  "rigging",
  "staging",
  "power",
];

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/40 p-5";
const sectionTitleClass = "font-heading text-lg text-foreground";

export function HomeForm({ initial, onSubmit }: HomeFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Hero
  const [eyebrow, setEyebrow] = useState(initial.hero.eyebrow);
  const [headline, setHeadline] = useState(initial.hero.headline);
  const [subheadline, setSubheadline] = useState(initial.hero.subheadline);
  const [departmentLine, setDepartmentLine] = useState(initial.hero.departmentLine);
  const [description, setDescription] = useState(initial.hero.description);
  const [videoUrl, setVideoUrl] = useState(initial.hero.videoUrl ?? "");
  const [videoPoster, setVideoPoster] = useState(initial.hero.videoPoster ?? "");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(initial.hero.primaryCta.label);
  const [primaryCtaHref, setPrimaryCtaHref] = useState(initial.hero.primaryCta.href);
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(initial.hero.secondaryCta.label);
  const [secondaryCtaHref, setSecondaryCtaHref] = useState(initial.hero.secondaryCta.href);

  // Signals + stats
  const [quickDecisionSignals, setQuickDecisionSignals] = useState<string[]>(initial.quickDecisionSignals);
  const [trustSignals, setTrustSignals] = useState<string[]>(initial.trustSignals);
  const [results, setResults] = useState<Record<string, string>[]>(
    initial.results.map((r) => ({ value: r.value, label: r.label }))
  );

  // Services
  const [servicesLabel, setServicesLabel] = useState(initial.services.label);
  const [servicesTitle, setServicesTitle] = useState(initial.services.title);
  const [servicesSubtitle, setServicesSubtitle] = useState(initial.services.subtitle);
  const [featuredServiceId, setFeaturedServiceId] = useState<ServiceCategory>(initial.services.featuredServiceId);
  const [serviceItems, setServiceItems] = useState<HomeService[]>(initial.services.items);

  // Booking flow
  const [bookingLabel, setBookingLabel] = useState(initial.bookingFlow.label);
  const [bookingTitle, setBookingTitle] = useState(initial.bookingFlow.title);
  const [bookingDescription, setBookingDescription] = useState(initial.bookingFlow.description);
  const [bookingSteps, setBookingSteps] = useState<Record<string, string>[]>(
    initial.bookingFlow.steps.map((s) => ({ title: s.title, description: s.description }))
  );
  const [bookingAssurance, setBookingAssurance] = useState(initial.bookingFlow.assurance);
  const [bookingCtaLabel, setBookingCtaLabel] = useState(initial.bookingFlow.cta.label);
  const [bookingCtaHref, setBookingCtaHref] = useState(initial.bookingFlow.cta.href);

  // Closing CTA
  const [closingTitle, setClosingTitle] = useState(initial.closingCta.title);
  const [closingDescription, setClosingDescription] = useState(initial.closingCta.description);
  const [closingButtonLabel, setClosingButtonLabel] = useState(initial.closingCta.button.label);
  const [closingButtonHref, setClosingButtonHref] = useState(initial.closingCta.button.href);

  const currentData = useMemo<HomeData>(
    () => ({
      hero: {
        eyebrow,
        headline,
        subheadline,
        departmentLine,
        description,
        videoUrl,
        videoPoster,
        primaryCta: { label: primaryCtaLabel, href: primaryCtaHref },
        secondaryCta: { label: secondaryCtaLabel, href: secondaryCtaHref },
      },
      quickDecisionSignals,
      trustSignals,
      bookingFlow: {
        label: bookingLabel,
        title: bookingTitle,
        description: bookingDescription,
        steps: bookingSteps.map((s) => ({ title: s.title ?? "", description: s.description ?? "" })),
        assurance: bookingAssurance,
        cta: { label: bookingCtaLabel, href: bookingCtaHref },
      },
      services: {
        label: servicesLabel,
        title: servicesTitle,
        subtitle: servicesSubtitle,
        featuredServiceId,
        items: serviceItems,
      },
      results: results.map((r) => ({ label: r.label ?? "", value: r.value ?? "" })),
      closingCta: {
        title: closingTitle,
        description: closingDescription,
        button: { label: closingButtonLabel, href: closingButtonHref },
      },
    }),
    [
      eyebrow,
      headline,
      subheadline,
      departmentLine,
      description,
      videoUrl,
      videoPoster,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      quickDecisionSignals,
      trustSignals,
      bookingLabel,
      bookingTitle,
      bookingDescription,
      bookingSteps,
      bookingAssurance,
      bookingCtaLabel,
      bookingCtaHref,
      servicesLabel,
      servicesTitle,
      servicesSubtitle,
      featuredServiceId,
      serviceItems,
      results,
      closingTitle,
      closingDescription,
      closingButtonLabel,
      closingButtonHref,
    ]
  );

  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      hero: {
        eyebrow: initial.hero.eyebrow,
        headline: initial.hero.headline,
        subheadline: initial.hero.subheadline,
        departmentLine: initial.hero.departmentLine,
        description: initial.hero.description,
        videoUrl: initial.hero.videoUrl ?? "",
        videoPoster: initial.hero.videoPoster ?? "",
        primaryCta: { label: initial.hero.primaryCta.label, href: initial.hero.primaryCta.href },
        secondaryCta: { label: initial.hero.secondaryCta.label, href: initial.hero.secondaryCta.href },
      },
      quickDecisionSignals: initial.quickDecisionSignals,
      trustSignals: initial.trustSignals,
      bookingFlow: {
        label: initial.bookingFlow.label,
        title: initial.bookingFlow.title,
        description: initial.bookingFlow.description,
        steps: initial.bookingFlow.steps.map((s) => ({ title: s.title, description: s.description })),
        assurance: initial.bookingFlow.assurance,
        cta: { label: initial.bookingFlow.cta.label, href: initial.bookingFlow.cta.href },
      },
      services: {
        label: initial.services.label,
        title: initial.services.title,
        subtitle: initial.services.subtitle,
        featuredServiceId: initial.services.featuredServiceId,
        items: initial.services.items,
      },
      results: initial.results.map((r) => ({ label: r.label, value: r.value })),
      closingCta: {
        title: initial.closingCta.title,
        description: initial.closingCta.description,
        button: { label: initial.closingCta.button.label, href: initial.closingCta.button.href },
      },
    })
  );
  const isDirty = JSON.stringify(currentData) !== baseline;
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
        setBaseline(JSON.stringify(currentData));
        addToast("success", "Home page saved");
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Hero</h2>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input className={inputClass} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Headline</label>
          <input className={inputClass} value={headline} onChange={(e) => setHeadline(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Subheadline</label>
          <textarea className={inputClass} rows={2} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Department Line</label>
          <input className={inputClass} value={departmentLine} onChange={(e) => setDepartmentLine(e.target.value)} placeholder="Lighting · Lasers · LED Video · Special Effects" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Hero Video URL (.mp4 or .webm)</label>
          <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="/hero-showreel.mp4" />
        </div>
        <ImageUploader value={videoPoster} onChange={setVideoPoster} folder="home" label="Video Poster Image" aspect="video" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Primary Button Label</label>
            <input className={inputClass} value={primaryCtaLabel} onChange={(e) => setPrimaryCtaLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Primary Button Link</label>
            <input className={inputClass} value={primaryCtaHref} onChange={(e) => setPrimaryCtaHref(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Label</label>
            <input className={inputClass} value={secondaryCtaLabel} onChange={(e) => setSecondaryCtaLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Secondary Button Link</label>
            <input className={inputClass} value={secondaryCtaHref} onChange={(e) => setSecondaryCtaHref(e.target.value)} required />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Proof & Signals</h2>
        <ArrayEditor label="Quick Decision Signals" value={quickDecisionSignals} onChange={setQuickDecisionSignals} placeholder="Typical first response within one business day" />
        <ArrayEditor label="Trust Signals" value={trustSignals} onChange={setTrustSignals} placeholder="Trusted by venues, promoters..." />
        <KeyedListEditor
          label="Stats"
          addLabel="Add stat"
          fields={[
            { key: "value", label: "Value", placeholder: "300+" },
            { key: "label", label: "Label", placeholder: "Shows Delivered" },
          ]}
          value={results}
          onChange={setResults}
        />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Services</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Section Label</label>
            <input className={inputClass} value={servicesLabel} onChange={(e) => setServicesLabel(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Featured Service</label>
            <select className={inputClass} value={featuredServiceId} onChange={(e) => setFeaturedServiceId(e.target.value as ServiceCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Section Title</label>
          <input className={inputClass} value={servicesTitle} onChange={(e) => setServicesTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Section Subtitle</label>
          <input className={inputClass} value={servicesSubtitle} onChange={(e) => setServicesSubtitle(e.target.value)} />
        </div>
        <ServiceItemsEditor value={serviceItems} onChange={setServiceItems} />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Booking Flow</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Label</label>
            <input className={inputClass} value={bookingLabel} onChange={(e) => setBookingLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={bookingTitle} onChange={(e) => setBookingTitle(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={bookingDescription} onChange={(e) => setBookingDescription(e.target.value)} required />
        </div>
        <KeyedListEditor
          label="Steps"
          addLabel="Add step"
          fields={[
            { key: "title", label: "Title", placeholder: "Share the Show Basics" },
            { key: "description", label: "Description", placeholder: "Tell us your date...", multiline: true },
          ]}
          value={bookingSteps}
          onChange={setBookingSteps}
        />
        <div>
          <label className={labelClass}>Assurance Line</label>
          <textarea className={inputClass} rows={2} value={bookingAssurance} onChange={(e) => setBookingAssurance(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>CTA Label</label>
            <input className={inputClass} value={bookingCtaLabel} onChange={(e) => setBookingCtaLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>CTA Link</label>
            <input className={inputClass} value={bookingCtaHref} onChange={(e) => setBookingCtaHref(e.target.value)} required />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Closing Call-to-Action</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={closingTitle} onChange={(e) => setClosingTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={closingDescription} onChange={(e) => setClosingDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Button Label</label>
            <input className={inputClass} value={closingButtonLabel} onChange={(e) => setClosingButtonLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Button Link</label>
            <input className={inputClass} value={closingButtonHref} onChange={(e) => setClosingButtonHref(e.target.value)} required />
          </div>
        </div>
      </div>

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
          {saving ? "Saving..." : "Save Home Page"}
        </button>
      </div>
    </form>
  );
}
