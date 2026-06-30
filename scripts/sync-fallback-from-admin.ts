/**
 * Pull live Firestore content into src/data/data.json (the static fallback),
 * so the repo fallback mirrors what the admin portal / live site serve.
 *
 * Auth: Application Default Credentials (run `gcloud auth application-default login`).
 * Run:  npx tsx scripts/sync-fallback-from-admin.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  brandSchema,
  navigationSchema,
  seoSchema,
  homeSchema,
  aboutSchema,
  contactSchema,
  footerSchema,
  workSettingsSchema,
  rentalsSettingsSchema,
  projectSchema,
  rentalSchema,
} from "../src/lib/schemas";
import type { SiteData } from "../src/lib/types";

const PROJECT_ID = "hot-beam-website";

/** Merge collection items: fallback base first, live CMS docs override by id. */
function mergeById<T extends { id: string; order?: number }>(base: T[], cms: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of cms) map.set(item.id, item);
  return [...map.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function main() {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  const db = getFirestore();

  async function siteDoc(id: string): Promise<Record<string, unknown>> {
    const snap = await db.doc(`site/${id}`).get();
    if (!snap.exists) throw new Error(`Missing site/${id}`);
    return snap.data() as Record<string, unknown>;
  }

  async function collectionDocs(name: string): Promise<Record<string, unknown>[]> {
    const snap = await db.collection(name).get();
    return snap.docs
      .map((d) => ({ ...d.data(), id: d.id }) as Record<string, unknown>)
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  }

  const [brand, navigation, seo, home, about, contact, footer, workSettings, rentalsSettings] =
    await Promise.all([
      siteDoc("brand"),
      siteDoc("navigation"),
      siteDoc("seo"),
      siteDoc("home"),
      siteDoc("about"),
      siteDoc("contact"),
      siteDoc("footer"),
      siteDoc("work-settings"),
      siteDoc("rentals-settings"),
    ]);
  const projects = await collectionDocs("projects");
  const rentals = await collectionDocs("rentals");

  // Keep the existing fallback projects/rentals as a base; live CMS docs override by id.
  const dataPath = resolve(__dirname, "../src/data/data.json");
  const baseData = JSON.parse(readFileSync(dataPath, "utf-8")) as SiteData;

  // Validate with the public schemas (same as the live data loader).
  const data = {
    brand: brandSchema.parse(brand),
    navigation: navigationSchema.parse(navigation).links,
    seo: seoSchema.parse(seo),
    home: homeSchema.parse(home),
    work: {
      heading: workSettingsSchema.parse(workSettings).heading,
      projects: mergeById(
        baseData.work.projects.map((p) => projectSchema.parse(p)),
        projects.map((p) => projectSchema.parse(p))
      ),
    },
    about: aboutSchema.parse(about),
    rentals: {
      ...rentalsSettingsSchema.parse(rentalsSettings),
      items: mergeById(
        baseData.rentals.items.map((r) => rentalSchema.parse(r)),
        rentals.map((r) => rentalSchema.parse(r))
      ),
    },
    contact: contactSchema.parse(contact),
    footer: footerSchema.parse(footer),
  };

  writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  console.log("✅ Synced src/data/data.json from live Firestore.");
  console.log(`   ${data.work.projects.length} projects, ${data.rentals.items.length} rentals.`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
