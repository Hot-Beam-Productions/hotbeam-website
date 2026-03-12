import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import {
  canLoadLiveFirestoreMetrics,
  FirestoreMetricsApiError,
  FirestoreMetricsConfigError,
  getFirestoreMetricsSnapshot,
  getFirestoreMetrics,
} from "@/lib/firestore-metrics";

export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  try {
    await verifyAdminToken(authHeader.slice(7));
  } catch {
    return unauthorizedResponse();
  }

  try {
    if (!canLoadLiveFirestoreMetrics()) {
      const snapshot = getFirestoreMetricsSnapshot();
      if (snapshot) {
        return NextResponse.json(snapshot, { headers: NO_STORE_HEADERS });
      }
    }

    const metrics = await getFirestoreMetrics();
    return NextResponse.json(metrics, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const snapshot = getFirestoreMetricsSnapshot();
    if (snapshot) {
      return NextResponse.json(snapshot, { headers: NO_STORE_HEADERS });
    }

    if (error instanceof FirestoreMetricsConfigError) {
      return NextResponse.json(
        { error: error.message, code: "not_configured" },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    if (error instanceof FirestoreMetricsApiError) {
      console.error("Firestore metrics request failed", error);
      return NextResponse.json(
        { error: "Firestore metrics could not be loaded from Google Cloud Monitoring.", code: "upstream_error" },
        { status: 502, headers: NO_STORE_HEADERS }
      );
    }

    console.error("Unexpected Firestore metrics error", error);
    return NextResponse.json(
      { error: "Unexpected error while loading Firestore metrics.", code: "unknown_error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
