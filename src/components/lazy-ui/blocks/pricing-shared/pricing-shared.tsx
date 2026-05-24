"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import { Counter } from "../../counter";

// ============================================================
// Public types — shared by every pricing-N block
// ============================================================

export type PricingPeriod = "yearly" | "monthly";

export type PricingTier = {
  name: string;
  price: number | string;
  per?: string;
  description: string;
  features: string[];
  cta?: { label: string; href?: string };
  featured?: boolean;
  strikePrice?: number;
  badge?: string;
};

export type PricingMatrixCell = string | boolean | null;

export type PricingMatrixSection = {
  name: string;
  rows: Array<
    [string, PricingMatrixCell, PricingMatrixCell, PricingMatrixCell, PricingMatrixCell]
  >;
};

export type PricingMatrix = {
  tiers: PricingTier[];
  sections: PricingMatrixSection[];
};

export type PricingUsageStop = {
  name: string;
  users: string;
  projects: string;
  storage: string;
  price: number | null;
};

// ============================================================
// Defaults — exported so each variant can reuse or override
// ============================================================

export const DEFAULT_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: 12,
    per: "/ user · month",
    description:
      "For individuals and small teams getting their first projects shipped.",
    features: [
      "Up to 5 users · 10 projects",
      "20 GB storage per workspace",
      "Core integrations (Slack, GitHub, Drive)",
      "Two-factor authentication",
      "Email support",
    ],
    cta: { label: "Choose Starter" },
  },
  {
    name: "Team",
    price: 24,
    per: "/ user · month",
    description:
      "For growing teams that need shared workspaces and admin controls.",
    features: [
      "Unlimited users · 100 projects",
      "200 GB storage per workspace",
      "All 140+ integrations",
      "SSO via Google & Microsoft",
      "Advanced roles & permissions",
      "Priority support · 4-hour response",
    ],
    cta: { label: "Choose Team" },
    badge: "Most popular",
  },
  {
    name: "Business",
    price: 48,
    per: "/ user · month",
    description:
      "For organizations that need security review, SAML, and a dedicated success manager.",
    features: [
      "Unlimited projects & storage",
      "SAML SSO + SCIM provisioning",
      "Audit logs · 1-year retention",
      "99.9% uptime SLA",
      "Dedicated customer success manager",
    ],
    cta: { label: "Contact sales" },
  },
];

export const DEFAULT_MATRIX: PricingMatrix = {
  tiers: [
    { name: "Starter", price: 12, per: "/ user · mo", description: "", features: [] },
    {
      name: "Team",
      price: 24,
      per: "/ user · mo",
      description: "",
      features: [],
      featured: true,
    },
    { name: "Business", price: 48, per: "/ user · mo", description: "", features: [] },
    { name: "Enterprise", price: "Custom", description: "", features: [] },
  ],
  sections: [
    {
      name: "Usage & limits",
      rows: [
        ["Users", "5", "Unlimited", "Unlimited", "Unlimited"],
        ["Projects", "10", "100", "Unlimited", "Unlimited"],
        ["Storage per workspace", "20 GB", "200 GB", "1 TB", "Unlimited"],
        ["File version history", "30 days", "1 year", "Unlimited", "Unlimited"],
      ],
    },
    {
      name: "Collaboration & integrations",
      rows: [
        ["Real-time co-editing", true, true, true, true],
        ["Guest accounts", "3", "Unlimited", "Unlimited", "Unlimited"],
        [
          "Integrations included",
          "Core (24)",
          "All (140+)",
          "All (140+)",
          "All (140+) + custom",
        ],
        ["Custom domain", false, true, true, true],
      ],
    },
    {
      name: "Security & compliance",
      rows: [
        ["SOC 2 Type II", true, true, true, true],
        ["SSO · Google & Microsoft", false, true, true, true],
        ["SAML SSO + SCIM", false, false, true, true],
        ["Audit log retention", "—", "90 days", "1 year", "7 years"],
        ["Uptime SLA", "—", "99.5%", "99.9%", "99.99%"],
      ],
    },
  ],
};

export const DEFAULT_USAGE: PricingUsageStop[] = [
  { name: "Free", users: "Up to 3", projects: "3", storage: "5 GB", price: 0 },
  { name: "Starter", users: "Up to 10", projects: "20", storage: "50 GB", price: 49 },
  { name: "Team", users: "Up to 50", projects: "200", storage: "500 GB", price: 199 },
  { name: "Scale", users: "Up to 200", projects: "1,000", storage: "2 TB", price: 599 },
  {
    name: "Business",
    users: "Up to 500",
    projects: "Unlimited",
    storage: "10 TB",
    price: 1499,
  },
  {
    name: "Enterprise",
    users: "500+",
    projects: "Unlimited",
    storage: "Custom",
    price: null,
  },
];

// ============================================================
// Motion constants
// ============================================================

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};
export const VIEWPORT = { once: true, margin: "-10%" };
export const CARD_FADE = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// ============================================================
// Primitives
// ============================================================

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="lui-pricing-eyebrow">
      <span className="lui-pricing-eyebrow-dot" aria-hidden />
      {children}
    </span>
  );
}

export function CheckIcon() {
  return (
    <svg
      className="lui-pricing-check"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg
      className="lui-pricing-arrow"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function TeamIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function FeaturedRing({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <motion.div
      className="lui-pricing-featured-ring"
      aria-hidden
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function PriceDisplay({
  price,
  size = "lg",
  strike,
  effect = "smooth",
}: {
  price: number | string;
  size?: "md" | "lg" | "xl";
  strike?: number;
  effect?: ComponentProps<typeof Counter>["effect"];
}) {
  const numeric = typeof price === "number";
  return (
    <span className={`lui-pricing-price lui-pricing-price-${size}`}>
      {strike !== undefined && numeric && (
        <span className="lui-pricing-price-strike">${strike}</span>
      )}
      {numeric ? (
        <>
          <span className="lui-pricing-price-currency">$</span>
          <Counter
            className="lui-pricing-price-value"
            value={price}
            effect={effect}
            speed={420}
          />
        </>
      ) : (
        <span className="lui-pricing-price-value lui-pricing-price-text">
          {price}
        </span>
      )}
    </span>
  );
}

function buttonContents(children: ReactNode, arrow: boolean) {
  return (
    <>
      {children}
      {arrow && <ArrowIcon />}
    </>
  );
}

export function PrimaryButton({
  children,
  arrow = true,
  href,
}: {
  children: ReactNode;
  arrow?: boolean;
  href?: string;
}) {
  const className = "lui-pricing-btn lui-pricing-btn-primary";
  if (href) {
    return (
      <a className={className} href={href}>
        {buttonContents(children, arrow)}
      </a>
    );
  }
  return (
    <button type="button" className={className}>
      {buttonContents(children, arrow)}
    </button>
  );
}

export function SecondaryButton({
  children,
  arrow = false,
  href,
}: {
  children: ReactNode;
  arrow?: boolean;
  href?: string;
}) {
  const className = "lui-pricing-btn lui-pricing-btn-secondary";
  if (href) {
    return (
      <a className={className} href={href}>
        {buttonContents(children, arrow)}
      </a>
    );
  }
  return (
    <button type="button" className={className}>
      {buttonContents(children, arrow)}
    </button>
  );
}

export function DarkButton({
  children,
  arrow = true,
  href,
}: {
  children: ReactNode;
  arrow?: boolean;
  href?: string;
}) {
  const className = "lui-pricing-btn lui-pricing-btn-dark";
  if (href) {
    return (
      <a className={className} href={href}>
        {buttonContents(children, arrow)}
      </a>
    );
  }
  return (
    <button type="button" className={className}>
      {buttonContents(children, arrow)}
    </button>
  );
}

// ============================================================
// Styles — one <style> block, reused by every pricing-N variant.
// Scoped under .lui-pricing-root so it can't leak.
// ============================================================

export function PricingStyles() {
  return (
    <style>{`
      .lui-pricing-root {
        container-type: inline-size;
        --lp-bg: #08090b;
        --lp-bg-2: #0e0f12;
        --lp-surface: #131418;
        --lp-surface-2: #1a1b20;
        --lp-line: rgba(255,255,255,0.07);
        --lp-line-2: rgba(255,255,255,0.12);
        --lp-line-3: rgba(255,255,255,0.22);
        --lp-fg: #ffffff;
        --lp-fg-1: #ededf0;
        --lp-fg-2: #b4b4ba;
        --lp-fg-3: #82828a;
        --lp-fg-4: #54545c;
        --lp-inv-bg: #ffffff;
        --lp-inv-bg-2: #f4f4f6;
        --lp-inv-fg: #08090b;
        --lp-inv-fg-2: #45454a;
        --lp-inv-fg-3: #6e6e76;
        --lp-inv-line: rgba(8,9,11,0.10);
        --lp-inv-line-2: rgba(8,9,11,0.18);
        --lp-halo:
          0 0 0 1px rgba(255,255,255,0.10),
          0 40px 90px -20px rgba(255,255,255,0.14),
          0 60px 140px -40px rgba(255,255,255,0.18),
          0 20px 60px -10px rgba(0,0,0,0.6);
        --lp-sh-1: 0 1px 2px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04);
        --lp-sh-2: 0 10px 28px -6px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
        --lp-top-edge: inset 0 1px 0 rgba(255,255,255,0.08);
        --lp-ease: cubic-bezier(0.16, 1, 0.3, 1);
        --lp-d2: 220ms;
        --lp-d3: 320ms;
        --lp-font: var(--font-geist-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
        --lp-mono: var(--font-geist-mono, ui-monospace, "SF Mono", Menlo, Consolas, monospace);

        position: relative;
        width: 100%;
        min-height: 100%;
        background: var(--lp-bg);
        color: var(--lp-fg-1);
        font-family: var(--lp-font);
        font-size: 14px;
        line-height: 1.55;
        padding: 56px 48px;
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: "ss01", "cv11";
      }
      .lui-pricing-root::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255,255,255,0.04), transparent 60%),
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.045) 1px, transparent 1.5px);
        background-size: auto, 28px 28px;
        pointer-events: none;
      }
      .lui-pricing-root > * { position: relative; z-index: 1; }
      .lui-pricing-root em {
        font-style: italic;
        font-weight: inherit;
        color: var(--lp-fg-2);
      }

      .lui-pricing-eyebrow {
        font-family: var(--lp-mono);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-fg-3);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .lui-pricing-eyebrow-dot {
        width: 5px; height: 5px; border-radius: 999px; background: var(--lp-fg);
      }
      .lui-pricing-mono-label, .lui-pricing-mono-cap {
        font-family: var(--lp-mono);
        font-size: 10.5px;
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-fg-3);
      }
      .lui-pricing-mono-label-inv, .lui-pricing-mono-cap-inv {
        color: var(--lp-inv-fg-3);
      }

      .lui-pricing-subhead {
        margin-top: 16px;
        font-size: 15.5px;
        color: var(--lp-fg-2);
        max-width: 60ch;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.6;
      }
      .lui-pricing-subhead-l { margin-left: 0; margin-right: 0; }

      .lui-pricing-heading-sm,
      .lui-pricing-heading-md,
      .lui-pricing-heading-lg,
      .lui-pricing-heading-xl {
        margin: 14px 0 0;
        font-weight: 600;
        letter-spacing: -0.028em;
        line-height: 1.06;
        color: var(--lp-fg);
      }
      .lui-pricing-heading-sm { font-size: 38px; }
      .lui-pricing-heading-md { font-size: 48px; }
      .lui-pricing-heading-lg { font-size: 56px; }
      .lui-pricing-heading-xl { font-size: 72px; letter-spacing: -0.038em; }

      .lui-pricing-price {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.03em;
      }
      .lui-pricing-price-currency {
        font-weight: 500;
        color: var(--lp-fg-2);
      }
      .lui-pricing-price-md .lui-pricing-price-currency { font-size: 18px; }
      .lui-pricing-price-lg .lui-pricing-price-currency { font-size: 22px; }
      .lui-pricing-price-xl .lui-pricing-price-currency { font-size: 28px; }
      .lui-pricing-price-currency-xl { font-size: 32px !important; }
      .lui-pricing-price-value {
        font-weight: 600;
        color: var(--lp-fg);
        line-height: 1;
      }
      .lui-pricing-price-md .lui-pricing-price-value { font-size: 44px; }
      .lui-pricing-price-lg .lui-pricing-price-value { font-size: 56px; }
      .lui-pricing-price-xl .lui-pricing-price-value { font-size: 84px; letter-spacing: -0.045em; }
      .lui-pricing-price-strike {
        font-size: 16px;
        color: var(--lp-fg-3);
        text-decoration: line-through;
        opacity: 0.6;
      }
      .lui-pricing-price-text {
        font-style: italic;
        font-weight: 500;
        color: var(--lp-fg);
      }
      .lui-pricing-per {
        font-size: 13px;
        color: var(--lp-fg-3);
        margin-left: 4px;
      }
      .lui-pricing-per-xl { font-size: 16px; }
      .lui-pricing-per-inv { color: var(--lp-inv-fg-3); }
      .lui-pricing-price-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin: 0 0 4px;
      }

      .lui-pricing-btn {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 40px;
        padding: 0 18px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--lp-fg-1);
        font: 500 13.5px var(--lp-font);
        white-space: nowrap;
        cursor: pointer;
        text-decoration: none;
        transition:
          background var(--lp-d2) var(--lp-ease),
          border-color var(--lp-d2) var(--lp-ease),
          color var(--lp-d2) var(--lp-ease),
          transform var(--lp-d2) var(--lp-ease),
          box-shadow var(--lp-d3) var(--lp-ease);
      }
      .lui-pricing-btn:active { transform: translateY(0.5px) scale(0.985); }
      .lui-pricing-arrow {
        transition: transform var(--lp-d3) var(--lp-ease);
      }
      .lui-pricing-btn:hover .lui-pricing-arrow { transform: translateX(3px); }

      .lui-pricing-btn-primary {
        background: linear-gradient(180deg, #ffffff 0%, #e6e6e8 100%);
        color: #08090b;
        border-color: rgba(255,255,255,0.4);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.08),
          0 6px 18px -6px rgba(255,255,255,0.35),
          0 1px 2px rgba(0,0,0,0.5);
      }
      .lui-pricing-btn-primary:hover {
        filter: brightness(0.97);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,1),
          inset 0 -1px 0 rgba(0,0,0,0.08),
          0 10px 28px -6px rgba(255,255,255,0.5),
          0 1px 2px rgba(0,0,0,0.5);
      }
      .lui-pricing-btn-primary::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
        transform: translateX(-110%);
        transition: transform 700ms var(--lp-ease);
        pointer-events: none;
      }
      .lui-pricing-btn-primary:hover::after { transform: translateX(110%); }

      .lui-pricing-btn-secondary {
        background: rgba(255,255,255,0.025);
        border-color: var(--lp-line-2);
        color: var(--lp-fg-1);
        box-shadow: var(--lp-top-edge);
      }
      .lui-pricing-btn-secondary:hover {
        background: rgba(255,255,255,0.055);
        border-color: var(--lp-line-3);
      }

      .lui-pricing-btn-dark {
        background: linear-gradient(180deg, #1a1b20 0%, #08090b 100%);
        color: #fff;
        border-color: rgba(255,255,255,0.18);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.16),
          inset 0 -1px 0 rgba(0,0,0,0.4),
          0 6px 18px -6px rgba(0,0,0,0.5);
      }
      .lui-pricing-btn-dark:hover { filter: brightness(1.12); }
      .lui-pricing-btn-dark::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
        transform: translateX(-110%);
        transition: transform 700ms var(--lp-ease);
        pointer-events: none;
      }
      .lui-pricing-btn-dark:hover::after { transform: translateX(110%); }

      .lui-pricing-card {
        position: relative;
        background: var(--lp-surface);
        border: 1px solid var(--lp-line);
        border-radius: 16px;
        padding: 26px;
        display: flex;
        flex-direction: column;
        box-shadow: var(--lp-sh-1);
        transition: border-color var(--lp-d3) var(--lp-ease);
      }
      .lui-pricing-card:hover { border-color: var(--lp-line-2); }
      .lui-pricing-card.is-featured {
        background: var(--lp-inv-bg);
        color: var(--lp-inv-fg);
        border-color: transparent;
        box-shadow: var(--lp-halo);
      }
      .lui-pricing-card.is-featured .lui-pricing-card-desc { color: var(--lp-inv-fg-2); }
      .lui-pricing-card.is-featured .lui-pricing-price-currency,
      .lui-pricing-card.is-featured .lui-pricing-per { color: var(--lp-inv-fg-3); }
      .lui-pricing-card.is-featured .lui-pricing-price-value,
      .lui-pricing-card.is-featured .lui-pricing-tier-name,
      .lui-pricing-card.is-featured .lui-pricing-editorial-name { color: var(--lp-inv-fg); }
      .lui-pricing-card.is-featured .lui-pricing-billed,
      .lui-pricing-card.is-featured .lui-pricing-features-heading,
      .lui-pricing-card.is-featured .lui-pricing-editorial-corner,
      .lui-pricing-card.is-featured .lui-pricing-editorial-meter { color: var(--lp-inv-fg-3); }
      .lui-pricing-card.is-featured .lui-pricing-features li { color: var(--lp-inv-fg); }
      .lui-pricing-card.is-featured .lui-pricing-check { color: var(--lp-inv-fg); }
      .lui-pricing-card.is-featured .lui-pricing-features-heading {
        border-top-color: var(--lp-inv-line);
      }

      .lui-pricing-featured-ring {
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: conic-gradient(from 0deg,
          rgba(255,255,255,0.0) 0deg,
          rgba(255,255,255,0.7) 40deg,
          rgba(255,255,255,0.0) 120deg,
          rgba(255,255,255,0.0) 240deg,
          rgba(255,255,255,0.5) 320deg,
          rgba(255,255,255,0.0) 360deg);
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
                mask-composite: exclude;
        pointer-events: none;
        opacity: 0.7;
      }

      .lui-pricing-card-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .lui-pricing-tier-name {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.018em;
      }
      .lui-pricing-pop-pill {
        font-family: var(--lp-mono);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--lp-inv-fg);
        color: var(--lp-inv-bg);
        white-space: nowrap;
      }
      .lui-pricing-pop-pill-inv {
        background: var(--lp-inv-fg);
        color: var(--lp-inv-bg);
      }
      .lui-pricing-card-desc {
        margin: 0 0 16px;
        font-size: 13.5px;
        color: var(--lp-fg-3);
        line-height: 1.55;
      }
      .lui-pricing-card-desc-inv { color: var(--lp-inv-fg-2); }
      .lui-pricing-billed {
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--lp-fg-3);
        margin-bottom: 20px;
      }
      .lui-pricing-features-heading {
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-fg-3);
        margin: 16px 0 12px;
        padding-top: 16px;
        border-top: 1px dashed var(--lp-line-2);
      }
      .lui-pricing-features {
        list-style: none;
        padding: 0;
        margin: 0 0 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .lui-pricing-features li {
        display: grid;
        grid-template-columns: 18px 1fr;
        gap: 10px;
        font-size: 13.5px;
        color: var(--lp-fg-1);
        line-height: 1.5;
        align-items: start;
      }
      .lui-pricing-check {
        color: var(--lp-fg);
        margin-top: 2px;
      }
      .lui-pricing-card-cta {
        margin-top: auto;
      }
      .lui-pricing-card-cta .lui-pricing-btn {
        width: 100%;
        justify-content: center;
      }

      /* ============================================================
         pricing-1 (Classic)
         ============================================================ */
      .lui-pricing-classic-head { text-align: center; margin-bottom: 36px; }
      .lui-pricing-classic-head .lui-pricing-eyebrow { margin-bottom: 16px; }

      .lui-pricing-feature-banner {
        margin: 0 auto 24px;
        max-width: 720px;
        background: var(--lp-surface);
        border: 1px solid var(--lp-line-2);
        border-radius: 14px;
        padding: 20px 26px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        box-shadow: var(--lp-sh-1);
      }
      .lui-pricing-feature-banner-l h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.015em;
      }
      .lui-pricing-feature-banner-l p {
        margin: 4px 0 0;
        font-family: var(--lp-mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        color: var(--lp-fg-3);
      }

      .lui-pricing-classic-grid {
        display: grid;
        grid-template-columns: 1fr 1.08fr 1fr;
        gap: 16px;
        align-items: stretch;
      }
      .lui-pricing-classic-card { padding: 28px; }
      .lui-pricing-classic-card.is-featured { transform: translateY(-6px); }

      /* ============================================================
         pricing-2 (Bento)
         ============================================================ */
      .lui-pricing-bento-head { text-align: center; margin-bottom: 28px; }
      .lui-pricing-bento-savings {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 16px;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid var(--lp-line-2);
        background: rgba(255,255,255,0.03);
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--lp-fg-2);
      }
      .lui-pricing-bento-grid {
        display: grid;
        grid-template-columns: 1fr 2.1fr;
        gap: 16px;
        align-items: stretch;
      }
      .lui-pricing-bento-free {
        background: var(--lp-surface);
        border: 1px solid var(--lp-line);
        border-radius: 18px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        box-shadow: var(--lp-sh-1);
        transition: border-color var(--lp-d3) var(--lp-ease);
      }
      .lui-pricing-bento-free:hover { border-color: var(--lp-line-2); }
      .lui-pricing-bento-free-title {
        margin: 0;
        font-size: 30px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.025em;
      }
      .lui-pricing-bento-free-tier { margin-top: 24px; }
      .lui-pricing-bento-free-price {
        font-size: 44px;
        font-weight: 600;
        color: var(--lp-fg);
        margin: 6px 0 12px;
        line-height: 1;
        letter-spacing: -0.025em;
        font-variant-numeric: tabular-nums;
      }
      .lui-pricing-bento-free-cta { margin-top: auto; padding-top: 24px; }
      .lui-pricing-bento-free-cta .lui-pricing-btn {
        width: 100%;
        justify-content: center;
      }

      .lui-pricing-bento-plus {
        position: relative;
        background: var(--lp-inv-bg);
        color: var(--lp-inv-fg);
        border-radius: 18px;
        padding: 30px 34px;
        display: flex;
        flex-direction: column;
        box-shadow: var(--lp-halo);
      }
      .lui-pricing-bento-plus-row1 {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
      }
      .lui-pricing-bento-plus-title {
        margin: 0;
        font-size: 30px;
        font-weight: 600;
        color: var(--lp-inv-fg);
        letter-spacing: -0.025em;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .lui-pricing-seg {
        display: inline-flex;
        gap: 2px;
        padding: 3px;
        background: var(--lp-inv-bg-2);
        border-radius: 999px;
        border: 1px solid var(--lp-inv-line);
        position: relative;
      }
      .lui-pricing-seg-btn {
        position: relative;
        height: 30px;
        padding: 0 14px;
        border-radius: 999px;
        border: 0;
        cursor: pointer;
        background: transparent;
        color: var(--lp-inv-fg-2);
        font: 500 12.5px var(--lp-font);
        transition: color var(--lp-d2) var(--lp-ease);
      }
      .lui-pricing-seg-btn.is-active { color: var(--lp-inv-bg); }
      .lui-pricing-seg-pill {
        position: absolute;
        inset: 0;
        background: var(--lp-inv-fg);
        border-radius: 999px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        z-index: 0;
      }
      .lui-pricing-seg-label {
        position: relative;
        z-index: 1;
      }

      .lui-pricing-bento-subs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        margin-top: 22px;
      }
      .lui-pricing-bento-sub .lui-pricing-mono-label { margin-bottom: 6px; }
      .lui-pricing-bento-sub .lui-pricing-price-row {
        align-items: baseline;
        gap: 6px;
        margin: 0;
      }
      .lui-pricing-bento-sub .lui-pricing-price-value { color: var(--lp-inv-fg); }
      .lui-pricing-bento-sub .lui-pricing-price-currency { color: var(--lp-inv-fg-2); }
      .lui-pricing-bento-sub-note {
        margin: 10px 0 0;
        font-size: 12.5px;
        color: var(--lp-inv-fg-3);
        line-height: 1.55;
        max-width: 32ch;
      }
      .lui-pricing-bento-cta-row {
        display: flex;
        gap: 12px;
        margin-top: auto;
        padding-top: 24px;
        flex-wrap: wrap;
      }
      .lui-pricing-bento-cta-row .lui-pricing-btn-secondary {
        background: transparent;
        border-color: var(--lp-inv-line-2);
        color: var(--lp-inv-fg);
        box-shadow: none;
      }
      .lui-pricing-bento-cta-row .lui-pricing-btn-secondary:hover {
        background: var(--lp-inv-bg-2);
      }

      .lui-pricing-bento-bigteam {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 18px 26px;
        background: var(--lp-surface);
        border: 1px solid var(--lp-line);
        border-radius: 14px;
        box-shadow: var(--lp-sh-1);
        flex-wrap: wrap;
      }
      .lui-pricing-bento-bigteam-l {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .lui-pricing-bento-bigteam-icon {
        width: 36px; height: 36px;
        border-radius: 999px;
        border: 1px solid var(--lp-line-2);
        display: grid; place-items: center;
        background: rgba(255,255,255,0.02);
        color: var(--lp-fg);
      }
      .lui-pricing-bento-bigteam h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.015em;
      }
      .lui-pricing-bento-bigteam .lui-pricing-card-desc {
        margin: 4px 0 0;
        font-size: 13px;
      }

      /* ============================================================
         pricing-3 (Editorial)
         ============================================================ */
      .lui-pricing-editorial { padding: 60px 56px; }
      .lui-pricing-editorial-head {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: end;
        gap: 28px;
        margin-bottom: 56px;
      }
      .lui-pricing-editorial-head-right {
        display: flex;
        flex-direction: column;
        align-items: end;
        gap: 12px;
      }
      .lui-pricing-editorial-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
      }
      .lui-pricing-editorial-card {
        padding: 34px;
        min-height: 460px;
      }
      .lui-pricing-editorial-card.is-featured { transform: translateY(-8px); }
      .lui-pricing-editorial-corner {
        position: absolute;
        top: 22px;
        right: 26px;
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        color: var(--lp-fg-4);
        text-transform: uppercase;
      }
      .lui-pricing-editorial-name {
        margin: 0;
        font-size: 32px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.022em;
      }
      .lui-pricing-editorial-price-block {
        margin-top: auto;
        padding-top: 16px;
      }
      .lui-pricing-editorial-meter {
        margin-top: 14px;
        font-family: var(--lp-mono);
        font-size: 11px;
        letter-spacing: 0.06em;
        color: var(--lp-fg-3);
      }

      /* ============================================================
         pricing-4 (Matrix)
         ============================================================ */
      .lui-pricing-matrix-head {
        margin-bottom: 28px;
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 24px;
        flex-wrap: wrap;
      }
      .lui-pricing-matrix-head-l { max-width: 60ch; }
      .lui-pricing-matrix-head-ts {
        font-family: var(--lp-font);
        font-size: 12.5px;
        color: var(--lp-fg-3);
        text-align: right;
        line-height: 1.7;
      }
      .lui-pricing-matrix-head-ts strong {
        color: var(--lp-fg);
        font-weight: 500;
      }
      /* ──────────────────────────────────────────────────────────────────
         Matrix — two-column flex layout (à la Windsurf).
         LEFT  = sticky labels column
         RIGHT = horizontally-scrollable tier columns container
         Row heights are FIXED per cell role so both columns stay in lockstep.
         Long labels are clamped to 2 lines so they can never push the row
         taller than the matching tier cells.
         ────────────────────────────────────────────────────────────────── */

      /* Row heights — used by both columns. */
      .lui-pricing-matrix-table {
        --lp-matrix-h-head: 112px;
        --lp-matrix-h-section: 56px;
        --lp-matrix-h-row: 56px;
        --lp-matrix-h-cta: 84px;

        position: relative;
        display: flex;
        border: 1px solid var(--lp-line-2);
        border-radius: 12px;
        background: var(--lp-bg-2);
        box-shadow: var(--lp-sh-2);
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
      }
      .lui-pricing-matrix-table::-webkit-scrollbar { height: 8px; }
      .lui-pricing-matrix-table::-webkit-scrollbar-track { background: transparent; }
      .lui-pricing-matrix-table::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 999px;
      }

      .lui-pricing-matrix-labels {
        flex: 0 0 50%;
        max-width: 50%;
        display: flex;
        flex-direction: column;
        background: var(--lp-surface);
        position: sticky;
        left: 0;
        z-index: 2;
        box-shadow: 8px 0 18px -10px rgba(0, 0, 0, 0.55);
      }
      .lui-pricing-matrix-cols {
        display: flex;
        flex: none;
      }
      .lui-pricing-matrix-col {
        flex: 0 0 180px;
        display: flex;
        flex-direction: column;
        background: var(--lp-bg-2);
      }

      /* Shared cell base. */
      .lui-pricing-matrix-cell {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 22px;
        border-bottom: 1px solid var(--lp-line);
        font-family: var(--lp-font);
        font-size: 13px;
        color: var(--lp-fg-1);
        flex: none;
      }

      /* FIXED heights per role — both columns use these so rows align. */
      .lui-pricing-matrix-cell.cell-head    { height: var(--lp-matrix-h-head); }
      .lui-pricing-matrix-cell.cell-section { height: var(--lp-matrix-h-section); }
      .lui-pricing-matrix-cell.cell-row     { height: var(--lp-matrix-h-row); }
      .lui-pricing-matrix-cell.cell-cta     { height: var(--lp-matrix-h-cta); }

      /* Long-text clamping — labels and values both clip to 2 lines max with
         ellipsis. Prevents content from breaking row alignment. */
      .lui-pricing-matrix-cell.cell-label > span {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        word-break: break-word;
        overflow-wrap: anywhere;
        hyphens: auto;
      }
      .lui-pricing-matrix-cell.cell-row.cell-value > span {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      /* Header row */
      .lui-pricing-matrix-cell.cell-head {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        background: var(--lp-surface);
        border-bottom: 1px solid var(--lp-line-2);
        text-align: center;
        padding: 14px 16px;
      }
      .lui-pricing-matrix-cell.cell-head.cell-label {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-fg-3);
        padding: 0 22px;
      }

      /* Section divider row */
      .lui-pricing-matrix-cell.cell-section {
        background: var(--lp-bg);
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-fg);
        font-weight: 500;
        padding: 0 22px;
      }
      .lui-pricing-matrix-cell.cell-section.cell-label,
      .lui-pricing-matrix-cell.cell-section.cell-value {
        background: var(--lp-bg);
      }

      /* Data row label */
      .lui-pricing-matrix-cell.cell-row.cell-label {
        font-family: var(--lp-font);
        font-size: 13px;
        color: var(--lp-fg-1);
      }

      /* Data row value */
      .lui-pricing-matrix-cell.cell-row.cell-value {
        justify-content: center;
        text-align: center;
        font-family: var(--lp-mono);
        font-size: 11.5px;
        color: var(--lp-fg-1);
        padding: 0 12px;
      }

      /* CTA row */
      .lui-pricing-matrix-cell.cell-cta {
        background: var(--lp-surface);
        border-bottom: 0;
        border-top: 1px solid var(--lp-line-2);
        padding: 0 22px;
      }
      .lui-pricing-matrix-cell.cell-cta.cell-label {
        justify-content: flex-start;
        font-family: var(--lp-font);
        font-size: 12.5px;
        color: var(--lp-fg-3);
      }
      .lui-pricing-matrix-cell.cell-cta.cell-value {
        justify-content: center;
        padding: 0 12px;
      }
      .lui-pricing-matrix-cell.cell-cta .lui-pricing-btn {
        width: 100%;
        justify-content: center;
      }

      /* Featured tier — tint the head/row/cta value cells but leave the
         section dividers alone so they keep their row-separator look. */
      .lui-pricing-matrix-col.is-featured .lui-pricing-matrix-cell.cell-head {
        background: rgba(255, 255, 255, 0.055);
      }
      .lui-pricing-matrix-col.is-featured .lui-pricing-matrix-cell.cell-row {
        background: rgba(255, 255, 255, 0.025);
      }
      .lui-pricing-matrix-col.is-featured .lui-pricing-matrix-cell.cell-cta {
        background: rgba(255, 255, 255, 0.055);
      }

      .lui-pricing-matrix-tier-name {
        font-size: 20px;
        font-weight: 600;
        color: var(--lp-fg);
        letter-spacing: -0.015em;
      }
      .lui-pricing-matrix-tier-price {
        font-family: var(--lp-mono);
        font-size: 11.5px;
        color: var(--lp-fg-3);
        letter-spacing: 0.04em;
      }
      .lui-pricing-matrix-top-edge {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 2px;
        background: var(--lp-fg);
        box-shadow: 0 0 14px rgba(255, 255, 255, 0.55);
      }
      .lui-pricing-matrix-mark { color: var(--lp-fg); display: inline-flex; }
      .lui-pricing-matrix-dash { color: var(--lp-fg-4); }
      .lui-pricing-matrix-foot {
        margin-top: 14px;
        display: flex;
        justify-content: space-between;
        gap: 20px;
        font-size: 12.5px;
        color: var(--lp-fg-3);
        flex-wrap: wrap;
      }

      /* ============================================================
         pricing-5 (Usage)
         ============================================================ */
      .lui-pricing-usage-wrap {
        display: grid;
        grid-template-columns: 1fr 1.05fr;
        gap: 44px;
        align-items: center;
      }
      .lui-pricing-usage-points {
        margin: 28px 0 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .lui-pricing-usage-point {
        display: grid;
        grid-template-columns: 22px 1fr;
        gap: 14px;
        align-items: start;
        font-size: 14px;
        color: var(--lp-fg-1);
      }
      .lui-pricing-usage-point strong {
        color: var(--lp-fg);
        font-weight: 600;
        font-size: 14px;
      }
      .lui-pricing-usage-point-desc {
        color: var(--lp-fg-3);
        font-size: 13px;
        margin-top: 2px;
        line-height: 1.5;
      }
      .lui-pricing-usage-bullet {
        margin-top: 5px;
        width: 14px; height: 14px;
        border-radius: 999px;
        border: 1.5px solid var(--lp-fg);
        position: relative;
      }
      .lui-pricing-usage-bullet::after {
        content: "";
        position: absolute;
        inset: 3px;
        border-radius: 999px;
        background: var(--lp-fg);
      }

      .lui-pricing-usage-card {
        position: relative;
        padding: 36px;
        background: var(--lp-inv-bg);
        color: var(--lp-inv-fg);
        border-radius: 18px;
        box-shadow: var(--lp-halo);
        overflow: hidden;
      }
      .lui-pricing-usage-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(8,9,11,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(8,9,11,0.045) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
        mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 80%);
      }
      .lui-pricing-usage-card > * { position: relative; z-index: 1; }
      .lui-pricing-usage-card-topr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }
      .lui-pricing-usage-live {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: var(--lp-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--lp-inv-fg-2);
      }
      .lui-pricing-usage-pulse {
        width: 5px; height: 5px;
        border-radius: 999px;
        background: var(--lp-inv-fg);
      }
      .lui-pricing-usage-price {
        min-height: 88px;
        margin-bottom: 24px;
      }
      .lui-pricing-usage-price-numeric {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .lui-pricing-usage-counter {
        font-size: 80px;
        font-weight: 600;
        color: var(--lp-inv-fg);
        line-height: 0.95;
        letter-spacing: -0.045em;
        font-variant-numeric: tabular-nums;
      }
      .lui-pricing-usage-price .lui-pricing-price-currency-xl {
        color: var(--lp-inv-fg-2);
      }
      .lui-pricing-usage-price-text {
        font-size: 64px;
        font-style: italic;
        font-weight: 500;
        color: var(--lp-inv-fg);
        letter-spacing: -0.035em;
        line-height: 1;
      }

      .lui-pricing-usage-meter { margin-bottom: 24px; }
      .lui-pricing-usage-meter-row1 {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .lui-pricing-usage-meter-name {
        font-size: 20px;
        font-weight: 600;
        color: var(--lp-inv-fg);
        letter-spacing: -0.015em;
      }
      .lui-pricing-usage-slider {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(90deg,
          var(--lp-inv-fg) 0%,
          var(--lp-inv-fg) var(--p, 30%),
          rgba(8,9,11,0.12) var(--p, 30%));
        outline: none;
        cursor: pointer;
        transition: background 250ms var(--lp-ease);
      }
      .lui-pricing-usage-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 22px; height: 22px;
        border-radius: 999px;
        background: var(--lp-inv-fg);
        border: 3px solid var(--lp-inv-bg);
        box-shadow:
          0 0 0 1px rgba(8,9,11,0.2),
          0 4px 12px rgba(0,0,0,0.25);
        cursor: grab;
        transition: transform 200ms var(--lp-ease), box-shadow 200ms var(--lp-ease);
      }
      .lui-pricing-usage-slider:hover::-webkit-slider-thumb {
        transform: scale(1.08);
        box-shadow:
          0 0 0 1px rgba(8,9,11,0.25),
          0 6px 18px rgba(0,0,0,0.3);
      }
      .lui-pricing-usage-slider:active::-webkit-slider-thumb {
        cursor: grabbing;
        transform: scale(1.15);
      }
      .lui-pricing-usage-slider::-moz-range-thumb {
        width: 22px; height: 22px;
        border-radius: 999px;
        background: var(--lp-inv-fg);
        border: 3px solid var(--lp-inv-bg);
        box-shadow: 0 0 0 1px rgba(8,9,11,0.2), 0 4px 12px rgba(0,0,0,0.25);
      }
      .lui-pricing-usage-ticks {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        font-family: var(--lp-mono);
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--lp-inv-fg-3);
      }

      .lui-pricing-usage-include {
        padding-top: 22px;
        border-top: 1px dashed var(--lp-inv-line);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .lui-pricing-usage-cell-v {
        font-size: 18px;
        font-weight: 600;
        color: var(--lp-inv-fg);
        margin-top: 4px;
        letter-spacing: -0.012em;
        font-variant-numeric: tabular-nums;
      }
      .lui-pricing-usage-cta-row {
        display: flex;
        gap: 12px;
        margin-top: 22px;
        flex-wrap: wrap;
      }
      .lui-pricing-usage-cta-row .lui-pricing-btn-secondary {
        background: transparent;
        border-color: var(--lp-inv-line-2);
        color: var(--lp-inv-fg);
        box-shadow: none;
      }
      .lui-pricing-usage-cta-row .lui-pricing-btn-secondary:hover {
        background: var(--lp-inv-bg-2);
      }

      @container (max-width: 1024px) {
        .lui-pricing-classic-grid { grid-template-columns: 1fr; }
        .lui-pricing-bento-grid { grid-template-columns: 1fr; }
        .lui-pricing-editorial-grid { grid-template-columns: 1fr; }
        .lui-pricing-editorial-head { grid-template-columns: 1fr; }
        .lui-pricing-editorial-head-right { align-items: start; }
        .lui-pricing-usage-wrap { grid-template-columns: 1fr; gap: 32px; }
        .lui-pricing-heading-xl { font-size: 56px; }
        .lui-pricing-heading-lg { font-size: 44px; }
        .lui-pricing-heading-md { font-size: 38px; }
      }
      /* Desktop: labels become 1/6 of the table width, tier cols share 5/6.
         No scroll, no sticky shadow. */
      @container (min-width: 1024px) {
        .lui-pricing-matrix-table {
          overflow-x: visible;
        }
        .lui-pricing-matrix-labels {
          flex: 1.6 1 0;
          max-width: none;
          position: static;
          box-shadow: none;
        }
        .lui-pricing-matrix-cols {
          flex: 4 1 0;
        }
        .lui-pricing-matrix-col {
          flex: 1 1 0;
          min-width: 0;
        }
      }
      @container (max-width: 720px) {
        .lui-pricing-root { padding: 32px 20px; font-size: 13.5px; }
        .lui-pricing-heading-xl { font-size: 42px; }
        .lui-pricing-heading-lg { font-size: 36px; }
        .lui-pricing-heading-md { font-size: 30px; }
        .lui-pricing-heading-sm { font-size: 26px; }
        .lui-pricing-bento-subs { grid-template-columns: 1fr; }
        .lui-pricing-usage-include { grid-template-columns: 1fr 1fr; gap: 14px; }
        .lui-pricing-usage-wrap { gap: 24px; }
        /* Compact buttons for tighter cards */
        .lui-pricing-btn {
          height: 36px;
          padding: 0 14px;
          font-size: 13px;
          gap: 6px;
        }
      }
      @container (max-width: 540px) {
        .lui-pricing-usage-include { grid-template-columns: 1fr; }
      }
      @container (max-width: 480px) {
        .lui-pricing-root { padding: 28px 16px; }
        .lui-pricing-heading-xl { font-size: 36px; }
        .lui-pricing-heading-lg { font-size: 30px; }
        .lui-pricing-heading-md { font-size: 26px; }
        .lui-pricing-heading-sm { font-size: 22px; }
        .lui-pricing-subhead { font-size: 14.5px; margin-top: 12px; }

        /* Tighter buttons on mobile — base sizes were tuned for desktop */
        .lui-pricing-btn {
          height: 34px;
          padding: 0 12px;
          font-size: 12.5px;
          gap: 5px;
          border-radius: 7px;
        }
        .lui-pricing-arrow {
          width: 12px;
          height: 12px;
        }

        /* Universal: stack any card-internal CTA rows */
        .lui-pricing-feature-banner { flex-direction: column; align-items: stretch; text-align: left; gap: 14px; }
        .lui-pricing-feature-banner .lui-pricing-btn { width: 100%; justify-content: center; }
        .lui-pricing-bento-bigteam { flex-direction: column; align-items: stretch; }
        .lui-pricing-bento-bigteam .lui-pricing-btn { width: 100%; justify-content: center; }

        /* Cards a bit tighter */
        .lui-pricing-card { padding: 22px 18px; }
        .lui-pricing-tier-name { font-size: 20px; }
        .lui-pricing-price-lg .lui-pricing-price-value { font-size: 48px; }
        .lui-pricing-price-xl .lui-pricing-price-value { font-size: 64px; }

        /* Editorial: drop the "01 / 03" corner labels (they collide with name) */
        .lui-pricing-editorial-card { padding: 26px 22px; min-height: 0; }
        .lui-pricing-editorial-name { font-size: 26px; }
        .lui-pricing-editorial-corner { font-size: 9.5px; top: 18px; right: 20px; }

        /* Matrix at narrow widths: tighter row heights, smaller labels +
           values, narrower tier columns. */
        .lui-pricing-matrix-head .lui-pricing-heading-sm { font-size: 24px; }
        .lui-pricing-matrix-table {
          --lp-matrix-h-head: 100px;
          --lp-matrix-h-section: 48px;
          --lp-matrix-h-row: 54px;
          --lp-matrix-h-cta: 76px;
        }
        .lui-pricing-matrix-col {
          flex: 0 0 152px;
        }
        .lui-pricing-matrix-cell { padding: 0 14px; font-size: 12px; }
        .lui-pricing-matrix-cell.cell-section { padding: 0 14px; }
        .lui-pricing-matrix-cell.cell-label > span {
          font-size: 12px;
          line-height: 1.25;
        }
        .lui-pricing-matrix-cell.cell-row.cell-value { font-size: 11px; padding: 0 10px; }
        .lui-pricing-matrix-cell.cell-section { font-size: 9.5px; }
        .lui-pricing-matrix-cell.cell-head { padding: 12px; }
        .lui-pricing-matrix-tier-name { font-size: 17px; }
        .lui-pricing-matrix-tier-price { font-size: 10.5px; }
        .lui-pricing-matrix-cell.cell-cta { padding: 0 12px; }
        .lui-pricing-matrix-cell.cell-cta .lui-pricing-btn {
          height: 36px;
          padding: 0 12px;
          font-size: 12.5px;
        }

        /* Usage card: shrink price + meter, drop tick labels, stack CTAs */
        .lui-pricing-usage-card { padding: 26px 20px; border-radius: 14px; }
        .lui-pricing-usage-card-topr { margin-bottom: 18px; }
        .lui-pricing-usage-price { min-height: 60px; margin-bottom: 18px; }
        .lui-pricing-usage-counter { font-size: 52px; letter-spacing: -0.035em; }
        .lui-pricing-usage-price .lui-pricing-price-currency-xl { font-size: 22px !important; }
        .lui-pricing-usage-price-text { font-size: 40px; }
        .lui-pricing-usage-price .lui-pricing-per { font-size: 12px; }
        .lui-pricing-usage-meter { margin-bottom: 18px; }
        .lui-pricing-usage-meter-name { font-size: 16px; }
        .lui-pricing-usage-ticks { display: none; }
        .lui-pricing-usage-cell-v { font-size: 15px; }
        .lui-pricing-usage-cta-row { flex-direction: column; gap: 10px; }
        .lui-pricing-usage-cta-row .lui-pricing-btn {
          width: 100%;
          justify-content: center;
        }
        .lui-pricing-usage-points { gap: 12px; margin-top: 22px; }
        .lui-pricing-usage-point { font-size: 13.5px; }

        /* Bento: tighter type, single-column subs already handled at 720 */
        .lui-pricing-bento-plus { padding: 22px 18px; }
        .lui-pricing-bento-plus-title { font-size: 24px; }
        .lui-pricing-bento-free { padding: 22px 18px; }
        .lui-pricing-bento-free-title { font-size: 24px; }
        .lui-pricing-bento-free-price { font-size: 36px; }
        .lui-pricing-bento-plus-row1 { flex-direction: column; gap: 14px; }
        .lui-pricing-bento-cta-row { flex-direction: column; gap: 10px; }
        .lui-pricing-bento-cta-row .lui-pricing-btn { width: 100%; justify-content: center; }
      }
    `}</style>
  );
}
