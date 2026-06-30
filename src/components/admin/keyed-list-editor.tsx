"use client";

import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

export interface KeyedField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

interface KeyedListEditorProps {
  label: string;
  fields: KeyedField[];
  value: Record<string, string>[];
  onChange: (value: Record<string, string>[]) => void;
  addLabel?: string;
}

/**
 * Edits an array of small objects made up of plain text fields
 * (e.g. {label, value} stats, {title, description} principles, {title, body} cards).
 */
export function KeyedListEditor({
  label,
  fields,
  value,
  onChange,
  addLabel = "Add item",
}: KeyedListEditorProps) {
  function emptyItem(): Record<string, string> {
    return Object.fromEntries(fields.map((f) => [f.key, ""]));
  }

  function add() {
    onChange([...value, emptyItem()]);
  }

  function update(index: number, key: string, text: string) {
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: text } : item)));
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
      {value.map((item, i) => (
        <div key={i} className="rounded-md border border-border bg-surface-light/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-1 text-muted hover:text-red-400"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs text-muted">{f.label}</label>
                {f.multiline ? (
                  <textarea
                    value={item[f.key] ?? ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={2}
                    className={inputClass}
                  />
                ) : (
                  <input
                    type="text"
                    value={item[f.key] ?? ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-laser-cyan"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
