import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { homeSchema } from "@/lib/schemas";
import type { HomeData } from "@/lib/types";
import rawData from "@/data/data.json";

export async function getHomeAdmin(): Promise<HomeData> {
  try {
    const data = await getSiteDoc<unknown>("home");
    return homeSchema.parse(data);
  } catch {
    return homeSchema.parse(rawData.home);
  }
}

export async function updateHome(
  data: HomeData
): Promise<ActionResult> {
  try {
    const parsed = homeSchema.parse(data);
    await updateSiteDoc("home", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Save failed");
  }
}
