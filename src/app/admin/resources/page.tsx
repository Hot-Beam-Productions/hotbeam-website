"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FolderCog,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { FormStatus } from "@/components/admin/form-status";
import {
  AdminHubIconGlyph,
  ADMIN_HUB_ICON_OPTIONS,
} from "@/components/admin/admin-hub-icons";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { useToast } from "@/components/admin/toast";
import {
  ADMIN_HUB_SECTIONS,
  cloneAdminHubSettings,
  createAdminHubLink,
  getAdminHubSettings,
  saveAdminHubSettings,
} from "@/lib/admin-hub";
import type { AdminHubLink } from "@/lib/types";

export default function AdminResourcesPage() {
  const [links, setLinks] = useState<AdminHubLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadLinks() {
      try {
        const settings = await getAdminHubSettings();
        if (!active) return;
        setLinks(settings.links);
      } catch {
        if (!active) return;
        setError("Failed to load resource links.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadLinks();

    return () => {
      active = false;
    };
  }, []);

  function updateLink(index: number, updater: (current: AdminHubLink) => AdminHubLink) {
    setLinks((current) =>
      current.map((link, itemIndex) => (itemIndex === index ? updater(link) : link))
    );
  }

  function moveLink(index: number, direction: -1 | 1) {
    setLinks((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const saved = await saveAdminHubSettings({ links });
      setLinks(saved.links);
      addToast("success", "Resource links saved");
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Failed to save resource links.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setLinks(cloneAdminHubSettings().links);
    setError(null);
  }

  if (loading) return <LoadingSpinner message="Loading resource links..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Resource Links" },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mono-label">Employee Resources</p>
          <h1 className="mt-2 font-heading text-3xl tracking-wide text-foreground">
            Resource Links
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Manage the pinned employee tool cards that appear on the dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset To Defaults
          </button>
          <button
            type="button"
            onClick={() => setLinks((current) => [...current, createAdminHubLink()])}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Links"}
          </button>
        </div>
      </div>

      {error && <FormStatus type="error" message={error} />}

      {links.length === 0 ? (
        <div className="rounded-[1.5rem] border border-border bg-surface/70 p-8 text-center">
          <FolderCog className="mx-auto h-10 w-10 text-muted" />
          <h2 className="mt-4 font-heading text-xl tracking-wide text-foreground">
            No links configured
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Add the first employee resource link to build out the dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => {
            return (
              <section
                key={`${link.id}-${index}`}
                className="rounded-[1.5rem] border border-border bg-surface/70 p-5 md:p-6"
              >
                <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-border/80 bg-background/35 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
                        <AdminHubIconGlyph icon={link.icon} className="h-5 w-5 text-laser-cyan" />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          className="rounded-md border border-border p-2 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Move link up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === links.length - 1}
                          className="rounded-md border border-border p-2 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Move link down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-5 font-heading text-xl tracking-wide text-foreground">
                      {link.label.trim() || "Untitled Link"}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {link.description.trim() || "Add a short description for this resource card."}
                    </p>
                    <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted">
                      {link.external ? "Opens in new tab" : "Opens in admin"}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Label</span>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(event) =>
                          updateLink(index, (current) => ({
                            ...current,
                            label: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none"
                        placeholder="Tool name"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">URL</span>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(event) =>
                          updateLink(index, (current) => ({
                            ...current,
                            href: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none"
                        placeholder="https://example.com"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">Description</span>
                      <textarea
                        value={link.description}
                        onChange={(event) =>
                          updateLink(index, (current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none"
                        placeholder="What should employees expect when they open this?"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Icon</span>
                      <select
                        value={link.icon}
                        onChange={(event) =>
                          updateLink(index, (current) => ({
                            ...current,
                            icon: event.target.value as AdminHubLink["icon"],
                          }))
                        }
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-laser-cyan focus:outline-none"
                      >
                        {ADMIN_HUB_ICON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Section</span>
                      <select
                        value={link.section}
                        onChange={(event) =>
                          updateLink(index, (current) => ({
                            ...current,
                            section: event.target.value as AdminHubLink["section"],
                          }))
                        }
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-laser-cyan focus:outline-none"
                      >
                        {ADMIN_HUB_SECTIONS.map((section) => (
                          <option key={section.value} value={section.value}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
                      <label className="inline-flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={link.external}
                          onChange={(event) =>
                            updateLink(index, (current) => ({
                              ...current,
                              external: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-border bg-background text-laser-cyan focus:ring-laser-cyan"
                        />
                        Open this link in a new tab
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))
                        }
                        className="inline-flex items-center gap-2 rounded-md border border-red-500/30 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Link
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
