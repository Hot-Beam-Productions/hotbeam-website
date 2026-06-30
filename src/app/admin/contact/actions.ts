import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { contactSchema } from "@/lib/schemas";
import type { ContactData, SiteData } from "@/lib/types";
import rawData from "@/data/data.json";

const fallback = rawData as SiteData;

export async function getContactAdmin(): Promise<ContactData> {
  try {
    return await getSiteDoc<ContactData>("contact");
  } catch {
    return fallback.contact;
  }
}

export async function saveContact(data: ContactData): Promise<ActionResult> {
  try {
    const parsed = contactSchema.parse(data);
    await updateSiteDoc("contact", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/contact", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to save contact page");
  }
}
