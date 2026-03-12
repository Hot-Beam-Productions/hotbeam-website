import "server-only";

import fallbackMetricsData from "@/data/firestore-metrics.json";
import type {
  FirestoreMetricTotals,
  FirestoreMetricsResponse,
} from "@/lib/firestore-metrics-types";

const MONITORING_SCOPE = "https://www.googleapis.com/auth/monitoring.read";
const DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token";
const MONITORING_BASE_URL = "https://monitoring.googleapis.com/v3";
const DATABASE_RESOURCE_TYPE = "firestore.googleapis.com/Database";
const METRIC_ALIGNMENT_SECONDS = 60;
const TOKEN_EXPIRY_SKEW_MS = 60_000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const WEEK_WINDOW_MS = 7 * DAY_WINDOW_MS;
const MAX_PAGE_SIZE = 10_000;

const METRIC_TYPES = {
  reads: "firestore.googleapis.com/document/read_ops_count",
  writes: "firestore.googleapis.com/document/write_ops_count",
  deletes: "firestore.googleapis.com/document/delete_ops_count",
} as const;

type MetricKey = keyof typeof METRIC_TYPES;

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
  token_uri?: string;
}

interface AuthorizedUserCredentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  token_uri?: string;
}

type GoogleAuthCredentials = ServiceAccountCredentials | AuthorizedUserCredentials;

interface OAuthTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface MonitoringListResponse {
  nextPageToken?: string;
  timeSeries?: MonitoringTimeSeries[];
}

interface MonitoringTimeSeries {
  points?: MonitoringPoint[];
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

export class FirestoreMetricsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirestoreMetricsConfigError";
  }
}

export class FirestoreMetricsApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "FirestoreMetricsApiError";
  }
}

let cachedAccessToken:
  | {
      token: string;
      expiresAt: number;
    }
  | null = null;

let privateKeyPromise: Promise<CryptoKey> | null = null;

function hasGoogleAuthCredentials(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim());
}

function encodeBase64Url(input: string | Uint8Array): string {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buffer.toString("base64url");
}

function decodePemPrivateKey(pem: string): ArrayBuffer {
  const normalized = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  if (!normalized) {
    throw new FirestoreMetricsConfigError("GOOGLE_SERVICE_ACCOUNT_JSON is missing a valid private key.");
  }

  const decoded = Buffer.from(normalized, "base64");
  return decoded.buffer.slice(decoded.byteOffset, decoded.byteOffset + decoded.byteLength);
}

function getGoogleAuthCredentials(): GoogleAuthCredentials {
  const rawValue = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!rawValue) {
    throw new FirestoreMetricsConfigError(
      "Firestore metrics are not configured. Add GOOGLE_SERVICE_ACCOUNT_JSON to enable them."
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new FirestoreMetricsConfigError("GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON.");
  }

  const candidate = parsed as Record<string, unknown> | null;

  if (!candidate || typeof candidate !== "object") {
    throw new FirestoreMetricsConfigError("GOOGLE_SERVICE_ACCOUNT_JSON must be a JSON object.");
  }

  if (typeof candidate.client_email === "string" && typeof candidate.private_key === "string") {
    return {
      client_email: candidate.client_email,
      private_key: candidate.private_key,
      project_id: typeof candidate.project_id === "string" ? candidate.project_id : undefined,
      token_uri: typeof candidate.token_uri === "string" ? candidate.token_uri : undefined,
    };
  }

  if (
    typeof candidate.client_id === "string" &&
    typeof candidate.client_secret === "string" &&
    typeof candidate.refresh_token === "string"
  ) {
    return {
      client_id: candidate.client_id,
      client_secret: candidate.client_secret,
      refresh_token: candidate.refresh_token,
      token_uri: typeof candidate.token_uri === "string" ? candidate.token_uri : undefined,
    };
  }

  throw new FirestoreMetricsConfigError(
    "GOOGLE_SERVICE_ACCOUNT_JSON must include either client_email/private_key or client_id/client_secret/refresh_token."
  );
}

function isServiceAccountCredentials(
  credentials: GoogleAuthCredentials
): credentials is ServiceAccountCredentials {
  return "client_email" in credentials && "private_key" in credentials;
}

function getProjectId(credentials: GoogleAuthCredentials): string {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    (isServiceAccountCredentials(credentials) ? credentials.project_id?.trim() : undefined);

  if (!projectId) {
    throw new FirestoreMetricsConfigError(
      "Firestore metrics need a Firebase project ID. Set FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID."
    );
  }

  return projectId;
}

function getDatabaseId(): string {
  return process.env.FIRESTORE_DATABASE_ID?.trim() || "(default)";
}

async function getSigningKey(serviceAccount: ServiceAccountCredentials): Promise<CryptoKey> {
  if (privateKeyPromise) {
    return privateKeyPromise;
  }

  privateKeyPromise = crypto.subtle
    .importKey(
      "pkcs8",
      decodePemPrivateKey(serviceAccount.private_key),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    )
    .catch((error) => {
      privateKeyPromise = null;
      throw error;
    });

  return privateKeyPromise;
}

async function createServiceAccountAssertion(
  serviceAccount: ServiceAccountCredentials
): Promise<string> {
  const tokenUri = serviceAccount.token_uri || DEFAULT_TOKEN_URI;
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;

  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: tokenUri,
      scope: MONITORING_SCOPE,
      iat: issuedAt,
      exp: expiresAt,
    })
  );

  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    await getSigningKey(serviceAccount),
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function getMonitoringAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - TOKEN_EXPIRY_SKEW_MS) {
    return cachedAccessToken.token;
  }

  const credentials = getGoogleAuthCredentials();
  const tokenUri = credentials.token_uri || DEFAULT_TOKEN_URI;

  const response = await fetch(
    tokenUri,
    isServiceAccountCredentials(credentials)
      ? {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: await createServiceAccountAssertion(credentials),
          }),
          cache: "no-store",
        }
      : {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: credentials.client_id,
            client_secret: credentials.client_secret,
            refresh_token: credentials.refresh_token,
          }),
          cache: "no-store",
        }
  );

  const payload = (await response.json()) as OAuthTokenResponse;

  if (!response.ok || !payload.access_token || typeof payload.expires_in !== "number") {
    const reason =
      payload.error_description || payload.error || "Google OAuth did not return an access token.";
    throw new FirestoreMetricsApiError(`Failed to authorize Google Monitoring: ${reason}`, response.status);
  }

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return payload.access_token;
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
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new FirestoreMetricsApiError(
        `Cloud Monitoring request failed with status ${response.status}: ${body.slice(0, 300)}`,
        response.status
      );
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

export async function getFirestoreMetrics(): Promise<FirestoreMetricsResponse> {
  const credentials = getGoogleAuthCredentials();
  const projectId = getProjectId(credentials);
  const databaseId = getDatabaseId();
  const accessToken = await getMonitoringAccessToken();

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

  return {
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    reads: summary.reads,
    writes: summary.writes,
    deletes: summary.deletes,
  };
}

export function getFirestoreMetricsSnapshot(): FirestoreMetricsResponse | null {
  const snapshot = fallbackMetricsData as FirestoreMetricsResponse;
  return snapshot.lastUpdatedAt ? snapshot : null;
}

export function canLoadLiveFirestoreMetrics(): boolean {
  return hasGoogleAuthCredentials();
}
