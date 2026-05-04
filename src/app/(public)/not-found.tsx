import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowButton } from "@/components/glow-button";

export default function NotFound() {
  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mono-label !text-laser-cyan">Page Not Found</p>
        <h1 className="mt-4 font-heading text-5xl leading-tight tracking-tight text-foreground md:text-7xl">
          This page is not available.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-light">
          The page may have moved, or the project or inventory item may no longer be published.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <GlowButton href="/contact" variant="primary">
            Request a Proposal
            <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
          </GlowButton>
          <GlowButton href="/work" variant="outline">
            View Work
          </GlowButton>
          <Link
            href="/rentals"
            className="mono-label inline-flex items-center !text-muted-light transition-colors hover:!text-laser-cyan"
          >
            Browse inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
