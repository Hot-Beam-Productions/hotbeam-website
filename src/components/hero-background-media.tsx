"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroBackgroundMediaProps {
  src: string;
  type: string;
  poster: string;
}

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function HeroBackgroundMedia({ src, type, poster }: HeroBackgroundMediaProps) {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    const loadVideo = () => {
      if (!cancelled) {
        setShouldLoadVideo(true);
      }
    };

    const windowWithIdleCallback = window as WindowWithIdleCallback;
    if (windowWithIdleCallback.requestIdleCallback) {
      const idleId = windowWithIdleCallback.requestIdleCallback(loadVideo, { timeout: 2000 });
      return () => {
        cancelled = true;
        windowWithIdleCallback.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(loadVideo, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
      {shouldLoadVideo ? (
        <video className="h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata" poster={poster}>
          <source src={src} type={type} />
          Your browser does not support the video tag.
        </video>
      ) : null}
    </>
  );
}
