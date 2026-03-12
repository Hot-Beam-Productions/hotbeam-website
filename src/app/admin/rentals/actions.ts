import {
  getCollectionDocs,
  getDocById,
  setDocument,
  deleteDocument,
  docExists,
} from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { rentalSchema } from "@/lib/schemas";
import type { RentalItem, SiteData } from "@/lib/types";
import rawData from "@/data/data.json";

const fallbackSiteData = rawData as SiteData;

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mergeWithFallback<T extends { id: string; order?: number }>(
  fallbackItems: T[],
  cmsItems: T[]
): T[] {
  const mergedItems = new Map<string, T>();

  for (const item of fallbackItems) {
    mergedItems.set(item.id, item);
  }

  for (const item of cmsItems) {
    mergedItems.set(item.id, item);
  }

  return sortByOrder(Array.from(mergedItems.values()));
}

export async function getRentalsAdmin(): Promise<RentalItem[]> {
  const cmsRentals = await getCollectionDocs<RentalItem>("rentals");
  return mergeWithFallback(fallbackSiteData.rentals.items, cmsRentals);
}

export async function getRentalAdmin(id: string): Promise<RentalItem | null> {
  const cmsRental = await getDocById<RentalItem>("rentals", id);
  if (cmsRental) return cmsRental;

  return fallbackSiteData.rentals.items.find((item) => item.id === id) ?? null;
}

export async function createRental(
  data: RentalItem
): Promise<ActionResult> {
  try {
    const parsed = rentalSchema.parse(data);
    const existsInCms = await docExists("rentals", parsed.id);
    const existsInFallback = fallbackSiteData.rentals.items.some((item) => item.id === parsed.id);
    if (existsInCms || existsInFallback) {
      return { success: false, error: "A rental item with this ID already exists" };
    }
    await setDocument("rentals", parsed.id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to create rental");
  }
}

export async function updateRental(
  id: string,
  data: RentalItem
): Promise<ActionResult> {
  try {
    const parsed = rentalSchema.parse(data);
    await setDocument("rentals", id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to update rental");
  }
}

export async function deleteRental(
  id: string
): Promise<ActionResult> {
  try {
    const existsInCms = await docExists("rentals", id);
    if (!existsInCms) {
      const existsInFallback = fallbackSiteData.rentals.items.some((item) => item.id === id);
      if (existsInFallback) {
        return {
          success: false,
          error:
            "This rental comes from fallback seed data. Remove it from src/data/data.json or overwrite it in admin first.",
        };
      }
    }

    await deleteDocument("rentals", id);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to delete rental");
  }
}
