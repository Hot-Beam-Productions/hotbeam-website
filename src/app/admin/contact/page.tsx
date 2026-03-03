"use client";

import { PageEditor } from "@/components/admin/page-editor";
import { ArrayEditor } from "@/components/admin/array-editor";
import { getContactAdmin, updateContact } from "./actions";
import type { ContactData } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { updateAtPath } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/50 p-5";

export default function ContactEditorPage() {
  return (
    <PageEditor<ContactData>
      title="Contact Page"
      description="Edit form options, info cards, and success message"
      loadData={getContactAdmin}
      saveData={updateContact}
      renderForm={(data, setData) => {
        function update(path: string, value: unknown) {
          setData(updateAtPath(data, path, value));
        }

        return (
          <div className="space-y-6">
            {/* Heading */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Page Heading</h2>
              <div>
                <label className={labelClass}>Label</label>
                <input className={inputClass} value={data.heading.label} onChange={(e) => update("heading.label", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.heading.title} onChange={(e) => update("heading.title", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input className={inputClass} value={data.heading.subtitle} onChange={(e) => update("heading.subtitle", e.target.value)} />
              </div>
            </div>

            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Intake Sequence</h2>
              <ArrayEditor
                label="What Happens Next Steps"
                value={data.nextSteps}
                onChange={(val) => update("nextSteps", val)}
                placeholder="Step text..."
              />
              <div>
                <label className={labelClass}>Urgent Callout Title</label>
                <input
                  className={inputClass}
                  value={data.urgentCallout.title}
                  onChange={(e) => update("urgentCallout.title", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Urgent Callout Description</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={data.urgentCallout.description}
                  onChange={(e) => update("urgentCallout.description", e.target.value)}
                />
              </div>
            </div>

            {/* Info Cards */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-foreground">Info Cards</h2>
                <button
                  type="button"
                  onClick={() => update("cards", [...data.cards, { title: "", body: "" }])}
                  className="flex items-center gap-1 text-sm text-muted hover:text-laser-cyan"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </button>
              </div>
              {data.cards.map((card, i) => (
                <div key={i} className="relative rounded-md border border-border p-4">
                  <button
                    type="button"
                    onClick={() => update("cards", data.cards.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 text-muted hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      className={inputClass}
                      value={card.title}
                      onChange={(e) => {
                        const next = [...data.cards];
                        next[i] = { ...next[i], title: e.target.value };
                        update("cards", next);
                      }}
                    />
                  </div>
                  <div className="mt-3">
                    <label className={labelClass}>Body</label>
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={card.body}
                      onChange={(e) => {
                        const next = [...data.cards];
                        next[i] = { ...next[i], body: e.target.value };
                        update("cards", next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Event Types */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Event Types</h2>
              <ArrayEditor
                label=""
                value={data.eventTypes}
                onChange={(val) => update("eventTypes", val)}
                placeholder="Event type..."
              />
            </div>

            {/* Service Needs */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Production Needs</h2>
              <ArrayEditor
                label=""
                value={data.serviceNeeds}
                onChange={(val) => update("serviceNeeds", val)}
                placeholder="Service option..."
              />
            </div>

            {/* Success Message */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Success Message</h2>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.success.title} onChange={(e) => update("success.title", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Message</label>
                <textarea className={inputClass} rows={2} value={data.success.message} onChange={(e) => update("success.message", e.target.value)} />
              </div>
            </div>

            {/* Submit Label & Compliance */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Other Settings</h2>
              <div>
                <label className={labelClass}>Submit Button Label</label>
                <input className={inputClass} value={data.submitLabel} onChange={(e) => update("submitLabel", e.target.value)} />
              </div>
              <ArrayEditor
                label="Compliance Badges"
                value={data.complianceBadges}
                onChange={(val) => update("complianceBadges", val)}
                placeholder="Badge text..."
              />
            </div>
          </div>
        );
      }}
    />
  );
}
