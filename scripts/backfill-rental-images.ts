import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type ImageStatus = "ok" | "placeholder" | "missing";

interface RentalItem {
  id: string;
  name: string;
  imageUrl?: string;
  order?: number;
}

interface RentalImageSourceEntry {
  id: string;
  name: string;
  sourcePageUrl: string;
  sourceImageUrl: string;
  notes: string;
  replaceExisting: boolean;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface FirestoreCollectionResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

interface UploadConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

const DATA_PATH = resolve(process.cwd(), "src/data/data.json");
const MANIFEST_PATH = resolve(process.cwd(), "docs/research/rental-image-sources.json");
const CHECKLIST_PATH = resolve(process.cwd(), "docs/reports/rental-image-cms-replacements-2026-03-03.md");

let cachedS3Client: S3Client | null = null;

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

function getUploadConfig(): UploadConfig {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
    throw new Error("Missing required R2 environment variables");
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicDomain };
}

function getS3Client(config: UploadConfig): S3Client {
  if (cachedS3Client) return cachedS3Client;

  cachedS3Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedS3Client;
}

async function fetchFirestoreJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}) for ${url}: ${body.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

function decodeCmsRental(doc: FirestoreDocument): RentalItem {
  const fields = doc.fields ?? {};
  return {
    id: doc.name.split("/").pop() ?? "",
    name: fields.name?.stringValue ?? "",
    imageUrl: fields.imageUrl?.stringValue ?? "",
    order: Number(fields.order?.integerValue ?? fields.order?.doubleValue ?? 0),
  };
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

    rentals.push(...(data.documents ?? []).map((doc) => decodeCmsRental(doc)));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return rentals;
}

function getImageStatus(url: string | undefined): ImageStatus {
  const normalized = (url ?? "").trim();
  if (!normalized) return "missing";
  if (normalized.includes("pub-XXXX") || normalized.includes("picsum.photos")) return "placeholder";
  return "ok";
}

function ensureHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

function parseMode(): "dry-run" | "apply" {
  if (process.argv.includes("--apply")) return "apply";
  return "dry-run";
}

function readManifest(): RentalImageSourceEntry[] {
  const raw = readFileSync(MANIFEST_PATH, "utf-8");
  const parsed = JSON.parse(raw) as RentalImageSourceEntry[];
  const uniqueIds = new Set<string>();

  for (const entry of parsed) {
    if (!entry.id || !entry.sourcePageUrl || !entry.sourceImageUrl) {
      throw new Error(`Invalid manifest entry for id: ${entry.id || "(missing)"}`);
    }

    if (uniqueIds.has(entry.id)) {
      throw new Error(`Duplicate manifest entry for id: ${entry.id}`);
    }

    uniqueIds.add(entry.id);
  }

  return parsed;
}

function readFallbackData(): { rentals: { items: RentalItem[] }; [key: string]: unknown } {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8")) as { rentals: { items: RentalItem[] }; [key: string]: unknown };
}

function sortByOrder<T extends { order?: number; name?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const byOrder = (a.order ?? 0) - (b.order ?? 0);
    if (byOrder !== 0) return byOrder;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

async function downloadSourceImage(url: string): Promise<Buffer> {
  const safeUrl = ensureHttps(url);
  const response = await fetch(safeUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; inventory-image-backfill/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new Error("Empty image payload");
  }

  return buffer;
}

async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}

async function uploadToR2(config: UploadConfig, key: string, body: Buffer): Promise<string> {
  await getS3Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `https://${config.publicDomain}/${key}`;
}

function writeChecklist(cmsItems: RentalItem[], manifest: RentalImageSourceEntry[]): void {
  const cmsById = new Map(cmsItems.map((item) => [item.id, item]));
  const replacements = manifest
    .filter((entry) => entry.replaceExisting)
    .map((entry) => ({
      entry,
      current: cmsById.get(entry.id),
    }))
    .filter((row) => row.current);

  const lines = [
    "# CMS Image Replacement Checklist — 2026-03-03",
    "",
    "These replacements were intentionally **not** applied by CLI (admin action required).",
    "",
  ];

  if (replacements.length === 0) {
    lines.push("No CMS image replacements are currently flagged.");
  } else {
    lines.push("| ID | Name | Current CMS Image | Proposed Image | Reason | Source Page |", "| --- | --- | --- | --- | --- | --- |");

    for (const row of replacements) {
      lines.push(
        `| ${row.entry.id} | ${row.entry.name.replace(/\|/g, "\\|")} | ${row.current?.imageUrl ?? "(empty)"} | ${row.entry.sourceImageUrl} | ${row.entry.notes.replace(/\|/g, "\\|")} | ${row.entry.sourcePageUrl} |`
      );
    }
  }

  lines.push("", "## How to apply", "1. Open `/admin/rentals`.", "2. Edit the listed item(s).", "3. Upload or paste the proposed image URL.", "4. Save and verify on `/rentals`.", "");

  writeFileSync(CHECKLIST_PATH, lines.join("\n"), "utf-8");
}

async function main() {
  loadDotEnvLocal();

  const mode = parseMode();
  const isApply = mode === "apply";

  const firestoreConfig = getFirestoreConfig();
  const uploadConfig = getUploadConfig();
  const fallbackData = readFallbackData();
  const manifest = readManifest();

  const manifestById = new Map(manifest.map((entry) => [entry.id, entry]));
  const fallbackItems = sortByOrder(fallbackData.rentals.items ?? []);
  const cmsItems = sortByOrder(await getCmsRentals(firestoreConfig));
  const cmsIds = new Set(cmsItems.map((item) => item.id));

  const targets = fallbackItems.filter(
    (item) => !cmsIds.has(item.id) && getImageStatus(item.imageUrl) !== "ok"
  );

  const summary = {
    mode,
    fallbackCount: fallbackItems.length,
    cmsCount: cmsItems.length,
    targetCount: targets.length,
    uploaded: 0,
    updatedFallbackItems: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Mode: ${mode}`);
  console.log(`Targeting ${targets.length} fallback-only items with placeholder/missing images.`);

  for (const item of targets) {
    const source = manifestById.get(item.id);
    if (!source?.sourceImageUrl) {
      summary.failed += 1;
      console.error(`[FAIL] ${item.id}: Missing source image in manifest`);
      continue;
    }

    const key = `rentals/${item.id}.webp`;

    try {
      const sourceBuffer = await downloadSourceImage(source.sourceImageUrl);
      const normalized = await normalizeImage(sourceBuffer);
      const publicUrl = `https://${uploadConfig.publicDomain}/${key}`;

      if (isApply) {
        await uploadToR2(uploadConfig, key, normalized);
        const target = fallbackData.rentals.items.find((entry) => entry.id === item.id);
        if (target) {
          target.imageUrl = publicUrl;
          summary.updatedFallbackItems += 1;
        }
        summary.uploaded += 1;
        console.log(`[OK] ${item.id}: uploaded ${publicUrl}`);
      } else {
        summary.skipped += 1;
        console.log(`[DRY] ${item.id}: would upload ${publicUrl}`);
      }
    } catch (error) {
      summary.failed += 1;
      console.error(`[FAIL] ${item.id}:`, error instanceof Error ? error.message : String(error));
    }
  }

  if (isApply) {
    writeFileSync(DATA_PATH, `${JSON.stringify(fallbackData, null, 2)}\n`, "utf-8");
    console.log(`Updated fallback data: ${DATA_PATH}`);
  }

  writeChecklist(cmsItems, manifest);
  console.log(`Wrote CMS checklist: ${CHECKLIST_PATH}`);

  console.log("Backfill summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("backfill-rental-images failed:", error);
  process.exit(1);
});
