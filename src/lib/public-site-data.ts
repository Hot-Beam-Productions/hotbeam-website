import rawData from "@/data/data.json";
import { unstable_cache } from "next/cache";
import type {
  NavLink,
  ProjectItem,
  RentalItem,
  SiteData,
} from "@/lib/types";
import {
  navigationSchema,
  projectSchema,
  rentalSchema,
  seoSchema,
  workSettingsSchema,
} from "@/lib/schemas";
import { getPublishedSiteSnapshot } from "@/lib/published-site-snapshot";

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
  updateTime?: string;
}

interface FirestoreCollectionResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

interface LoadOptions {
  fresh?: boolean;
  fallback?: SiteData;
}

const fallbackSiteData = rawData as SiteData;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;
const PUBLIC_DATA_REVALIDATE_SECONDS = 30 * 60;
const PUBLIC_CACHE_TAG = "public-site-data";
const CANONICAL_SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() || "";
const ROOT_DOMAIN = "hotbeamproductions.com";
const WWW_DOMAIN = "www.hotbeamproductions.com";

function normalizeOrigin(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  parsed.protocol = "https:";
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  if (parsed.hostname === ROOT_DOMAIN) {
    parsed.hostname = WWW_DOMAIN;
  }
  return parsed.toString().replace(/\/$/, "");
}

function normalizeBrand(brand: SiteData["brand"]): SiteData["brand"] {
  try {
    const fallbackOrigin = normalizeOrigin(brand.url);
    const origin = CANONICAL_SITE_ORIGIN ? normalizeOrigin(CANONICAL_SITE_ORIGIN) : fallbackOrigin;
    return { ...brand, url: origin };
  } catch {
    return brand;
  }
}

function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("bytesValue" in value) return value.bytesValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("geoPointValue" in value) return value.geoPointValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => decodeFirestoreValue(item));
  }
  if ("mapValue" in value) {
    return decodeFirestoreFields(value.mapValue.fields ?? {});
  }
  return null;
}

function decodeFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function decodeFirestoreDocument<T>(doc: FirestoreDocument): T {
  const id = doc.name.split("/").pop() ?? "";
  const decoded = decodeFirestoreFields(doc.fields ?? {});
  const fieldUpdatedAt = typeof (decoded as { updatedAt?: unknown }).updatedAt === "string"
    ? (decoded as { updatedAt: string }).updatedAt
    : undefined;

  const updatedAt = fieldUpdatedAt ?? doc.updateTime;
  return { id, ...decoded, ...(updatedAt ? { updatedAt } : {}) } as T;
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mergeCollectionWithFallback<T extends { id: string; order?: number }>(
  fallbackItems: T[],
  cmsItems: T[] | null
): T[] {
  if (!cmsItems) return fallbackItems;

  const mergedItems = new Map<string, T>();

  for (const item of fallbackItems) {
    mergedItems.set(item.id, item);
  }

  for (const item of cmsItems) {
    mergedItems.set(item.id, item);
  }

  return sortByOrder(Array.from(mergedItems.values()));
}

function parseOrNull<T>(result: { success: boolean; data?: T }): T | null {
  return result.success ? (result.data as T) : null;
}

function normalizeFallbackSiteData(candidate: SiteData | null): SiteData {
  if (!candidate || typeof candidate !== "object") {
    return fallbackSiteData;
  }

  const source = candidate as Partial<SiteData>;
  const sourceWork = source.work;
  const sourceRentals = source.rentals;

  const parsedNavigation = Array.isArray(source.navigation)
    ? parseOrNull(navigationSchema.safeParse({ links: source.navigation }))?.links
    : null;
  const parsedSeo = parseOrNull(seoSchema.safeParse(source.seo));
  const parsedWorkSettings = parseOrNull(
    workSettingsSchema.safeParse({
      heading: sourceWork?.heading,
    })
  );

  const sourceProjects = Array.isArray(sourceWork?.projects) ? sourceWork.projects : [];
  const sourceRentalsItems = Array.isArray(sourceRentals?.items) ? sourceRentals.items : [];

  const parsedProjects = sourceProjects
    .map((project) => parseOrNull(projectSchema.safeParse(project)))
    .filter((project): project is ProjectItem => Boolean(project));
  const parsedRentals = sourceRentalsItems
    .map((rental) => parseOrNull(rentalSchema.safeParse(rental)))
    .filter((rental): rental is RentalItem => Boolean(rental));

  return {
    ...fallbackSiteData,
    brand: normalizeBrand(fallbackSiteData.brand),
    navigation:
      parsedNavigation && parsedNavigation.length > 0
        ? parsedNavigation
        : fallbackSiteData.navigation,
    seo: parsedSeo ?? fallbackSiteData.seo,
    home: fallbackSiteData.home,
    about: fallbackSiteData.about,
    contact: fallbackSiteData.contact,
    footer: fallbackSiteData.footer,
    work: {
      ...fallbackSiteData.work,
      ...(parsedWorkSettings ?? {}),
      projects: parsedProjects.length > 0 ? parsedProjects : fallbackSiteData.work.projects,
    },
    rentals: {
      ...fallbackSiteData.rentals,
      items: parsedRentals.length > 0 ? parsedRentals : fallbackSiteData.rentals.items,
    },
  };
}

async function getBaseFallbackData(options: LoadOptions = {}): Promise<SiteData> {
  if (options.fallback) return options.fallback;
  const publishedFallback = await getPublishedSiteSnapshot({ fresh: options.fresh });
  return normalizeFallbackSiteData(publishedFallback);
}

async function fetchFirestoreJson<T>(url: string, options: LoadOptions = {}): Promise<T | null> {
  try {
    const response = await fetch(
      url,
      options.fresh
        ? { cache: "no-store" }
        : {
            next: {
              revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
              tags: [PUBLIC_CACHE_TAG],
            },
          }
    );
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getSiteDoc<T>(docId: string, options: LoadOptions = {}): Promise<T | null> {
  if (!projectId || !apiKey) return null;
  const encodedDocId = encodeURIComponent(docId);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/site/${encodedDocId}?key=${apiKey}`;
  const doc = await fetchFirestoreJson<FirestoreDocument>(url, options);
  if (!doc) return null;
  return decodeFirestoreFields(doc.fields ?? {}) as T;
}

async function getCollectionDocs<T>(collectionName: string, options: LoadOptions = {}): Promise<T[] | null> {
  if (!projectId || !apiKey) return null;

  let nextPageToken: string | undefined;
  const docs: T[] = [];

  do {
    const query = new URLSearchParams({
      key: apiKey,
      pageSize: "100",
      ...(nextPageToken ? { pageToken: nextPageToken } : {}),
    });
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?${query.toString()}`;
    const data = await fetchFirestoreJson<FirestoreCollectionResponse>(url, options);
    if (!data) return null;

    docs.push(...(data.documents ?? []).map((doc) => decodeFirestoreDocument<T>(doc)));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return docs;
}

async function loadBrandData(options: LoadOptions = {}): Promise<SiteData["brand"]> {
  const baseFallback = await getBaseFallbackData(options);
  return normalizeBrand(baseFallback.brand);
}

async function loadNavigationData(options: LoadOptions = {}): Promise<NavLink[]> {
  const baseFallback = await getBaseFallbackData(options);
  const navigationDoc = await getSiteDoc<{ links?: NavLink[] }>("navigation", options);
  if (!navigationDoc || !Array.isArray(navigationDoc.links)) {
    return baseFallback.navigation;
  }

  const parsed = parseOrNull(navigationSchema.safeParse({ links: navigationDoc.links }))?.links;
  if (!parsed || parsed.length === 0) {
    return baseFallback.navigation;
  }

  return parsed;
}

async function loadSeoData(options: LoadOptions = {}): Promise<SiteData["seo"]> {
  const baseFallback = await getBaseFallbackData(options);
  const seoDoc = await getSiteDoc<SiteData["seo"]>("seo", options);
  return parseOrNull(seoSchema.safeParse(seoDoc)) ?? baseFallback.seo;
}

async function loadHomeData(options: LoadOptions = {}): Promise<SiteData["home"]> {
  const baseFallback = await getBaseFallbackData(options);
  return baseFallback.home;
}

async function loadAboutData(options: LoadOptions = {}): Promise<SiteData["about"]> {
  const baseFallback = await getBaseFallbackData(options);
  return baseFallback.about;
}

async function loadContactData(options: LoadOptions = {}): Promise<SiteData["contact"]> {
  const baseFallback = await getBaseFallbackData(options);
  return baseFallback.contact;
}

async function loadFooterData(options: LoadOptions = {}): Promise<SiteData["footer"]> {
  const baseFallback = await getBaseFallbackData(options);
  return baseFallback.footer;
}

async function loadWorkData(options: LoadOptions = {}): Promise<SiteData["work"]> {
  const baseFallback = await getBaseFallbackData(options);
  const projectsDocs = await getCollectionDocs<ProjectItem>("projects", options);
  const projects = mergeCollectionWithFallback(baseFallback.work.projects, projectsDocs);
  const parsedProjects = projects
    .map((project) => parseOrNull(projectSchema.safeParse(project)))
    .filter((project): project is ProjectItem => Boolean(project));

  return {
    ...baseFallback.work,
    projects: parsedProjects.length > 0 ? parsedProjects : baseFallback.work.projects,
  };
}

async function loadRentalsData(options: LoadOptions = {}): Promise<SiteData["rentals"]> {
  const baseFallback = await getBaseFallbackData(options);
  const rentalsDocs = await getCollectionDocs<RentalItem>("rentals", options);

  const rentals = mergeCollectionWithFallback(baseFallback.rentals.items, rentalsDocs);
  const parsedRentals = rentals
    .map((rental) => parseOrNull(rentalSchema.safeParse(rental)))
    .filter((rental): rental is RentalItem => Boolean(rental));

  return {
    ...baseFallback.rentals,
    items: parsedRentals.length > 0 ? parsedRentals : baseFallback.rentals.items,
  };
}

async function loadPublicSiteData(options: LoadOptions = {}): Promise<SiteData> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };

  const [brand, navigation, seo, home, about, contact, footer, work, rentals] = await Promise.all([
    loadBrandData(nextOptions),
    loadNavigationData(nextOptions),
    loadSeoData(nextOptions),
    loadHomeData(nextOptions),
    loadAboutData(nextOptions),
    loadContactData(nextOptions),
    loadFooterData(nextOptions),
    loadWorkData(nextOptions),
    loadRentalsData(nextOptions),
  ]);

  return {
    ...baseFallback,
    brand,
    navigation,
    seo,
    home,
    about,
    contact,
    footer,
    work,
    rentals,
  };
}

async function loadPublicShellData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand" | "navigation" | "footer">> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };
  const [brand, navigation, footer] = await Promise.all([
    loadBrandData(nextOptions),
    loadNavigationData(nextOptions),
    loadFooterData(nextOptions),
  ]);
  return { brand, navigation, footer };
}

async function loadPublicBrandData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand">> {
  const baseFallback = await getBaseFallbackData(options);
  const brand = await loadBrandData({ ...options, fallback: baseFallback });
  return { brand };
}

async function loadPublicBrandSeoData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand" | "seo">> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };
  const [brand, seo] = await Promise.all([loadBrandData(nextOptions), loadSeoData(nextOptions)]);
  return { brand, seo };
}

async function loadPublicNavigationData(options: LoadOptions = {}): Promise<Pick<SiteData, "navigation">> {
  const baseFallback = await getBaseFallbackData(options);
  const navigation = await loadNavigationData({ ...options, fallback: baseFallback });
  return { navigation };
}

async function loadPublicHomePageData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand" | "home" | "work">> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };
  const [brand, home, work] = await Promise.all([
    loadBrandData(nextOptions),
    loadHomeData(nextOptions),
    loadWorkData(nextOptions),
  ]);
  return { brand, home, work };
}

async function loadPublicWorkPageData(options: LoadOptions = {}): Promise<Pick<SiteData, "work">> {
  const baseFallback = await getBaseFallbackData(options);
  const work = await loadWorkData({ ...options, fallback: baseFallback });
  return { work };
}

async function loadPublicRentalsPageData(options: LoadOptions = {}): Promise<Pick<SiteData, "rentals">> {
  const baseFallback = await getBaseFallbackData(options);
  const rentals = await loadRentalsData({ ...options, fallback: baseFallback });
  return { rentals };
}

async function loadPublicAboutPageData(options: LoadOptions = {}): Promise<Pick<SiteData, "about">> {
  const baseFallback = await getBaseFallbackData(options);
  const about = await loadAboutData({ ...options, fallback: baseFallback });
  return { about };
}

async function loadPublicContactPageData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand" | "contact">> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };
  const [brand, contact] = await Promise.all([loadBrandData(nextOptions), loadContactData(nextOptions)]);
  return { brand, contact };
}

async function loadPublicSitemapData(options: LoadOptions = {}): Promise<Pick<SiteData, "brand" | "navigation" | "work" | "rentals">> {
  const baseFallback = await getBaseFallbackData(options);
  const nextOptions: LoadOptions = { ...options, fallback: baseFallback };
  const [brand, navigation, work, rentals] = await Promise.all([
    loadBrandData(nextOptions),
    loadNavigationData(nextOptions),
    loadWorkData(nextOptions),
    loadRentalsData(nextOptions),
  ]);
  return { brand, navigation, work, rentals };
}

export async function getPublicSiteDataFresh(): Promise<SiteData> {
  return loadPublicSiteData({ fresh: true });
}

export const getPublicSiteData = unstable_cache(loadPublicSiteData, ["public-site-data-full"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicShellData = unstable_cache(loadPublicShellData, ["public-shell-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicBrandData = unstable_cache(loadPublicBrandData, ["public-brand-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicBrandSeoData = unstable_cache(loadPublicBrandSeoData, ["public-brand-seo-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicNavigationData = unstable_cache(loadPublicNavigationData, ["public-navigation-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicHomePageData = unstable_cache(loadPublicHomePageData, ["public-home-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicWorkData = unstable_cache(loadPublicWorkPageData, ["public-work-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicRentalsData = unstable_cache(loadPublicRentalsPageData, ["public-rentals-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicAboutData = unstable_cache(loadPublicAboutPageData, ["public-about-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicContactData = unstable_cache(loadPublicContactPageData, ["public-contact-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicSitemapData = unstable_cache(loadPublicSitemapData, ["public-sitemap-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});
