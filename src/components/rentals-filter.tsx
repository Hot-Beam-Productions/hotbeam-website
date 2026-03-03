"use client";

import { type ComponentType, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Boxes,
  Cable,
  CheckCircle2,
  CircleAlert,
  Headphones,
  Layers,
  Lightbulb,
  Monitor,
  Search,
  Sparkles,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/glow-button";
import { CmsImage } from "@/components/cms-image";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { isPublishedMediaUrl } from "@/lib/media-url";
import type { RentalItem } from "@/lib/types";

const iconByCategory: Record<string, ComponentType<{ className?: string }>> = {
  all: Wrench,
  lighting: Lightbulb,
  video: Monitor,
  lasers: Zap,
  atmospherics: Wind,
  "audio-dj": Headphones,
  rigging: Boxes,
  staging: Layers,
  power: Cable,
  sfx: Sparkles,
};

interface RentalsFilterProps {
  items: RentalItem[];
  categories: Array<{ value: string; label: string }>;
  footerNote: string;
}

export function RentalsFilter({ items, categories, footerNote }: RentalsFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const prefersReduced = useReducedMotion();
  const categoryLabelMap = useMemo(
    () => new Map(categories.map((category) => [category.value, category.label])),
    [categories]
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const needle = searchQuery.trim().toLowerCase();
      const matchesSearch =
        needle.length === 0 ||
        item.name.toLowerCase().includes(needle) ||
        item.brand.toLowerCase().includes(needle) ||
        item.specs.some((spec) => spec.toLowerCase().includes(needle));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, items, searchQuery]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Inventory categories">
          {categories.map((category) => {
            const CategoryIcon = iconByCategory[category.value] ?? Wrench;
            const selected = activeCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                aria-pressed={selected}
                className={`flex items-center gap-2 border px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan ${
                  selected
                    ? "border-laser-cyan/50 bg-laser-cyan/12 text-laser-cyan"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by name, brand, or spec"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/50"
            aria-label="Search inventory"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: prefersReduced ? 0 : index * 0.04 }}
              className="h-full"
            >
              <Link
                href={`/rentals/${item.slug}`}
                className="group block h-full overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-laser-cyan/40"
              >
                <div className="relative h-52 w-full overflow-hidden border-b border-border bg-surface-light p-3">
                  {isPublishedMediaUrl(item.imageUrl) ? (
                    <CmsImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain p-2 transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <MediaPlaceholder label="Inventory image" aspect="video" className="!aspect-auto h-full" />
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="mono-label !text-muted-light">
                      {item.brand} · {categoryLabelMap.get(item.category) ?? item.category}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                        item.available
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-300/30 bg-amber-500/10 text-amber-200"
                      }`}
                    >
                      {item.available ? <CheckCircle2 className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
                      {item.available ? "Available" : "Check Dates"}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl leading-tight tracking-tight text-foreground transition-colors group-hover:text-laser-cyan">
                    {item.name}
                  </h3>

                  <div className="border-t border-border pt-3">
                    <span className="mono-label !text-laser-cyan">View details &rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="border border-border bg-surface py-14 text-center">
          <p className="text-muted">No items match your current filters.</p>
        </div>
      )}

      <div className="mt-16 border border-border bg-surface px-8 py-10 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-light">{footerNote}</p>
        <div className="mt-6">
          <GlowButton href="/contact" variant="primary">
            Get Inventory Sheet
          </GlowButton>
        </div>
      </div>
    </>
  );
}
