import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

type ImageStatus = "ok" | "placeholder" | "missing";

interface RentalItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  specs: string[];
  frequentlyRentedTogether?: string[];
  imageUrl: string;
  available: boolean;
  order?: number;
  updatedAt?: string;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values?: FirestoreValue[] };
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface FirestoreCollectionResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

function loadDotEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function getFirestoreConfig(): { projectId: string; apiKey: string } {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID/FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY/FIREBASE_API_KEY");
  }

  return { projectId, apiKey };
}

function toStringValue(value: FirestoreValue | undefined): string {
  return value?.stringValue ?? "";
}

function toNumberValue(value: FirestoreValue | undefined): number {
  return Number(value?.integerValue ?? value?.doubleValue ?? 0);
}

function decodeRental(doc: FirestoreDocument): RentalItem {
  const fields = doc.fields ?? {};
  const specs = (fields.specs?.arrayValue?.values ?? []).map((entry) => entry.stringValue ?? "").filter(Boolean);
  const frequentlyRentedTogether = (fields.frequentlyRentedTogether?.arrayValue?.values ?? [])
    .map((entry) => entry.stringValue ?? "")
    .filter(Boolean);

  return {
    id: doc.name.split("/").pop() ?? "",
    slug: toStringValue(fields.slug),
    name: toStringValue(fields.name),
    category: toStringValue(fields.category) as RentalItem["category"],
    brand: toStringValue(fields.brand),
    description: toStringValue(fields.description),
    specs,
    frequentlyRentedTogether,
    imageUrl: toStringValue(fields.imageUrl),
    available: Boolean(fields.available?.booleanValue),
    order: toNumberValue(fields.order),
    updatedAt: toStringValue(fields.updatedAt) || undefined,
  };
}

async function fetchFirestoreJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}) for ${url}: ${body.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

async function getCmsRentals(config: { projectId: string; apiKey: string }): Promise<RentalItem[]> {
  const rentals: RentalItem[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      key: config.apiKey,
      pageSize: "100",
      ...(nextPageToken ? { pageToken: nextPageToken } : {}),
    });

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/rentals?${params.toString()}`;
    const data = await fetchFirestoreJson<FirestoreCollectionResponse>(url);

    rentals.push(...(data.documents ?? []).map((doc) => decodeRental(doc)));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return rentals;
}

function sortByOrder<T extends { order?: number; name?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const byOrder = (a.order ?? 0) - (b.order ?? 0);
    if (byOrder !== 0) return byOrder;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

function getImageStatus(url: string | undefined): ImageStatus {
  const normalized = (url ?? "").trim();
  if (!normalized) return "missing";
  if (normalized.includes("pub-XXXX") || normalized.includes("picsum.photos")) return "placeholder";
  return "ok";
}

function toMarkdownStatus(status: ImageStatus): string {
  if (status === "ok") return "OK";
  if (status === "placeholder") return "Placeholder";
  return "Missing";
}

async function main() {
  loadDotEnvLocal();
  const config = getFirestoreConfig();

  const fallbackRaw = JSON.parse(readFileSync(resolve(process.cwd(), "src/data/data.json"), "utf-8")) as {
    rentals?: { items?: RentalItem[] };
  };
  const fallbackItems = sortByOrder(fallbackRaw.rentals?.items ?? []);
  const cmsItems = sortByOrder(await getCmsRentals(config));

  const cmsIds = new Set(cmsItems.map((item) => item.id));
  const mergedMap = new Map<string, RentalItem>();
  for (const item of fallbackItems) mergedMap.set(item.id, item);
  for (const item of cmsItems) mergedMap.set(item.id, item);

  const mergedItems = sortByOrder(Array.from(mergedMap.values()));
  const fallbackOnlyItems = fallbackItems.filter((item) => !cmsIds.has(item.id));

  const summary = {
    fallbackCount: fallbackItems.length,
    cmsCount: cmsItems.length,
    mergedCount: mergedItems.length,
    fallbackOnlyCount: fallbackOnlyItems.length,
    mergedPlaceholderOrMissingCount: mergedItems.filter((item) => getImageStatus(item.imageUrl) !== "ok").length,
    fallbackOnlyPlaceholderOrMissingCount: fallbackOnlyItems.filter((item) => getImageStatus(item.imageUrl) !== "ok").length,
  };

  const statusRows = mergedItems.map((item) => {
    const imageStatus = getImageStatus(item.imageUrl);
    const source = cmsIds.has(item.id) ? "cms-or-override" : "fallback-only";

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      source,
      imageStatus,
      imageUrl: item.imageUrl || "",
    };
  });

  const reportPath = resolve(process.cwd(), "docs/reports/inventory-audit-2026-03-03.md");
  const report = [
    "# Inventory Audit — 2026-03-03",
    "",
    "## Summary",
    `- Fallback items: ${summary.fallbackCount}`,
    `- CMS items: ${summary.cmsCount}`,
    `- Merged inventory items: ${summary.mergedCount}`,
    `- Fallback-only items: ${summary.fallbackOnlyCount}`,
    `- Placeholder/missing images (merged): ${summary.mergedPlaceholderOrMissingCount}`,
    `- Placeholder/missing images (fallback-only): ${summary.fallbackOnlyPlaceholderOrMissingCount}`,
    "",
    "## Item Status",
    "| ID | Name | Category | Source | Image Status | Image URL |",
    "| --- | --- | --- | --- | --- | --- |",
    ...statusRows.map(
      (row) =>
        `| ${row.id} | ${row.name.replace(/\|/g, "\\|")} | ${row.category} | ${row.source} | ${toMarkdownStatus(row.imageStatus)} | ${row.imageUrl || "(empty)"} |`
    ),
    "",
  ].join("\n");

  writeFileSync(reportPath, report, "utf-8");

  console.log("Inventory audit complete:");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Report written: ${reportPath}`);
}

main().catch((error) => {
  console.error("audit-rental-inventory failed:", error);
  process.exit(1);
});
