import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { contactSchema } from "@/lib/schemas";
import type { ContactData } from "@/lib/types";
import rawData from "@/data/data.json";

export async function getContactAdmin(): Promise<ContactData> {
  try {
    const data = await getSiteDoc<unknown>("contact");
    return contactSchema.parse(data);
  } catch {
    return contactSchema.parse(rawData.contact);
  }
}

export async function updateContact(
  data: ContactData
): Promise<ActionResult> {
  try {
    const parsed = contactSchema.parse(data);
    await updateSiteDoc("contact", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/contact"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Save failed");
  }
}
