"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Minimal "scroll for more" indicator pinned to the bottom of the hero.
 * Matches the laser-beam aesthetic (a fading vertical line) rather than a chevron.
 */
export function ScrollCue() {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex justify-center"
      aria-hidden="true"
    >
      <motion.div
        className="flex flex-col items-center gap-2.5"
        animate={prefersReduced ? undefined : { y: [0, 9, 0], opacity: [0.5, 1, 0.5] }}
        transition={prefersReduced ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
          Scroll
        </span>
        <span className="h-9 w-px bg-gradient-to-b from-laser-cyan/80 to-transparent" />
      </motion.div>
    </div>
  );
}
