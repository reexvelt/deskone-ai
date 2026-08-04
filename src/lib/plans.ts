export type PlanId = "free" | "plus" | "pro" | "business";
export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  credits: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
}

/** Single source of truth for pricing. Change here, everything follows. */
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Get your workspace running today.",
    monthly: 0,
    yearly: 0,
    credits: "500 AI credits / month",
    features: [
      "Full workspace access",
      "Up to 3 projects",
      "500 AI credits per month",
      "Limited scheduling (5 posts / month)",
      "2 connected tools",
      "Community support",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "For solo creators shipping every week.",
    monthly: 19,
    yearly: 182,
    credits: "5,000 AI credits / month",
    features: [
      "Up to 15 projects",
      "5,000 AI credits per month",
      "25 GB media storage",
      "Publishing & unlimited scheduling",
      "8 connected tools",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "The full execution engine.",
    monthly: 49,
    yearly: 470,
    credits: "25,000 AI credits / month",
    highlight: true,
    badge: "Most popular",
    features: [
      "Unlimited projects",
      "25,000 AI credits per month",
      "200 GB media storage",
      "Advanced automation & mission chaining",
      "Premium integrations",
      "Analytics & performance reporting",
      "Team collaboration (up to 3 seats)",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For agencies and teams at scale.",
    monthly: 149,
    yearly: 1430,
    credits: "100,000 shared AI credits / month",
    features: [
      "Multi-user workspace (10 seats included)",
      "100,000 shared AI credits per month",
      "Admin dashboard & audit log",
      "Granular team permissions",
      "Highest limits on every feature",
      "Priority infrastructure & SLA",
      "Dedicated success manager",
    ],
  },
];

export function planById(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function priceFor(plan: Plan, interval: BillingInterval): number {
  return interval === "monthly" ? plan.monthly : plan.yearly;
}

export function monthlyEquivalent(plan: Plan, interval: BillingInterval): number {
  return interval === "monthly" ? plan.monthly : Math.round((plan.yearly / 12) * 100) / 100;
}

export function yearlySavings(plan: Plan): number {
  return Math.max(0, plan.monthly * 12 - plan.yearly);
}

/**
 * Payment provider integration points. Secret keys never live in the client —
 * wire these to server functions when Stripe / Paystack are connected.
 */
export const PAYMENT_PROVIDERS = [
  { id: "stripe", name: "Stripe", regions: "Global cards, Apple Pay, Google Pay" },
  { id: "paystack", name: "Paystack", regions: "Nigeria, Ghana, Kenya, South Africa" },
] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number]["id"];
