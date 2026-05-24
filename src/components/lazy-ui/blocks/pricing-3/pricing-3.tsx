"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import {
  CARD_FADE,
  DEFAULT_TIERS,
  DarkButton,
  EASE_OUT,
  Eyebrow,
  PriceDisplay,
  PricingStyles,
  SecondaryButton,
  VIEWPORT,
  type PricingTier,
} from "../pricing-shared/pricing-shared";

export interface Pricing3Props {
  /** Eyebrow above the heading. @default "Pricing" */
  eyebrow?: string;
  /** Heading content. */
  heading?: ReactNode;
  /** 3-tier list. */
  tiers?: PricingTier[];
  /** Tier index rendered as the inverted (featured) card. @default 1 */
  featuredIndex?: number;
  className?: string;
}

/**
 * Bold editorial — huge italic-accented headline, 3 minimal cards with massive
 * price numerals, corner index labels.
 */
export function Pricing3({
  eyebrow = "Pricing",
  heading,
  tiers = DEFAULT_TIERS,
  featuredIndex = 1,
  className,
}: Pricing3Props) {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      className={`lui-pricing-root lui-pricing-editorial${className ? ` ${className}` : ""}`}
    >
      <PricingStyles />

      <motion.header
        className="lui-pricing-editorial-head"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={CARD_FADE}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="lui-pricing-heading-xl">
            {heading ?? (
              <>
                Plans for
                <br />
                <em>every stage.</em>
              </>
            )}
          </h2>
        </div>
        <div className="lui-pricing-editorial-head-right">
          <span className="lui-pricing-mono-cap">Want a walkthrough first?</span>
          <SecondaryButton arrow>Book a demo</SecondaryButton>
        </div>
      </motion.header>

      <div className="lui-pricing-editorial-grid">
        {tiers.slice(0, 3).map((tier, i) => {
          const isFeatured = tier.featured ?? i === featuredIndex;
          return (
            <motion.div
              key={tier.name + i}
              className={`lui-pricing-card lui-pricing-editorial-card${
                isFeatured ? " is-featured" : ""
              }`}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={VIEWPORT}
              variants={CARD_FADE}
              transition={{ duration: 0.6, delay: 0.12 + i * 0.12, ease: EASE_OUT }}
              whileHover={
                reduce
                  ? undefined
                  : { y: isFeatured ? -12 : -3, transition: { duration: 0.25 } }
              }
            >
              <motion.span
                className="lui-pricing-editorial-corner"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + i * 0.12,
                  ease: EASE_OUT,
                }}
              >
                {String(i + 1).padStart(2, "0")} / 03
                {isFeatured && " · POPULAR"}
              </motion.span>
              <h3 className="lui-pricing-editorial-name">{tier.name}</h3>
              <p className="lui-pricing-card-desc">{tier.description}</p>

              <div className="lui-pricing-editorial-price-block">
                <PriceDisplay price={tier.price} size="xl" />
                {tier.per && (
                  <span className="lui-pricing-per lui-pricing-per-xl">
                    {tier.per}
                  </span>
                )}
                <div className="lui-pricing-editorial-meter">
                  {tier.features[0] ?? ""}
                </div>
              </div>

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

Pricing3.displayName = "Pricing3";
