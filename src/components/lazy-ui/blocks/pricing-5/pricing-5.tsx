"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { Counter } from "../../counter";
import {
  CARD_FADE,
  DEFAULT_USAGE,
  DarkButton,
  EASE_OUT,
  Eyebrow,
  FeaturedRing,
  PricingStyles,
  SecondaryButton,
  VIEWPORT,
  type PricingUsageStop,
} from "../pricing-shared/pricing-shared";

export interface Pricing5Props {
  /** Eyebrow above the heading. @default "Pricing · usage based" */
  eyebrow?: string;
  /** Heading content. */
  heading?: ReactNode;
  /** Usage tier stops along the slider. */
  usage?: PricingUsageStop[];
  /** Starting slider tier index. @default 2 */
  defaultTier?: number;
  className?: string;
}

/**
 * Usage-based pricing — left rail of trust points, right card with a live
 * slider that animates the price (via `Counter`) and tier label on change.
 */
export function Pricing5({
  eyebrow = "Pricing · usage based",
  heading,
  usage = DEFAULT_USAGE,
  defaultTier = 2,
  className,
}: Pricing5Props) {
  const reduce = useReducedMotion() ?? false;
  const [tierIndex, setTierIndex] = useState(defaultTier);

  const stop = usage[tierIndex] ?? usage[0];
  const progress = useMemo(
    () => (tierIndex / Math.max(1, usage.length - 1)) * 100,
    [tierIndex, usage.length],
  );

  const onSlide = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTierIndex(Number(e.target.value));
  }, []);

  return (
    <section
      className={`lui-pricing-root lui-pricing-usage${className ? ` ${className}` : ""}`}
    >
      <PricingStyles />

      <div className="lui-pricing-usage-wrap">
        <motion.div
          className="lui-pricing-usage-l"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          variants={CARD_FADE}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="lui-pricing-heading-lg">
            {heading ?? (
              <>
                Pricing that scales
                <br />
                <em>with your team.</em>
              </>
            )}
          </h2>
          <p className="lui-pricing-subhead lui-pricing-subhead-l">
            One plan, three meters. Move them to match your actual usage and the
            price adjusts. Change tiers monthly — no commitment, no surprise
            overage.
          </p>

          <ul className="lui-pricing-usage-points">
            {[
              {
                t: "Predictable monthly billing.",
                d: "Flat rate based on the tier you select. Overage is capped and surfaced before it hits your bill.",
              },
              {
                t: "All features included on every tier.",
                d: "SSO, audit logs, integrations, and priority support are never paywalled. You only pay for capacity.",
              },
              {
                t: "30-day money-back guarantee.",
                d: "If it isn't right for your team in the first 30 days, request a full refund. No questions asked.",
              },
            ].map((p, i) => (
              <motion.li
                key={p.t}
                className="lui-pricing-usage-point"
                initial={reduce ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.08,
                  ease: EASE_OUT,
                }}
              >
                <span className="lui-pricing-usage-bullet" aria-hidden />
                <div>
                  <strong>{p.t}</strong>
                  <div className="lui-pricing-usage-point-desc">{p.d}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="lui-pricing-usage-card"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
        >
          <FeaturedRing reduce={reduce} />
          <div className="lui-pricing-usage-card-topr">
            <span className="lui-pricing-mono-cap lui-pricing-mono-cap-inv">
              {stop.name} tier · estimate
            </span>
            <span className="lui-pricing-usage-live">
              <span className="lui-pricing-usage-pulse" />
              Updated live
            </span>
          </div>

          <div className="lui-pricing-usage-price">
            <AnimatePresence mode="wait" initial={false}>
              {stop.price === null ? (
                <motion.span
                  key="custom"
                  className="lui-pricing-usage-price-text"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  Custom
                </motion.span>
              ) : stop.price === 0 ? (
                <motion.span
                  key="free"
                  className="lui-pricing-usage-price-text"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  Free
                </motion.span>
              ) : (
                <motion.div
                  key="numeric"
                  className="lui-pricing-usage-price-numeric"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <span className="lui-pricing-price-currency lui-pricing-price-currency-xl">
                    $
                  </span>
                  <Counter
                    className="lui-pricing-usage-counter"
                    value={stop.price}
                    effect="smooth"
                    speed={520}
                    separator=","
                  />
                  <span className="lui-pricing-per lui-pricing-per-inv">
                    / month, billed monthly
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lui-pricing-usage-meter">
            <div className="lui-pricing-usage-meter-row1">
              <div className="lui-pricing-mono-label lui-pricing-mono-label-inv">
                Workspace size
              </div>
              <div className="lui-pricing-usage-meter-name">{stop.name}</div>
            </div>
            <input
              type="range"
              className="lui-pricing-usage-slider"
              min={0}
              max={usage.length - 1}
              step={1}
              value={tierIndex}
              onChange={onSlide}
              aria-label="Workspace size"
              style={{ ["--p" as string]: `${progress}%` } as CSSProperties}
            />
            <div className="lui-pricing-usage-ticks">
              {usage.map((t) => (
                <span key={t.name}>{t.name}</span>
              ))}
            </div>
          </div>

          <div className="lui-pricing-usage-include">
            {[
              { label: "Users", value: stop.users },
              { label: "Projects", value: stop.projects },
              { label: "Storage", value: stop.storage },
              {
                label: "Support",
                value:
                  stop.price === null
                    ? "24/7 · 30m"
                    : stop.price >= 199
                      ? "Priority · 2h"
                      : stop.price === 0
                        ? "Community"
                        : "Email",
              },
            ].map((cell) => (
              <div key={cell.label} className="lui-pricing-usage-cell">
                <div className="lui-pricing-mono-label lui-pricing-mono-label-inv">
                  {cell.label}
                </div>
                <div className="lui-pricing-usage-cell-v">{cell.value}</div>
              </div>
            ))}
          </div>

          <div className="lui-pricing-usage-cta-row">
            <DarkButton>
              {stop.price === null
                ? "Contact sales"
                : stop.price === 0
                  ? "Create workspace"
                  : `Choose ${stop.name}`}
            </DarkButton>
            <SecondaryButton href="#compare">Compare plans</SecondaryButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

Pricing5.displayName = "Pricing5";
