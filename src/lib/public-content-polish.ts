import type { AboutData, ContactData, HomeData } from "@/lib/types";

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function polishHomeData(home: HomeData): HomeData {
  return {
    ...home,
    hero: {
      ...home.hero,
      eyebrow: "Colorado-Based. Nationally Deployed. Show-Ready.",
      headline: "Reliable Production for Shows That Cannot Miss.",
      subheadline:
        "Lighting, lasers, LED video, and SFX for touring artists, venues, festivals, and brand events.",
      departmentLine: "Lighting · Lasers · LED Video · Special Effects",
      description:
        "Share your date, venue, and priorities. We will return a practical plan with crew, gear, and timeline options.",
      primaryCta: {
        label: "Request a Proposal",
        href: "/contact",
      },
      secondaryCta: {
        label: "See Our Work",
        href: "/work",
      },
    },
    closingCta: {
      ...home.closingCta,
      title: "Ready to Scope Your Next Show?",
      description:
        "Send your date, venue, and goals. We will come back with a clear production approach, crew plan, and next steps.",
      button: {
        label: "Request a Proposal",
        href: "/contact",
      },
    },
  };
}

export function polishAboutData(about: AboutData): AboutData {
  return {
    ...about,
    heading: {
      label: "About Hot Beam",
      title: "Hands-On Production From Planning Through Show Call.",
      subtitle:
        "We are a working technical team built for live events where timing, safety, and execution have to hold up.",
    },
    storyTitle: "How Hot Beam Works",
    story: [
      "Hot Beam is run by operators who care about the details that make a show feel clean, intentional, and reliable.",
      "We scope each project around the venue, schedule, rider, safety requirements, and the experience the audience should remember.",
      "The same team that plans the technical approach stays accountable through prep, load-in, show call, and strike.",
    ],
    partners: about.partners.map((partner) => {
      const name = normalizeIdentifier(partner.name);

      if (name.includes("daniel")) {
        return {
          ...partner,
          role: "Co-Founder · Technical Director",
          bio: "Daniel leads technical direction, laser operations, system architecture, and show programming.",
        };
      }

      if (name.includes("beau")) {
        return {
          ...partner,
          name: "Beau Davis",
          role: "Co-Founder · Production Manager",
          bio: "Beau leads production management, laser design, crew coordination, logistics, and project sales.",
        };
      }

      return partner;
    }),
    crew: [],
  };
}

export function polishContactData(contact: ContactData): ContactData {
  return {
    ...contact,
    heading: {
      ...contact.heading,
      title: "Request a Proposal",
      subtitle:
        "Share your event brief, date, venue, and technical priorities. We will respond with a clear next step.",
    },
    nextSteps: [
      "We review your scope, date, venue, and technical constraints.",
      "You get a right-sized production plan within one business day.",
      "If it fits, we lock crew, gear, and timeline with you.",
    ],
  };
}
