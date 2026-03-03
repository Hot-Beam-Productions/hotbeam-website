"use client";

import { type ComponentType, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Boxes, Headphones, Layers, Lightbulb, Monitor, Search, Sparkles, Wind, Wrench, Zap, Cable } from "lucide-react";
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
            <motion.article
              key={item.id}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: prefersReduced ? 0 : index * 0.04 }}
              className="group overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-laser-cyan/40"
            >
              <div className="relative h-48 w-full overflow-hidden bg-surface-light">
                {isPublishedMediaUrl(item.imageUrl) ? (
                  <CmsImage
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <MediaPlaceholder label="Inventory image" aspect="video" className="!aspect-auto h-full" />
                )}
              </div>

              <div className="space-y-3 p-5">
                <p className="mono-label !text-muted-light">{item.brand}</p>
                <h3 className="font-heading text-2xl leading-tight tracking-tight text-foreground">
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-light">{item.description}</p>

                {item.specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.specs.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="border border-border bg-surface-light px-2 py-1 text-[11px] uppercase tracking-wide text-muted-light"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <Link
                    href={`/rentals/${item.slug}`}
                    className="mono-label rounded-sm border border-laser-cyan/35 px-3 py-1.5 !text-laser-cyan transition-colors hover:bg-laser-cyan/12"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </motion.article>
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
