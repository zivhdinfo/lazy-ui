"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import {
  CARD_FADE,
  CheckIcon,
  DEFAULT_TIERS,
  DarkButton,
  EASE_OUT,
  Eyebrow,
  PriceDisplay,
  PrimaryButton,
  PricingStyles,
  SecondaryButton,
  VIEWPORT,
  type PricingTier,
} from "../pricing-shared/pricing-shared";

export interface Pricing1Props {
  /** Uppercase eyebrow above the heading. @default "Pricing" */
  eyebrow?: string;
  /** Heading content. Wrap a segment in `<em>` for the muted-italic accent. */
  heading?: ReactNode;
  /** Sub-heading paragraph. */
  subhead?: string;
  /** 3-tier list. Defaults to a sensible 12/24/48 SaaS ladder. */
  tiers?: PricingTier[];
  /** Tier index rendered as the inverted (featured) card. @default 1 */
  featuredIndex?: number;
  className?: string;
}

/**
 * Classic 3-tier pricing — centered hero, "start free" banner, middle tier
 * inverted with the conic ambient ring.
 */
export function Pricing1({
  eyebrow = "Pricing",
  heading,
  subhead = "Start free. Upgrade only when your team outgrows it. Cancel any time — no setup fees, no annual contracts on Starter and Team.",
  tiers = DEFAULT_TIERS,
  featuredIndex = 1,
  className,
}: Pricing1Props) {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      className={`lui-pricing-root lui-pricing-classic${className ? ` ${className}` : ""}`}
    >
      <PricingStyles />

      <motion.header
        className="lui-pricing-classic-head"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={CARD_FADE}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="lui-pricing-heading-md">
          {heading ?? (
            <>
              Simple, transparent <em>pricing.</em>
            </>
          )}
        </h2>
        <p className="lui-pricing-subhead">{subhead}</p>
      </motion.header>

      <motion.div
        className="lui-pricing-feature-banner"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.55, delay: 0.05, ease: EASE_OUT }}
      >
        <div className="lui-pricing-feature-banner-l">
          <h3>Start for free.</h3>
          <p>14-day trial · No credit card required</p>
        </div>
        <PrimaryButton>Get started</PrimaryButton>
      </motion.div>

      <div className="lui-pricing-classic-grid">
        {tiers.slice(0, 3).map((tier, i) => {
          const isFeatured = tier.featured ?? i === featuredIndex;
          return (
            <motion.div
              key={tier.name + i}
              className={`lui-pricing-card lui-pricing-classic-card${
                isFeatured ? " is-featured" : ""
              }`}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={VIEWPORT}
              variants={CARD_FADE}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: EASE_OUT }}
              whileHover={
                reduce
                  ? undefined
                  : { y: isFeatured ? -10 : -3, transition: { duration: 0.25 } }
              }
            >
              <div className="lui-pricing-card-topline">
                <h4 className="lui-pricing-tier-name">{tier.name}</h4>
                {(tier.badge || isFeatured) && (
                  <span className="lui-pricing-pop-pill">
                    {tier.badge ?? "Most popular"}
                  </span>
                )}
              </div>
              <p className="lui-pricing-card-desc">{tier.description}</p>
              <div className="lui-pricing-price-row">
                <PriceDisplay price={tier.price} size="lg" />
                {tier.per && <span className="lui-pricing-per">{tier.per}</span>}
              </div>
              <div className="lui-pricing-billed">
                {isFeatured
                  ? "Billed annually · save 20%"
                  : i === 0
                    ? "Billed monthly · cancel anytime"
                    : "Billed annually · invoiced"}
              </div>

              <div className="lui-pricing-features-heading">
                {i === 0
                  ? "Includes"
                  : isFeatured
                    ? "Everything in Starter, plus"
                    : "Everything in Team, plus"}
              </div>
              <ul className="lui-pricing-features">
                {tier.features.map((f) => (
                  <li key={f}>
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="lui-pricing-card-cta">
                {isFeatured ? (
                  <DarkButton>{tier.cta?.label ?? `Choose ${tier.name}`}</DarkButton>
                ) : (
                  <SecondaryButton>
                    {tier.cta?.label ?? `Choose ${tier.name}`}
                  </SecondaryButton>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

Pricing1.displayName = "Pricing1";
