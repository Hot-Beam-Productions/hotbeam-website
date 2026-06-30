import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { brandSchema } from "@/lib/schemas";
import type { BrandData, SiteData } from "@/lib/types";
import rawData from "@/data/data.json";

const fallback = rawData as SiteData;

export async function getBrandAdmin(): Promise<BrandData> {
  try {
    return await getSiteDoc<BrandData>("brand");
  } catch {
    return fallback.brand;
  }
}

export async function saveBrand(data: BrandData): Promise<ActionResult> {
  try {
    const parsed = brandSchema.parse(data);
    await updateSiteDoc("brand", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/", "/about", "/contact", "/work", "/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to save brand settings");
  }
}
