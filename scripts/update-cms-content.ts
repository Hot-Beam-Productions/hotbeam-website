/**
 * Surgically update live Firestore CMS content from src/data/data.json.
 *
 * Updates ONLY these fields:
 *   site/home  -> hero.eyebrow, results, trustSignals
 *   site/about -> story, stats, partners[].role/bio
 *
 * Founder image URLs and every other field are read from the LIVE document and
 * preserved untouched.
 *
 * Auth: Application Default Credentials (run `gcloud auth application-default login`).
 *   Dry run (default): npx tsx scripts/update-cms-content.ts
 *   Apply:             npx tsx scripts/update-cms-content.ts --commit
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "hot-beam-website";
const COMMIT = process.argv.includes("--commit");

interface Partner {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  email?: string;
  [key: string]: unknown;
}

interface SiteData {
  home: {
    hero: { eyebrow: string };
    results: Array<{ label: string; value: string }>;
  };
  about: {
    story: string[];
    stats: Array<{ label: string; value: string }>;
    partners: Partner[];
    crew: Partner[];
  };
}

function loadData(): SiteData {
  const raw = readFileSync(resolve(__dirname, "../src/data/data.json"), "utf-8");
  return JSON.parse(raw) as SiteData;
}

async function main() {
  const data = loadData();
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  const db = getFirestore();

  // --- HOME ---
  const homeRef = db.doc("site/home");
  const homeLive = ((await homeRef.get()).data() ?? {}) as Record<string, unknown>;
  const homeHeroLive = (homeLive.hero ?? {}) as Record<string, unknown>;

  console.log("\n=== site/home ===");
  console.log("hero.eyebrow:");
  console.log("  old:", JSON.stringify(homeHeroLive.eyebrow));
  console.log("  new:", JSON.stringify(data.home.hero.eyebrow));
  console.log("results:");
  console.log("  old:", JSON.stringify(homeLive.results));
  console.log("  new:", JSON.stringify(data.home.results));
  console.log("trustSignals: (left unchanged)");

  const homeUpdate: Record<string, unknown> = {
    results: data.home.results,
    "hero.eyebrow": data.home.hero.eyebrow,
  };

  // --- ABOUT (preserve live partner/crew images) ---
  const aboutRef = db.doc("site/about");
  const aboutLive = ((await aboutRef.get()).data() ?? {}) as Record<string, unknown>;

  // Partners: keep live image/name/role; add email; update bio EXCEPT Daniel
  // (he is editing his own bio in the admin portal).
  const livePartners = (Array.isArray(aboutLive.partners) ? aboutLive.partners : []) as Partner[];
  const partnerSrc = new Map(data.about.partners.map((p) => [p.id, p] as const));
  const mergedPartners = livePartners.map((p) => {
    const src = partnerSrc.get(p.id);
    if (!src) return p;
    const next: Partner = { ...p };
    if (src.email) next.email = src.email;
    if (p.id !== "daniel" && src.bio) next.bio = src.bio;
    return next;
  });

  // Crew: preserve an existing live image by id; otherwise use the source entry (new members like Cam).
  const liveCrew = (Array.isArray(aboutLive.crew) ? aboutLive.crew : []) as Partner[];
  const liveCrewById = new Map(liveCrew.map((c) => [c.id, c] as const));
  const mergedCrew = data.about.crew.map((c) => {
    const live = liveCrewById.get(c.id);
    const imageUrl = live?.imageUrl && live.imageUrl.trim() ? live.imageUrl : c.imageUrl;
    return { ...c, imageUrl };
  });

  console.log("\n=== site/about ===");
  console.log("stats:");
  console.log("  old:", JSON.stringify(aboutLive.stats));
  console.log("  new:", JSON.stringify(data.about.stats));
  console.log("story: replacing with", data.about.story.length, "paragraphs");
  console.log("partners (imageUrl PRESERVED; Daniel bio NOT changed):");
  for (const p of mergedPartners) {
    console.log(`  - ${p.name} | image: ${p.imageUrl} | email: ${p.email ?? "(none)"}`);
    console.log(`    bio: ${p.bio}`);
  }
  console.log("crew:");
  for (const c of mergedCrew) {
    console.log(`  - ${c.name} | role: ${c.role} | image: ${c.imageUrl || "(none -> monogram)"} | email: ${c.email ?? "(none)"}`);
  }

  const aboutUpdate: Record<string, unknown> = {
    story: data.about.story,
    stats: data.about.stats,
    partners: mergedPartners,
    crew: mergedCrew,
  };

  if (!COMMIT) {
    console.log("\nDRY RUN — nothing written. Re-run with --commit to apply.\n");
    return;
  }

  await homeRef.update(homeUpdate);
  await aboutRef.update(aboutUpdate);
  console.log("\n✅ Committed updates to site/home and site/about.\n");
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
