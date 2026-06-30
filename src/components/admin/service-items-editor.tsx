"use client";

import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { ArrayEditor } from "./array-editor";
import type { HomeService, ServiceCategory, ServiceIcon } from "@/lib/types";

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
const ICONS: ServiceIcon[] = ["lightbulb", "monitor", "zap", "sparkles"];

interface ServiceItemsEditorProps {
  value: HomeService[];
  onChange: (value: HomeService[]) => void;
}

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";

export function ServiceItemsEditor({ value, onChange }: ServiceItemsEditorProps) {
  function add() {
    onChange([...value, { id: "lighting", icon: "lightbulb", title: "", description: "", highlights: [] }]);
  }
  function update(index: number, patch: Partial<HomeService>) {
    onChange(value.map((it, i) => (i === index ? { ...it, ...patch } : it)));
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

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-light">Service Cards</label>
      {value.map((item, i) => (
        <div key={i} className="space-y-3 rounded-md border border-border bg-surface-light/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{item.title || `Service #${i + 1}`}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => remove(i)} className="rounded p-1 text-muted hover:text-red-400" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">Title</label>
              <input className={inputClass} value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Lighting" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted">Category</label>
                <select className={inputClass} value={item.id} onChange={(e) => update(i, { id: e.target.value as ServiceCategory })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Icon</label>
                <select className={inputClass} value={item.icon} onChange={(e) => update(i, { icon: e.target.value as ServiceIcon })}>
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Description</label>
            <textarea className={inputClass} rows={2} value={item.description} onChange={(e) => update(i, { description: e.target.value })} />
          </div>
          <ArrayEditor label="Highlights" value={item.highlights} onChange={(h) => update(i, { highlights: h })} placeholder="Highlight line..." />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-laser-cyan">
        <Plus className="h-3.5 w-3.5" />
        Add service
      </button>
    </div>
  );
}
