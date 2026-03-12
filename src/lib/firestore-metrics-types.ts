export interface FirestoreMetricTotals {
  dayTotal: number;
  weekTotal: number;
}

export interface FirestoreMetricsResponse {
  windowStart: string;
  windowEnd: string;
  lastUpdatedAt: string;
  reads: FirestoreMetricTotals;
  writes: FirestoreMetricTotals;
  deletes: FirestoreMetricTotals;
}
