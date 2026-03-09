"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "hbp-tech-notice-dismissed";

export function TechNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing restrictions)
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // fail silently
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Technology notice"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <p className="text-xs leading-relaxed text-muted">
          This site uses Cloudflare bot protection and Vercel performance monitoring.{" "}
          <Link
            href="/privacy-policy"
            className="text-laser-cyan transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="flex-shrink-0 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/60"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
