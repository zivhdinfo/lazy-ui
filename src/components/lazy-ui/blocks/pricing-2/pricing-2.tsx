"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState, type ReactNode } from "react";

import {
  CARD_FADE,
  DarkButton,
  EASE_OUT,
  Eyebrow,
  PriceDisplay,
  PricingStyles,
  SPRING,
  SecondaryButton,
  TeamIcon,
  VIEWPORT,
  type PricingPeriod,
} from "../pricing-shared/pricing-shared";

export interface Pricing2Props {
  /** Eyebrow above the heading. @default "Pricing" */
  eyebrow?: string;
  /** Heading content. */
  heading?: ReactNode;
  /** Optional sub-heading under the title. */
  subhead?: string;
  /** Billing period (controlled). Falls back to internal state if omitted. */
  period?: PricingPeriod;
  /** Fires whenever the user toggles the billing period. */
  onPeriodChange?: (p: PricingPeriod) => void;
  className?: string;
}

/**
 * Bento dual-tier — small Free card on the left, wide inverted Plus card on the
 * right with two sub-prices, a `layoutId`-driven Annual/Monthly toggle pill,
 * and an Enterprise CTA row underneath.
 */
export function Pricing2({
  eyebrow = "Pricing",
  heading,
  subhead,
  period: periodProp,
  onPeriodChange,
  className,
}: Pricing2Props) {
  const reduce = useReducedMotion() ?? false;
  const [localPeriod, setLocalPeriod] = useState<PricingPeriod>(
    periodProp ?? "yearly",
  );
  const period = periodProp ?? localPeriod;
  const setPeriod = useCallback(
    (p: PricingPeriod) => {
      if (!periodProp) setLocalPeriod(p);
      onPeriodChange?.(p);
    },
    [periodProp, onPeriodChange],
  );

  const teamPrice = period === "yearly" ? 19 : 24;
  const businessPrice = period === "yearly" ? 39 : 48;
  const teamStrike = period === "yearly" ? 24 : undefined;
  const businessStrike = period === "yearly" ? 48 : undefined;

  return (
    <section
      className={`lui-pricing-root lui-pricing-bento${className ? ` ${className}` : ""}`}
    >
      <PricingStyles />

      <motion.header
        className="lui-pricing-bento-head"
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
              Choose the plan
              <br />
              <em>that fits.</em>
            </>
          )}
        </h2>
        {subhead && <p className="lui-pricing-subhead">{subhead}</p>}
        <div className="lui-pricing-bento-savings">
          <span className="lui-pricing-eyebrow-dot" aria-hidden />
          Save 20% with annual billing
        </div>
      </motion.header>

      <div className="lui-pricing-bento-grid">
        <motion.div
          className="lui-pricing-bento-free"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          variants={CARD_FADE}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT }}
          whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.25 } }}
        >
          <h3 className="lui-pricing-bento-free-title">Free</h3>
          <p className="lui-pricing-card-desc">
            A complete experience for individuals and small projects. Forever
            free.
          </p>
          <div className="lui-pricing-bento-free-tier">
            <div className="lui-pricing-mono-label">Personal</div>
            <div className="lui-pricing-bento-free-price">$0</div>
            <div className="lui-pricing-card-desc">
              Up to 3 users, 3 projects, and 5 GB of storage. All core features
              included.
            </div>
          </div>
          <div className="lui-pricing-bento-free-cta">
            <SecondaryButton>Create workspace</SecondaryButton>
          </div>
        </motion.div>

        <motion.div
          className="lui-pricing-bento-plus"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          variants={CARD_FADE}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE_OUT }}
          whileHover={reduce ? undefined : { y: -5, transition: { duration: 0.25 } }}
        >
          <div className="lui-pricing-bento-plus-row1">
            <h3 className="lui-pricing-bento-plus-title">
              Paid plans
              <span className="lui-pricing-pop-pill lui-pricing-pop-pill-inv">
                Most popular
              </span>
            </h3>
            <div
              className="lui-pricing-seg"
              role="tablist"
              aria-label="Billing period"
            >
              {(["yearly", "monthly"] as const).map((p) => {
                const active = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPeriod(p)}
                    className={`lui-pricing-seg-btn${active ? " is-active" : ""}`}
                  >
                    {active && !reduce && (
                      <motion.span
                        layoutId="pricing-2-seg-pill"
                        className="lui-pricing-seg-pill"
                        transition={SPRING}
                      />
                    )}
                    <span className="lui-pricing-seg-label">
                      {p === "yearly" ? "Annual" : "Monthly"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="lui-pricing-card-desc lui-pricing-card-desc-inv">
            For teams ready to standardize on a single workspace. Full feature
            set, no usage caps.
          </p>

          <div className="lui-pricing-bento-subs">
            <div className="lui-pricing-bento-sub">
              <div className="lui-pricing-mono-label lui-pricing-mono-label-inv">
                Team
              </div>
              <div className="lui-pricing-price-row">
                <PriceDisplay price={teamPrice} size="md" strike={teamStrike} />
                <span className="lui-pricing-per lui-pricing-per-inv">
                  / user / month
                </span>
              </div>
              <p className="lui-pricing-bento-sub-note">
                Unlimited projects, shared workspaces, SSO, and priority support
                for growing teams.
              </p>
            </div>
            <div className="lui-pricing-bento-sub">
              <div className="lui-pricing-mono-label lui-pricing-mono-label-inv">
                Business
              </div>
              <div className="lui-pricing-price-row">
                <PriceDisplay
                  price={businessPrice}
                  size="md"
                  strike={businessStrike}
                />
                <span className="lui-pricing-per lui-pricing-per-inv">
                  / user / month
                </span>
              </div>
              <p className="lui-pricing-bento-sub-note">
                Adds SAML, SCIM provisioning, audit logs, 99.9% SLA, and a
                dedicated success manager.
              </p>
            </div>
          </div>

          <div className="lui-pricing-bento-cta-row">
            <DarkButton>Choose a plan</DarkButton>
            <SecondaryButton href="#trial">Start 14-day trial</SecondaryButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="lui-pricing-bento-bigteam"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
      >
        <div className="lui-pricing-bento-bigteam-l">
          <div className="lui-pricing-bento-bigteam-icon">
            <TeamIcon />
          </div>
          <div>
            <h4>Enterprise &amp; large teams</h4>
            <p className="lui-pricing-card-desc">
              Volume pricing, custom terms, security review, and a named
              architect for 100+ seats.
            </p>
          </div>
        </div>
        <SecondaryButton arrow>Contact sales</SecondaryButton>
      </motion.div>
    </section>
  );
}

Pricing2.displayName = "Pricing2";
