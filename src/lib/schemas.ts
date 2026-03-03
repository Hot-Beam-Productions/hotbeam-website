import { z } from "zod/v4";

function isSafeHref(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  return /^(https?:|mailto:|tel:)/i.test(href);
}

const serviceCategory = z.enum([
  "lighting",
  "video",
  "lasers",
  "sfx",
  "atmospherics",
  "audio-dj",
  "rigging",
  "staging",
  "power",
]);
const serviceIcon = z.enum(["lightbulb", "monitor", "zap", "sparkles"]);

export const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1).refine(isSafeHref, "Invalid link"),
});

export const sectionHeadingSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  client: z.string().min(1),
  location: z.string().min(1),
  eventDate: z.string().min(1),
  services: z.array(serviceCategory).min(1),
  description: z.string().min(1),
  longDescription: z.string().min(1),
  mainImageUrl: z.string(),
  gallery: z.array(z.string()),
  featured: z.boolean(),
  order: z.number().int().min(0).optional(),
  updatedAt: z.string().optional(),
});

export const rentalSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: serviceCategory,
  brand: z.string().min(1),
  description: z.string().min(1),
  specs: z.array(z.string()),
  frequentlyRentedTogether: z.array(z.string()).optional(),
  imageUrl: z.string(),
  available: z.boolean(),
  order: z.number().int().min(0).optional(),
  updatedAt: z.string().optional(),
});

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  imageUrl: z.string(),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  url: z.string().url(),
  location: z.string().min(1),
  region: z.string().min(1),
  phoneDisplay: z.string().min(1),
  phoneHref: z.string().min(1),
  email: z.string().email(),
  instagramHandle: z.string().min(1),
  instagramUrl: z.string().url(),
  heroLogo: z.string(),
  valueProposition: z.string().min(1),
});

export const seoSchema = z.object({
  defaultTitle: z.string().min(1),
  titleTemplate: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()),
});

export const homeServiceSchema = z.object({
  id: serviceCategory,
  icon: serviceIcon,
  title: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string()),
});

const defaultHomeQuickDecisionSignals = [
  "Typical first response within one business day",
  "No-obligation first scope and staffing plan",
  "One accountable team from prep through strike",
];

const defaultHomeBookingSteps = [
  {
    title: "Share the Show Basics",
    description: "Tell us your date, venue, and priorities. Two minutes is enough to start.",
  },
  {
    title: "Review Your Right-Sized Scope",
    description:
      "We send practical options for crew, gear, and timeline so tradeoffs are clear before you commit.",
  },
  {
    title: "Execute With One Lead Team",
    description:
      "The same operators who scope the show stay accountable through load-in, show call, and strike.",
  },
];

const homeBookingFlowSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
  ).min(1),
  assurance: z.string().min(1),
  cta: ctaSchema,
});

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    headline: z.string().min(1),
    subheadline: z.string(),
    departmentLine: z.string(),
    description: z.string().min(1),
    videoUrl: z.string().optional(),
    videoPoster: z.string().optional(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
  }),
  quickDecisionSignals: z.array(z.string()).min(1).default(defaultHomeQuickDecisionSignals),
  trustSignals: z.array(z.string()),
  bookingFlow: homeBookingFlowSchema.default({
    label: "Fast Planning Path",
    title: "How Booking Works",
    description:
      "Most teams do not need a long discovery cycle. Start with your show basics and get a practical scope you can approve, revise, or walk away from.",
    steps: defaultHomeBookingSteps,
    assurance:
      "No pressure to book after the first scope review. If the fit is not right, you still leave with clearer production direction.",
    cta: {
      label: "Start with your show date",
      href: "/contact",
    },
  }),
  services: z.object({
    label: z.string(),
    title: z.string().min(1),
    subtitle: z.string(),
    featuredServiceId: serviceCategory,
    items: z.array(homeServiceSchema),
  }),
  results: z.array(z.object({ label: z.string(), value: z.string() })),
  closingCta: z.object({
    title: z.string().min(1),
    description: z.string(),
    button: ctaSchema,
  }),
});

export const aboutSchema = z.object({
  heading: sectionHeadingSchema,
  storyTitle: z.string().min(1),
  story: z.array(z.string()),
  stats: z.array(z.object({ label: z.string(), value: z.string() })),
  values: z.array(z.object({ title: z.string(), description: z.string() })),
  partners: z.array(teamMemberSchema),
  crew: z.array(teamMemberSchema),
  closingCta: z.object({
    title: z.string().min(1),
    description: z.string(),
    button: ctaSchema,
  }),
});

export const contactSchema = z.object({
  heading: sectionHeadingSchema,
  nextSteps: z.array(z.string()).min(1).default([
    "We review your scope and constraints.",
    "You get a right-sized production plan within one business day.",
    "If it fits, we lock crew, gear, and timeline with you.",
  ]),
  urgentCallout: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }).default({
    title: "Working on a tight timeline?",
    description: "Call us directly and mention your event date so we can prioritize your request.",
  }),
  directContactTitle: z.string().min(1),
  cards: z.array(z.object({ title: z.string(), body: z.string() })),
  eventTypes: z.array(z.string()),
  serviceNeeds: z.array(z.string()),
  success: z.object({ title: z.string(), message: z.string() }),
  submitLabel: z.string().min(1),
  complianceBadges: z.array(z.string()),
});

export const footerSchema = z.object({
  description: z.string().min(1),
  departments: z.array(z.string()),
});

export const navigationSchema = z.object({
  links: z.array(
    z.object({
      href: z
        .string()
        .min(1)
        .refine((href) => href.startsWith("/") && !href.startsWith("//"), "Navigation links must be internal paths"),
      label: z.string().min(1),
    })
  ),
});

export const workSettingsSchema = z.object({
  heading: sectionHeadingSchema,
});

export const rentalsSettingsSchema = z.object({
  heading: sectionHeadingSchema,
  categories: z.array(z.object({ value: z.string(), label: z.string() })),
  footerNote: z.string(),
});
