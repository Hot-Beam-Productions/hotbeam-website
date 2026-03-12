"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FolderOpen,
  Link2,
  Mail,
} from "lucide-react";
import type { AdminHubIcon } from "@/lib/types";

export const ADMIN_HUB_ICON_OPTIONS: Array<{
  value: AdminHubIcon;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "gmail", label: "Gmail", icon: Mail },
  { value: "drive", label: "Google Drive", icon: FolderOpen },
  { value: "jotform", label: "Jotform", icon: ClipboardList },
  { value: "zoho-books", label: "Zoho Books", icon: BookOpen },
  { value: "link", label: "Generic Link", icon: Link2 },
];

export function AdminHubIconGlyph({
  icon,
  className,
}: {
  icon: AdminHubIcon;
  className?: string;
}) {
  switch (icon) {
    case "gmail":
      return <Mail className={className} />;
    case "drive":
      return <FolderOpen className={className} />;
    case "jotform":
      return <ClipboardList className={className} />;
    case "zoho-books":
      return <BookOpen className={className} />;
    case "link":
      return <Link2 className={className} />;
    default:
      return <Link2 className={className} />;
  }
}
