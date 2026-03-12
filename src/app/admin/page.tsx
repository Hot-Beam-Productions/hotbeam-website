"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Film,
  FolderCog,
  Package,
  PanelsTopLeft,
} from "lucide-react";
import { getProjectsAdmin } from "@/app/admin/portfolio/actions";
import { getRentalsAdmin } from "@/app/admin/rentals/actions";
import { AdminHubIconGlyph } from "@/components/admin/admin-hub-icons";
import { useAuth } from "@/components/admin/auth-provider";
import { EmptyState } from "@/components/admin/empty-state";
import { FormStatus } from "@/components/admin/form-status";
import { getAdminHubSettings } from "@/lib/admin-hub";
import type { FirestoreMetricsResponse } from "@/lib/firestore-metrics-types";
import type { AdminHubLink } from "@/lib/types";

const siteManagementLinks = [
  {
    href: "/admin/portfolio",
    label: "Portfolio",
    description: "Manage productions",
    icon: Film,
    countKey: "projects" as const,
  },
  {
    href: "/admin/rentals",
    label: "Rental Items",
    description: "Equipment catalog",
    icon: Package,
    countKey: "rentals" as const,
  },
];

type FirestoreMetricsState =
  | { status: "loading" }
  | { status: "ready"; data: FirestoreMetricsResponse }
  | { status: "not-configured"; message: string }
  | { status: "error"; message: string };

interface FirestoreMetricsErrorPayload {
  error?: string;
  code?: string;
}

function isFirestoreMetricsResponse(value: unknown): value is FirestoreMetricsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FirestoreMetricsResponse>;
  return (
    typeof candidate.windowStart === "string" &&
    typeof candidate.windowEnd === "string" &&
    typeof candidate.lastUpdatedAt === "string" &&
    typeof candidate.reads?.dayTotal === "number" &&
    typeof candidate.reads?.weekTotal === "number" &&
    typeof candidate.writes?.dayTotal === "number" &&
    typeof candidate.writes?.weekTotal === "number" &&
    typeof candidate.deletes?.dayTotal === "number" &&
    typeof candidate.deletes?.weekTotal === "number"
  );
}

function isFirestoreMetricsErrorPayload(value: unknown): value is FirestoreMetricsErrorPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as FirestoreMetricsErrorPayload;
  return (
    candidate.error === undefined || typeof candidate.error === "string"
  ) && (candidate.code === undefined || typeof candidate.code === "string");
}

function formatMetricValue(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatMetricsTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminDashboard() {
  const { idToken } = useAuth();
  const [counts, setCounts] = useState<{ projects: number | null; rentals: number | null }>({
    projects: null,
    rentals: null,
  });
  const [hubLinks, setHubLinks] = useState<AdminHubLink[]>([]);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [metricsState, setMetricsState] = useState<FirestoreMetricsState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const [projectsResult, rentalsResult, hubResult] = await Promise.allSettled([
        getProjectsAdmin(),
        getRentalsAdmin(),
        getAdminHubSettings(),
      ]);

      if (!active) return;

      if (projectsResult.status === "fulfilled" && rentalsResult.status === "fulfilled") {
        setCounts({
          projects: projectsResult.value.length,
          rentals: rentalsResult.value.length,
        });
        setCountsError(null);
      } else {
        setCounts({ projects: 0, rentals: 0 });
        setCountsError("Site management counts could not be loaded.");
      }

      if (hubResult.status === "fulfilled") {
        setHubLinks(hubResult.value.links);
        setResourceError(null);
      } else {
        setHubLinks([]);
        setResourceError("Employee resources could not be loaded.");
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      if (!idToken) {
        setMetricsState({ status: "loading" });
        return;
      }

      setMetricsState({ status: "loading" });

      try {
        const response = await fetch("/api/admin/firestore-metrics", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          cache: "no-store",
        });

        const payload = await response.json().catch(() => null);

        if (!active) return;

        if (response.ok && isFirestoreMetricsResponse(payload)) {
          setMetricsState({ status: "ready", data: payload });
          return;
        }

        if (response.status === 503 && isFirestoreMetricsErrorPayload(payload) && payload.code === "not_configured") {
          setMetricsState({
            status: "not-configured",
            message:
              payload.error ||
              "Firestore metrics are not configured. Add GOOGLE_SERVICE_ACCOUNT_JSON to enable them.",
          });
          return;
        }

        setMetricsState({
          status: "error",
          message:
            (isFirestoreMetricsErrorPayload(payload) ? payload.error : undefined) ||
            "Firestore metrics could not be loaded.",
        });
      } catch {
        if (!active) return;

        setMetricsState({
          status: "error",
          message: "Firestore metrics could not be loaded.",
        });
      }
    }

    void loadMetrics();

    return () => {
      active = false;
    };
  }, [idToken]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-surface/80">
        <div className="bg-[radial-gradient(circle_at_top_left,_oklch(63%_0.23_262_/_0.12),_transparent_38%),linear-gradient(135deg,_oklch(14%_0.014_260),_oklch(10%_0.012_260))] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mono-label">Operations Hub</p>
              <h1 className="mt-3 font-heading text-3xl tracking-wide text-foreground md:text-4xl">
                Employee Dashboard
              </h1>
              <p className="mt-3 text-sm text-muted-light md:text-base">
                Open the tools your team uses every day, then jump into site updates without
                digging through the admin.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/resources"
                className="inline-flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
              >
                <FolderCog className="h-4 w-4" />
                Manage Links
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-xl">
            <div className="rounded-2xl border border-border/80 bg-background/35 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Pinned Tools</p>
              <p className="mt-2 font-heading text-3xl text-foreground">{hubLinks.length}</p>
              <p className="mt-1 text-sm text-muted-light">Employee launch cards available</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/35 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Site Areas</p>
              <p className="mt-2 font-heading text-3xl text-foreground">2</p>
              <p className="mt-1 text-sm text-muted-light">Fixed admin sections stay one click away</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-border bg-surface/70 p-6 md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono-label">Employee Resources</p>
            <h2 className="mt-2 font-heading text-2xl tracking-wide text-foreground">
              Quick access to core tools
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pinned launch links for the apps your team uses most often.
            </p>
          </div>
          <Link
            href="/admin/resources"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
          >
            <PanelsTopLeft className="h-4 w-4" />
            Edit Resource Links
          </Link>
        </div>

        {resourceError && <FormStatus type="error" message={resourceError} />}

        {hubLinks.length === 0 ? (
          <EmptyState
            icon={PanelsTopLeft}
            title="No employee resources yet"
            description="Add links for the tools your team needs every day."
            actionLabel="Manage Links"
            actionHref="/admin/resources"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {hubLinks.map((link) => (
              <ResourceCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-border bg-surface/70 p-6 md:p-7">
        <div>
          <p className="mono-label">Site Management</p>
          <h2 className="mt-2 font-heading text-2xl tracking-wide text-foreground">
            Content and inventory controls
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Core CMS sections stay fixed here so portfolio and rental management are always easy to find.
          </p>
        </div>

        {countsError && <FormStatus type="error" message={countsError} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {siteManagementLinks.map((link) => {
            const count = link.countKey ? counts[link.countKey] : null;
            const countLabel = count === null ? "Loading..." : `${count} items`;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-border bg-background/35 p-5 transition-colors hover:border-laser-cyan/40 hover:bg-background/55"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <link.icon className="h-5 w-5 text-muted transition-colors group-hover:text-laser-cyan" />
                    <h3 className="mt-4 font-heading text-xl tracking-wide text-foreground">
                      {link.label}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{link.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-laser-cyan" />
                </div>

                <div className="mt-6 rounded-xl border border-border/80 bg-surface/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Current Count</p>
                  <p className="mt-2 font-heading text-2xl text-foreground">{count ?? "—"}</p>
                  <p className="mt-1 text-sm text-muted-light">{countLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-border bg-surface/70 p-6 md:p-7">
        <div>
          <p className="mono-label">Firestore Usage</p>
          <h2 className="mt-2 font-heading text-2xl tracking-wide text-foreground">
            Billing-aware database activity
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Read, write, and delete operation counts from Google Cloud Monitoring over the last
            day and week.
          </p>
        </div>

        {metricsState.status === "not-configured" ? (
          <FormStatus type="error" message={metricsState.message} />
        ) : null}
        {metricsState.status === "error" ? (
          <FormStatus type="error" message={metricsState.message} />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FirestoreMetricCard
            label="Reads"
            metricState={metricsState}
            metric={metricsState.status === "ready" ? metricsState.data.reads : null}
          />
          <FirestoreMetricCard
            label="Writes"
            metricState={metricsState}
            metric={metricsState.status === "ready" ? metricsState.data.writes : null}
          />
          <FirestoreMetricCard
            label="Deletes"
            metricState={metricsState}
            metric={metricsState.status === "ready" ? metricsState.data.deletes : null}
          />
        </div>
      </section>
    </div>
  );
}

function FirestoreMetricCard({
  label,
  metricState,
  metric,
}: {
  label: string;
  metricState: FirestoreMetricsState;
  metric: FirestoreMetricsResponse["reads"] | null;
}) {
  let footer = "Loading Firestore metrics...";

  if (metricState.status === "ready") {
    footer = `Updated ${formatMetricsTimestamp(metricState.data.lastUpdatedAt)}`;
  } else if (metricState.status === "not-configured") {
    footer = "Add GOOGLE_SERVICE_ACCOUNT_JSON to enable this card.";
  } else if (metricState.status === "error") {
    footer = "Firestore metrics are temporarily unavailable.";
  }

  return (
    <div className="rounded-2xl border border-border bg-background/35 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-surface/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Last 24h</p>
          <p className="mt-2 font-heading text-2xl text-foreground">
            {metric ? formatMetricValue(metric.dayTotal) : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Last 7d</p>
          <p className="mt-2 font-heading text-2xl text-foreground">
            {metric ? formatMetricValue(metric.weekTotal) : "—"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-light">{footer}</p>
    </div>
  );
}

function ResourceCard({ link }: { link: AdminHubLink }) {
  const sharedClassName =
    "group rounded-2xl border border-border bg-background/35 p-5 transition-colors hover:border-laser-cyan/40 hover:bg-background/55";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
          <AdminHubIconGlyph icon={link.icon} className="h-5 w-5 text-laser-cyan" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-laser-cyan" />
      </div>

      <div className="mt-6">
        <p className="font-heading text-xl tracking-wide text-foreground">{link.label}</p>
        <p className="mt-2 text-sm text-muted">{link.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4 text-sm text-muted-light">
        <span>{link.external ? "Opens in a new tab" : "Opens inside admin"}</span>
        <span className="text-foreground">Open</span>
      </div>
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={sharedClassName}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={sharedClassName}>
      {content}
    </Link>
  );
}
