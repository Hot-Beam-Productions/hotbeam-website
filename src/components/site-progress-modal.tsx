"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { GlowButton } from "@/components/glow-button";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !hasDismissedInSession();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function dismiss() {
    rememberDismissal();
    setOpen(false);
  }

  function handleContactClick() {
    dismiss();
    router.push("/contact#contact-form");
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      rememberDismissal();
      setOpen(false);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      className="z-50 w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border bg-surface p-0 text-foreground shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dismiss();
        }
      }}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,99,255,0.18),transparent_55%)]" />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          aria-label="Dismiss site progress notice"
          className="absolute right-4 top-4 z-10 rounded-sm p-2 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/60"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="relative p-6 sm:p-8">
          <p className="mono-label !text-laser-cyan">Quick Note</p>
          <h2 id={titleId} className="mt-4 pr-10 font-heading text-3xl tracking-tight text-foreground sm:text-4xl">
            This website is still in progress.
          </h2>
          <p id={descriptionId} className="mt-4 text-sm leading-relaxed text-muted-light sm:text-base">
            We&apos;re still polishing parts of the site. If you have any questions in the meantime,
            please use our contact form and we&apos;ll get back to you within three business days.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <GlowButton type="button" onClick={handleContactClick} className="w-full sm:w-auto">
              Go to Contact Form
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </GlowButton>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center justify-center rounded-sm border border-border px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-muted-light transition-colors hover:border-border-bright hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
