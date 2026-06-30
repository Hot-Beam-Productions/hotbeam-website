import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { aboutSchema } from "@/lib/schemas";
import type { AboutData, SiteData, TeamMember } from "@/lib/types";
import rawData from "@/data/data.json";

const fallback = rawData as SiteData;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMembers(members: TeamMember[]): TeamMember[] {
  return members
    .filter((m) => m.name.trim())
    .map((m) => {
      const next: TeamMember = {
        id: m.id?.trim() ? m.id.trim() : slugify(m.name),
        name: m.name.trim(),
        role: m.role.trim(),
        imageUrl: m.imageUrl ?? "",
      };
      if (m.bio && m.bio.trim()) next.bio = m.bio.trim();
      if (m.email && m.email.trim()) next.email = m.email.trim();
      return next;
    });
}

export async function getAboutAdmin(): Promise<AboutData> {
  try {
    return await getSiteDoc<AboutData>("about");
  } catch {
    return fallback.about;
  }
}

export async function saveAbout(data: AboutData): Promise<ActionResult> {
  try {
    const normalized: AboutData = {
      ...data,
      partners: normalizeMembers(data.partners),
      crew: normalizeMembers(data.crew),
    };
    const parsed = aboutSchema.parse(normalized);
    await updateSiteDoc("about", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/about", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to save about page");
  }
}
