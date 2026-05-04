"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "hbp-site-progress-dismissed";

function hasDismissedInSession() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Fail silently if sessionStorage is unavailable.
  }
}

export function SiteProgressModal() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !hasDismissedInSession();
  });

  function dismiss() {
    rememberDismissal();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Website progress notice"
      className="sticky top-[4.5rem] z-40 mt-[4.5rem] border-b border-laser-cyan/25 bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 text-sm text-muted-light md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-semibold text-foreground">This website is still being polished.</span>{" "}
          For current availability, send your event details and we will reply within one business day.
        </p>
        <div className="flex flex-shrink-0 items-center gap-4">
          <Link
            href="/contact#contact-form"
            className="mono-label !text-laser-cyan transition-colors hover:!text-foreground"
            onClick={dismiss}
          >
            Contact us
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss website progress notice"
            className="text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/60"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
