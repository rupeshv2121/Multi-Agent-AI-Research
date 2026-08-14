/**
 * ============================================================================
 *  PLACEHOLDER MARKETING CONTENT — REPLACE BEFORE PUBLISHING
 * ============================================================================
 *
 * Everything in this file is invented copy for layout purposes. None of it is
 * measured, quoted, or agreed with anyone. It is collected here — rather than
 * scattered through the section components — so there is exactly one file to
 * edit before this page goes anywhere public.
 *
 * Specifically:
 *
 *   METRICS       Illustrative numbers. Nothing in the app measures these.
 *                 Wire them to real figures or delete the section.
 *
 *   TESTIMONIALS  Invented people at invented companies. Publishing fabricated
 *                 reviews as if they were real is deceptive (and in most
 *                 jurisdictions unlawful). Replace with quotes you actually
 *                 have permission to use, or remove the section.
 *
 *   PRICING       Placeholder tiers. The project has no billing.
 *
 * The "Powered by" strip is deliberately NOT here: it lists the real
 * dependencies this project runs on, which is a true statement and needs no
 * disclaimer. It is not a customer logo wall.
 */

export const IS_PLACEHOLDER_CONTENT = true

/* -------------------------------------------------------------------------- */
/*  Metrics                                                                   */
/* -------------------------------------------------------------------------- */

export interface Metric {
  value: number
  suffix: string
  label: string
  /** Shown under the number so a reader knows what it counts. */
  caption: string
  decimals?: number
}

export const METRICS: Metric[] = [
  { value: 1.2, suffix: 'M+', label: 'Research queries', caption: 'Run across the platform', decimals: 1 },
  { value: 50, suffix: 'K+', label: 'Reports generated', caption: 'Sourced and critiqued' },
  { value: 100, suffix: '+', label: 'Integrated sources', caption: 'Web and academic indexes' },
  { value: 99.9, suffix: '%', label: 'Platform uptime', caption: 'Rolling 90-day average', decimals: 1 },
  { value: 95, suffix: '%', label: 'Faster research', caption: 'Versus manual desk research' },
]

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                              */
/* -------------------------------------------------------------------------- */

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  rating: number
  /** Initials render in place of a photo — no invented faces. */
  initials: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The critic pass is the part that changed how I work. Getting a scored review alongside the report means I know which sections to check before I send anything on.',
    name: 'Placeholder Name',
    role: 'Research Lead',
    company: 'Example Labs',
    rating: 5,
    initials: 'PN',
  },
  {
    quote:
      'Watching each agent work makes the output legible. When a source is weak I can see exactly which step let it through instead of guessing at a black box.',
    name: 'Placeholder Name',
    role: 'Analyst',
    company: 'Example Capital',
    rating: 5,
    initials: 'PN',
  },
  {
    quote:
      'A literature scan that used to eat an afternoon now takes a coffee break, and the citations come back attached rather than reconstructed afterwards.',
    name: 'Placeholder Name',
    role: 'Doctoral Researcher',
    company: 'Example University',
    rating: 4,
    initials: 'PN',
  },
  {
    quote:
      'Exporting straight to Markdown dropped a whole copy-and-paste step out of our weekly briefing process.',
    name: 'Placeholder Name',
    role: 'Strategy Director',
    company: 'Example Group',
    rating: 5,
    initials: 'PN',
  },
]

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                   */
/* -------------------------------------------------------------------------- */

export interface Plan {
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  cta: string
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: 'Free',
    cadence: 'self-hosted',
    description: 'Run the full pipeline on your own machine with your own API keys.',
    features: [
      'All four agents',
      'Unlimited local runs',
      'Markdown, PDF and Word export',
      'Browser-local history',
      'Full source code',
    ],
    cta: 'Start researching',
  },
  {
    name: 'Professional',
    price: '$29',
    cadence: 'per month',
    description: 'Hosted runs, longer reports and a persistent research library.',
    features: [
      'Everything in Starter',
      'Hosted pipeline — no keys to manage',
      'Persistent cross-device history',
      'Deep research mode',
      'Priority model capacity',
      'Email support',
    ],
    cta: 'Choose Professional',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual',
    description: 'Team workspaces, SSO and deployment inside your own network.',
    features: [
      'Everything in Professional',
      'Shared team workspaces',
      'SSO and audit logging',
      'Self-hosted or private cloud',
      'Custom agent stages',
      'Dedicated support',
    ],
    cta: 'Book a demo',
  },
]
