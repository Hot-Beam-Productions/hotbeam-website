"use client";

import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import type { TeamMember } from "@/lib/types";

interface TeamMemberEditorProps {
  label: string;
  value: TeamMember[];
  onChange: (value: TeamMember[]) => void;
  imageFolder?: string;
  addLabel?: string;
}

/** Edits a list of team members (founders / crew) with photo upload. */
export function TeamMemberEditor({
  label,
  value,
  onChange,
  imageFolder = "team",
  addLabel = "Add person",
}: TeamMemberEditorProps) {
  function add() {
    onChange([...value, { id: "", name: "", role: "", bio: "", imageUrl: "", email: "" }]);
  }

  function update(index: number, patch: Partial<TeamMember>) {
    onChange(value.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-light">{label}</label>
      {value.map((member, i) => (
        <div key={i} className="space-y-3 rounded-md border border-border bg-surface-light/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{member.name || `Person #${i + 1}`}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="rounded p-1 text-muted hover:text-red-400" aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Name</label>
              <input className={inputClass} value={member.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Daniel Mankin" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Role</label>
              <input className={inputClass} value={member.role} onChange={(e) => update(i, { role: e.target.value })} placeholder="Co-Founder · Technical Director" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Bio</label>
            <textarea className={inputClass} rows={2} value={member.bio ?? ""} onChange={(e) => update(i, { bio: e.target.value })} placeholder="Short bio..." />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Email (optional)</label>
            <input className={inputClass} type="email" value={member.email ?? ""} onChange={(e) => update(i, { email: e.target.value })} placeholder="name@hotbeamproductions.com" />
          </div>
          <ImageUploader value={member.imageUrl} onChange={(url) => update(i, { imageUrl: url })} folder={imageFolder} label="Photo" aspect="portrait" />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-laser-cyan">
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
