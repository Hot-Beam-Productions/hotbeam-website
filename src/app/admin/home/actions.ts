import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { homeSchema } from "@/lib/schemas";
import type { HomeData, SiteData } from "@/lib/types";
import rawData from "@/data/data.json";

const fallback = rawData as SiteData;

export async function getHomeAdmin(): Promise<HomeData> {
  try {
    return await getSiteDoc<HomeData>("home");
  } catch {
    return fallback.home;
  }
}

export async function saveHome(data: HomeData): Promise<ActionResult> {
  try {
    const parsed = homeSchema.parse(data);
    await updateSiteDoc("home", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/", "/about", "/work", "/rentals", "/contact"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to save home page");
  }
}
