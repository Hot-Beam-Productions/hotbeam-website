"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStatus } from "./form-status";
import { ArrayEditor } from "./array-editor";
import { KeyedListEditor } from "./keyed-list-editor";
import { TeamMemberEditor } from "./team-member-editor";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { ActionResult } from "@/lib/action-result";
import type { AboutData, TeamMember } from "@/lib/types";

interface AboutFormProps {
  initial: AboutData;
  onSubmit: (data: AboutData) => Promise<ActionResult>;
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/40 p-5";
const sectionTitleClass = "font-heading text-lg text-foreground";

function toMemberState(m: TeamMember): TeamMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    bio: m.bio ?? "",
    imageUrl: m.imageUrl,
    email: m.email ?? "",
  };
}

export function AboutForm({ initial, onSubmit }: AboutFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [headingLabel, setHeadingLabel] = useState(initial.heading.label);
  const [headingTitle, setHeadingTitle] = useState(initial.heading.title);
  const [headingSubtitle, setHeadingSubtitle] = useState(initial.heading.subtitle);
  const [storyTitle, setStoryTitle] = useState(initial.storyTitle);
  const [story, setStory] = useState<string[]>(initial.story);
  const [stats, setStats] = useState<Record<string, string>[]>(
    initial.stats.map((s) => ({ label: s.label, value: s.value }))
  );
  const [values, setValues] = useState<Record<string, string>[]>(
    initial.values.map((v) => ({ title: v.title, description: v.description }))
  );
  const [partners, setPartners] = useState<TeamMember[]>(initial.partners.map(toMemberState));
  const [crew, setCrew] = useState<TeamMember[]>(initial.crew.map(toMemberState));
  const [ctaTitle, setCtaTitle] = useState(initial.closingCta.title);
  const [ctaDescription, setCtaDescription] = useState(initial.closingCta.description);
  const [ctaButtonLabel, setCtaButtonLabel] = useState(initial.closingCta.button.label);
  const [ctaButtonHref, setCtaButtonHref] = useState(initial.closingCta.button.href);

  const currentData = useMemo<AboutData>(
    () => ({
      heading: { label: headingLabel, title: headingTitle, subtitle: headingSubtitle },
      storyTitle,
      story,
      stats: stats.map((s) => ({ label: s.label ?? "", value: s.value ?? "" })),
      values: values.map((v) => ({ title: v.title ?? "", description: v.description ?? "" })),
      partners,
      crew,
      closingCta: {
        title: ctaTitle,
        description: ctaDescription,
        button: { label: ctaButtonLabel, href: ctaButtonHref },
      },
    }),
    [
      headingLabel,
      headingTitle,
      headingSubtitle,
      storyTitle,
      story,
      stats,
      values,
      partners,
      crew,
      ctaTitle,
      ctaDescription,
      ctaButtonLabel,
      ctaButtonHref,
    ]
  );

  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      heading: { label: initial.heading.label, title: initial.heading.title, subtitle: initial.heading.subtitle },
      storyTitle: initial.storyTitle,
      story: initial.story,
      stats: initial.stats.map((s) => ({ label: s.label, value: s.value })),
      values: initial.values.map((v) => ({ title: v.title, description: v.description })),
      partners: initial.partners.map(toMemberState),
      crew: initial.crew.map(toMemberState),
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
        addToast("success", "About page saved");
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
        <h2 className={sectionTitleClass}>Story</h2>
        <div>
          <label className={labelClass}>Story Title</label>
          <input className={inputClass} value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} required />
        </div>
        <ArrayEditor label="Paragraphs" value={story} onChange={setStory} placeholder="Story paragraph..." />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Stats</h2>
        <KeyedListEditor
          label="Track-record stats"
          addLabel="Add stat"
          fields={[
            { key: "value", label: "Value", placeholder: "300+" },
            { key: "label", label: "Label", placeholder: "Shows Delivered" },
          ]}
          value={stats}
          onChange={setStats}
        />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Operating Principles</h2>
        <KeyedListEditor
          label="Principles"
          addLabel="Add principle"
          fields={[
            { key: "title", label: "Title", placeholder: "Technical Rigor" },
            { key: "description", label: "Description", placeholder: "We prep thoroughly...", multiline: true },
          ]}
          value={values}
          onChange={setValues}
        />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Founders</h2>
        <TeamMemberEditor label="Founders" value={partners} onChange={setPartners} imageFolder="team" addLabel="Add founder" />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Crew</h2>
        <TeamMemberEditor label="Crew / specialists" value={crew} onChange={setCrew} imageFolder="team" addLabel="Add crew member" />
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Closing Call-to-Action</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={ctaDescription} onChange={(e) => setCtaDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Button Label</label>
            <input className={inputClass} value={ctaButtonLabel} onChange={(e) => setCtaButtonLabel(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Button Link</label>
            <input className={inputClass} value={ctaButtonHref} onChange={(e) => setCtaButtonHref(e.target.value)} required placeholder="/contact" />
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
          {saving ? "Saving..." : "Save About Page"}
        </button>
      </div>
    </form>
  );
}
