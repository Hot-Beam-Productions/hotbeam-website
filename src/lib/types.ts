export type ServiceCategory =
  | "lighting"
  | "video"
  | "lasers"
  | "sfx"
  | "atmospherics"
  | "audio-dj"
  | "rigging"
  | "staging"
  | "power";
export type ServiceIcon = "lightbulb" | "monitor" | "zap" | "sparkles";

export interface NavLink {
  href: string;
  label: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface BrandData {
  name: string;
  shortName: string;
  url: string;
  location: string;
  region: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  heroLogo: string;
  valueProposition: string;
}

export interface SeoData {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
}

export interface HomeService {
  id: ServiceCategory;
  icon: ServiceIcon;
  title: string;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  client: string;
  location: string;
  eventDate: string;
  services: ServiceCategory[];
  description: string;
  longDescription: string;
  mainImageUrl: string;
  gallery: string[];
  featured: boolean;
  order?: number;
  updatedAt?: string;
}

export interface RentalItem {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  brand: string;
  description: string;
  specs: string[];
  frequentlyRentedTogether?: string[];
  imageUrl: string;
  order?: number;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
}

export interface SectionHeading {
  label: string;
  title: string;
  subtitle: string;
}

export interface HomeData {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    departmentLine: string;
    description: string;
    videoUrl?: string;
    videoPoster?: string;
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  quickDecisionSignals: string[];
  trustSignals: string[];
  bookingFlow: {
    label: string;
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
    assurance: string;
    cta: Cta;
  };
  services: {
    label: string;
    title: string;
    subtitle: string;
    featuredServiceId: ServiceCategory;
    items: HomeService[];
  };
  results: Array<{
    label: string;
    value: string;
  }>;
  closingCta: {
    title: string;
    description: string;
    button: Cta;
  };
}

export interface AboutData {
  heading: SectionHeading;
  storyTitle: string;
  story: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
  values: Array<{
    title: string;
    description: string;
  }>;
  partners: TeamMember[];
  crew: TeamMember[];
  closingCta: {
    title: string;
    description: string;
    button: Cta;
  };
}

export interface ContactData {
  heading: SectionHeading;
  nextSteps: string[];
  urgentCallout: {
    title: string;
    description: string;
  };
  directContactTitle: string;
  cards: Array<{
    title: string;
    body: string;
  }>;
  eventTypes: string[];
  serviceNeeds: string[];
  success: {
    title: string;
    message: string;
  };
  submitLabel: string;
  complianceBadges: string[];
}

export interface FooterData {
  description: string;
  departments: string[];
}

export interface WorkSettings {
  heading: SectionHeading;
}

export interface RentalsSettings {
  heading: SectionHeading;
  categories: Array<{
    value: string;
    label: string;
  }>;
  footerNote: string;
}

export interface SiteData {
  brand: BrandData;
  navigation: NavLink[];
  seo: SeoData;
  home: HomeData;
  work: {
    heading: SectionHeading;
    projects: ProjectItem[];
  };
  about: AboutData;
  rentals: {
    heading: SectionHeading;
    categories: Array<{
      value: string;
      label: string;
    }>;
    footerNote: string;
    items: RentalItem[];
  };
  contact: ContactData;
  footer: FooterData;
}
