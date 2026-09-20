export const MAX_FREE_TRIPS = 10;
export const MAX_PRO_TRIPS = 25;
export const MAX_FREE_AI_MESSAGES = 30;
export const MAX_PRO_AI_MESSAGES = 150;

export interface PricingPlan {
  id: "free" | "pro";
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limitations?: string[];
  ctaText: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Explorer",
    tagline: "Essential tools for casual explorers and weekend trip planning.",
    monthlyPrice: 0,
    annualPrice: 0,
    ctaText: "Current Plan",
    features: [
      "Up to 10 active & planned trips",
      "30 AI Assistant message credits / month",
      "Full Trip Workspace (Itinerary, Stays, Expenses, Notes)",
      "Standard Travel Essentials (Weather, Currency, Maps)",
      "Community Forum & 1-Click Itinerary Cloning",
      "Public Creator Profile (@username)",
      "Markdown Travel Stories publishing",
    ],
    limitations: [
      "Maximum 10 trips total",
      "30 AI credits limit per month",
    ],
  },
  {
    id: "pro",
    name: "Pro Wanderer",
    badge: "Most Popular",
    popular: true,
    tagline: "Expanded 25-trip workspace, 150 monthly AI assistant credits, and creator perks.",
    monthlyPrice: 200,
    annualPrice: 2000,
    ctaText: "Upgrade to Pro",
    features: [
      "Up to 25 active & planned trips",
      "150 AI Assistant message credits / month",
      "Deep Workspace Mutations with 1-click execution",
      "Priority Community Publishing & Verified Creator badge",
      "Unlimited Travel Stories with rich media covers",
      "Offline PDF & JSON itinerary exports",
      "Live Flight & Accommodation tracking integration",
      "Priority 24/7 support & early beta access",
    ],
  },
];

export const PRICING_FAQS = [
  {
    question: "What happens when I reach the 10-trip limit on the Free plan?",
    answer:
      "On the Free Explorer tier, you can manage up to 10 active and planned trips. If you need more workspaces, you can upgrade to Pro Wanderer for an expanded capacity of 25 trips, or archive/delete older completed trips.",
  },
  {
    question: "How does the AI Assistant credit limit work?",
    answer:
      "Free users receive 30 AI assistant message credits each calendar month, renewing automatically on the 1st of every month. Pro Wanderer users receive an expanded quota of 150 AI message credits per month with full structured itinerary proposal mutations.",
  },
  {
    question: "How is billing and checkout handled?",
    answer:
      "Subscriptions are securely handled via Polar.sh (Merchant of Record). We support all major international cards with 256-bit SSL encryption, transparent localized currency pricing, and zero hidden fees.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your Pro Wanderer subscription at any time with a single click. Your Pro access and privileges will remain active until the end of your current billing period.",
  },
  {
    question: "Are my published trips and stories preserved if I downgrade?",
    answer:
      "Absolutely. All your published itineraries, travel stories, and public profile data remain online and accessible to the community regardless of your subscription tier.",
  },
];
