"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface HashFocusTargetProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export function HashFocusTarget({ id, className, children }: HashFocusTargetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncHashTarget() {
      if (window.location.hash !== `#${id}`) return;

      window.requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ block: "start" });
        containerRef.current?.focus({ preventScroll: true });
      });
    }

    syncHashTarget();
    window.addEventListener("hashchange", syncHashTarget);
    return () => window.removeEventListener("hashchange", syncHashTarget);
  }, [id]);

  return (
    <div
      id={id}
      ref={containerRef}
      tabIndex={-1}
      className={cn("scroll-mt-28 outline-none md:scroll-mt-32", className)}
    >
      {children}
    </div>
  );
}
