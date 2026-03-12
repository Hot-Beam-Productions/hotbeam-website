import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { adminHubSettingsSchema } from "@/lib/schemas";
import type {
  AdminHubIcon,
  AdminHubLink,
  AdminHubSection,
  AdminHubSettings,
} from "@/lib/types";

const ADMIN_HUB_DOC_ID = "adminHub";

export const ADMIN_HUB_SECTIONS: Array<{ value: AdminHubSection; label: string }> = [
  { value: "employee-resources", label: "Employee Resources" },
];

export const ADMIN_HUB_ICON_LABELS: Record<AdminHubIcon, string> = {
  gmail: "Gmail",
  drive: "Google Drive",
  jotform: "Jotform",
  "zoho-books": "Zoho Books",
  link: "Generic Link",
};

export const ADMIN_HUB_DEFAULT_SETTINGS: AdminHubSettings = {
  links: [
    {
      id: "gmail",
      label: "Gmail",
      description: "Open company inboxes and respond to messages quickly.",
      href: "https://mail.google.com/",
      icon: "gmail",
      section: "employee-resources",
      external: true,
    },
    {
      id: "google-drive",
      label: "Google Drive",
      description: "Jump into shared folders, decks, and production docs.",
      href: "https://drive.google.com/",
      icon: "drive",
      section: "employee-resources",
      external: true,
    },
    {
      id: "jotform",
      label: "Jotform",
      description: "Access forms, responses, and intake workflows.",
      href: "https://www.jotform.com/login/",
      icon: "jotform",
      section: "employee-resources",
      external: true,
    },
    {
      id: "zoho-books",
      label: "Zoho Books",
      description: "Open accounting tools, invoices, and finance workflows.",
      href: "https://books.zoho.com/",
      icon: "zoho-books",
      section: "employee-resources",
      external: true,
    },
  ],
};

function slugifyLinkId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createFallbackId(index: number): string {
  return `resource-${Date.now().toString(36)}-${index + 1}`;
}

export function cloneAdminHubSettings(
  settings: AdminHubSettings = ADMIN_HUB_DEFAULT_SETTINGS
): AdminHubSettings {
  return structuredClone(settings);
}

export function createAdminHubLink(): AdminHubLink {
  return {
    id: createFallbackId(0),
    label: "",
    description: "",
    href: "https://",
    icon: "link",
    section: "employee-resources",
    external: true,
  };
}

export function normalizeAdminHubSettings(settings: AdminHubSettings): AdminHubSettings {
  const usedIds = new Set<string>();

  const links = settings.links.map((link, index) => {
    const baseId =
      slugifyLinkId(link.id) ||
      slugifyLinkId(link.label) ||
      createFallbackId(index);

    let uniqueId = baseId;
    let suffix = 2;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(uniqueId);

    return {
      ...link,
      id: uniqueId,
      label: link.label.trim(),
      description: link.description.trim(),
      href: link.href.trim(),
      section: "employee-resources" as const,
    };
  });

  return { links };
}

export async function getAdminHubSettings(): Promise<AdminHubSettings> {
  try {
    const raw = await getSiteDoc<unknown>(ADMIN_HUB_DOC_ID);
    const parsed = adminHubSettingsSchema.safeParse(raw);
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // Missing or inaccessible admin hub settings fall back to local defaults.
  }

  return cloneAdminHubSettings();
}

export async function saveAdminHubSettings(
  settings: AdminHubSettings
): Promise<AdminHubSettings> {
  const normalized = normalizeAdminHubSettings(settings);
  const parsed = adminHubSettingsSchema.parse(normalized);
  await updateSiteDoc(ADMIN_HUB_DOC_ID, parsed as unknown as Record<string, unknown>);
  return parsed;
}
