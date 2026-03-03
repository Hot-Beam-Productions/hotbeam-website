const DEFAULT_TITLE_MAX = 60;
const DEFAULT_DESCRIPTION_MAX = 150;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtWordBoundary(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 3) return normalized.slice(0, maxLength);

  const hardSlice = normalized.slice(0, maxLength - 3).trimEnd();
  const lastSpace = hardSlice.lastIndexOf(" ");
  const useSoftBoundary = lastSpace >= Math.floor((maxLength - 3) * 0.6);
  const clipped = useSoftBoundary ? hardSlice.slice(0, lastSpace) : hardSlice;
  return `${clipped}...`;
}

export function clampSeoTitle(title: string, maxLength = DEFAULT_TITLE_MAX): string {
  return truncateAtWordBoundary(title, maxLength);
}

export function clampSeoDescription(description: string, maxLength = DEFAULT_DESCRIPTION_MAX): string {
  return truncateAtWordBoundary(description, maxLength);
}

export function buildSeoTitle(pageTitle: string, brandName: string, maxLength = DEFAULT_TITLE_MAX): string {
  const normalizedPageTitle = normalizeWhitespace(pageTitle);
  const normalizedBrand = normalizeWhitespace(brandName);
  const suffix = normalizedBrand ? ` | ${normalizedBrand}` : "";
  const maxPrefixLength = Math.max(0, maxLength - suffix.length);

  if (!normalizedPageTitle) {
    return clampSeoTitle(normalizedBrand || pageTitle, maxLength);
  }

  if (!suffix) {
    return clampSeoTitle(normalizedPageTitle, maxLength);
  }

  if (maxPrefixLength <= 0) {
    return clampSeoTitle(`${normalizedPageTitle}${suffix}`, maxLength);
  }

  return `${truncateAtWordBoundary(normalizedPageTitle, maxPrefixLength)}${suffix}`;
}
