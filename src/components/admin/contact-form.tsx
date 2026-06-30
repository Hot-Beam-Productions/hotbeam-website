"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStatus } from "./form-status";
import { ArrayEditor } from "./array-editor";
import { KeyedListEditor } from "./keyed-list-editor";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { ActionResult } from "@/lib/action-result";
import type { ContactData } from "@/lib/types";

interface ContactFormProps {
  initial: ContactData;
  onSubmit: (data: ContactData) => Promise<ActionResult>;
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/40 p-5";
const sectionTitleClass = "font-heading text-lg text-foreground";

export function ContactForm({ initial, onSubmit }: ContactFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [headingLabel, setHeadingLabel] = useState(initial.heading.label);
  const [headingTitle, setHeadingTitle] = useState(initial.heading.title);
  const [headingSubtitle, setHeadingSubtitle] = useState(initial.heading.subtitle);
  const [nextSteps, setNextSteps] = useState<string[]>(initial.nextSteps);
  const [urgentTitle, setUrgentTitle] = useState(initial.urgentCallout.title);
  const [urgentDescription, setUrgentDescription] = useState(initial.urgentCallout.description);
  const [directContactTitle, setDirectContactTitle] = useState(initial.directContactTitle);
  const [cards, setCards] = useState<Record<string, string>[]>(
    initial.cards.map((c) => ({ title: c.title, body: c.body }))
  );
  const [eventTypes, setEventTypes] = useState<string[]>(initial.eventTypes);
  const [serviceNeeds, setServiceNeeds] = useState<string[]>(initial.serviceNeeds);
  const [successTitle, setSuccessTitle] = useState(initial.success.title);
  const [successMessage, setSuccessMessage] = useState(initial.success.message);
  const [submitLabel, setSubmitLabel] = useState(initial.submitLabel);
  const [complianceBadges, setComplianceBadges] = useState<string[]>(initial.complianceBadges);

  const currentData = useMemo<ContactData>(
    () => ({
      heading: { label: headingLabel, title: headingTitle, subtitle: headingSubtitle },
      nextSteps,
      urgentCallout: { title: urgentTitle, description: urgentDescription },
      directContactTitle,
      cards: cards.map((c) => ({ title: c.title ?? "", body: c.body ?? "" })),
      eventTypes,
      serviceNeeds,
      success: { title: successTitle, message: successMessage },
      submitLabel,
      complianceBadges,
    }),
    [
      headingLabel,
      headingTitle,
      headingSubtitle,
      nextSteps,
      urgentTitle,
      urgentDescription,
      directContactTitle,
      cards,
      eventTypes,
      serviceNeeds,
      successTitle,
      successMessage,
      submitLabel,
      complianceBadges,
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
        addToast("success", "Contact page saved");
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
        <h2 className={sectionTitleClass}>Heading</h2>
        <div>
          <label className={labelClass}>Eyebrow Label</label>
          <input className={inputClass} value={headingLabel} onChange={(e) => setHeadingLabel(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={headingTitle} onChange={(e) => setHeadingTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea className={inputClass} rows={2} value={headingSubtitle} onChange={(e) => setHeadingSubtitle(e.target.value)} />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>What Happens Next</h2>
        <ArrayEditor label="Steps" value={nextSteps} onChange={setNextSteps} placeholder="Step description..." />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Urgent Callout</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={urgentTitle} onChange={(e) => setUrgentTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={urgentDescription} onChange={(e) => setUrgentDescription(e.target.value)} required />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Direct Contact</h2>
        <div>
          <label className={labelClass}>Section Title</label>
          <input className={inputClass} value={directContactTitle} onChange={(e) => setDirectContactTitle(e.target.value)} required />
        </div>
        <KeyedListEditor
          label="Info Cards"
          addLabel="Add card"
          fields={[
            { key: "title", label: "Title", placeholder: "Email" },
            { key: "body", label: "Body", placeholder: "info@hotbeamproductions.com", multiline: true },
          ]}
          value={cards}
          onChange={setCards}
        />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Form Options</h2>
        <ArrayEditor label="Event Types" value={eventTypes} onChange={setEventTypes} placeholder="Concert / Tour..." />
        <ArrayEditor label="Service Needs" value={serviceNeeds} onChange={setServiceNeeds} placeholder="Lighting..." />
        <div>
          <label className={labelClass}>Submit Button Label</label>
          <input className={inputClass} value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)} required />
        </div>
        <ArrayEditor label="Compliance Badges" value={complianceBadges} onChange={setComplianceBadges} placeholder="FDA variance-compliant..." />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Success Message</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={successTitle} onChange={(e) => setSuccessTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Message</label>
          <textarea className={inputClass} rows={2} value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} required />
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
          {saving ? "Saving..." : "Save Contact Page"}
        </button>
      </div>
    </form>
  );
}
