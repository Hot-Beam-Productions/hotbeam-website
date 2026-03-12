import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import type {
  FirestoreMetricTotals,
  FirestoreMetricsResponse,
} from "../src/lib/firestore-metrics-types";

const MONITORING_BASE_URL = "https://monitoring.googleapis.com/v3";
const DATABASE_RESOURCE_TYPE = "firestore.googleapis.com/Database";
const METRIC_ALIGNMENT_SECONDS = 60;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const WEEK_WINDOW_MS = 7 * DAY_WINDOW_MS;
const MAX_PAGE_SIZE = 10_000;

const METRIC_TYPES = {
  reads: "firestore.googleapis.com/document/read_ops_count",
  writes: "firestore.googleapis.com/document/write_ops_count",
  deletes: "firestore.googleapis.com/document/delete_ops_count",
} as const;

type MetricKey = keyof typeof METRIC_TYPES;

interface MonitoringListResponse {
  nextPageToken?: string;
  timeSeries?: Array<{
    points?: MonitoringPoint[];
  }>;
}

interface MonitoringPoint {
  interval?: {
    endTime?: string;
  };
  value?: {
    int64Value?: string;
    doubleValue?: number;
  };
}

function getAccessToken(): string {
  const accessToken = process.env.GCP_MONITORING_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("Missing GCP_MONITORING_ACCESS_TOKEN");
  }

  return accessToken;
}

function getProjectId(): string {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (!projectId) {
    throw new Error("Missing FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  return projectId;
}

function getDatabaseId(): string {
  return process.env.FIRESTORE_DATABASE_ID?.trim() || "(default)";
}

function buildMetricFilter(metricType: string, databaseId: string): string {
  return [
    `metric.type = "${metricType}"`,
    `resource.type = "${DATABASE_RESOURCE_TYPE}"`,
    `resource.labels.database_id = "${databaseId}"`,
  ].join(" AND ");
}

function getPointValue(point: MonitoringPoint): number {
  const intValue = point.value?.int64Value;
  if (typeof intValue === "string") {
    const parsed = Number(intValue);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const doubleValue = point.value?.doubleValue;
  if (typeof doubleValue === "number" && Number.isFinite(doubleValue)) {
    return doubleValue;
  }

  return 0;
}

async function listMetricPoints(
  projectId: string,
  databaseId: string,
  metricType: string,
  accessToken: string,
  intervalStart: string,
  intervalEnd: string
): Promise<MonitoringPoint[]> {
  const allPoints: MonitoringPoint[] = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      filter: buildMetricFilter(metricType, databaseId),
      "interval.startTime": intervalStart,
      "interval.endTime": intervalEnd,
      "aggregation.alignmentPeriod": `${METRIC_ALIGNMENT_SECONDS}s`,
      "aggregation.perSeriesAligner": "ALIGN_SUM",
      "aggregation.crossSeriesReducer": "REDUCE_SUM",
      view: "FULL",
      pageSize: String(MAX_PAGE_SIZE),
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(
      `${MONITORING_BASE_URL}/projects/${encodeURIComponent(projectId)}/timeSeries?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Cloud Monitoring request failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await response.json()) as MonitoringListResponse;
    for (const series of payload.timeSeries ?? []) {
      allPoints.push(...(series.points ?? []));
    }

    pageToken = payload.nextPageToken ?? "";
  } while (pageToken);

  return allPoints;
}

function summarizeMetric(points: MonitoringPoint[], dayStartMs: number): FirestoreMetricTotals {
  let dayTotal = 0;
  let weekTotal = 0;

  for (const point of points) {
    const value = getPointValue(point);
    weekTotal += value;

    const endTime = point.interval?.endTime ? Date.parse(point.interval.endTime) : Number.NaN;
    if (Number.isFinite(endTime) && endTime > dayStartMs) {
      dayTotal += value;
    }
  }

  return {
    dayTotal: Math.round(dayTotal),
    weekTotal: Math.round(weekTotal),
  };
}

async function main() {
  const accessToken = getAccessToken();
  const projectId = getProjectId();
  const databaseId = getDatabaseId();
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - WEEK_WINDOW_MS);
  const dayStartMs = windowEnd.getTime() - DAY_WINDOW_MS;

  const metrics = await Promise.all(
    (Object.entries(METRIC_TYPES) as Array<[MetricKey, string]>).map(async ([key, metricType]) => {
      const points = await listMetricPoints(
        projectId,
        databaseId,
        metricType,
        accessToken,
        windowStart.toISOString(),
        windowEnd.toISOString()
      );

      return [key, summarizeMetric(points, dayStartMs)] as const;
    })
  );

  const summary = Object.fromEntries(metrics) as Record<MetricKey, FirestoreMetricTotals>;

  const payload: FirestoreMetricsResponse = {
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    reads: summary.reads,
    writes: summary.writes,
    deletes: summary.deletes,
  };

  const outputPath = path.join(process.cwd(), "src/data/firestore-metrics.json");
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log("Updated src/data/firestore-metrics.json from Google Cloud Monitoring.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
