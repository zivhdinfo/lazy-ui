"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment, type ReactNode } from "react";

import {
  CARD_FADE,
  CheckIcon,
  DEFAULT_MATRIX,
  EASE_OUT,
  Eyebrow,
  PrimaryButton,
  PricingStyles,
  SecondaryButton,
  VIEWPORT,
  type PricingMatrix,
  type PricingMatrixCell,
} from "../pricing-shared/pricing-shared";

export interface Pricing4Props {
  /** Eyebrow above the heading. @default "Pricing · compare" */
  eyebrow?: string;
  /** Heading content. */
  heading?: ReactNode;
  /** Matrix data — 4 tiers + sections of rows. */
  matrix?: PricingMatrix;
  className?: string;
}

function MatrixCellContent({
  value,
  featured,
}: {
  value: PricingMatrixCell;
  featured?: boolean;
}) {
  if (value === true) {
    return (
      <span
        className={`lui-pricing-matrix-mark${featured ? " is-featured" : ""}`}
      >
        <CheckIcon />
      </span>
    );
  }
  if (value === false || value === null) {
    return <span className="lui-pricing-matrix-dash">—</span>;
  }
  return <span>{value}</span>;
}

/**
 * Comparison matrix.
 *
 * Layout — two parallel columns with fixed row heights, à la Windsurf:
 *   LEFT  = sticky labels column (≈ 50% of width on mobile, 1/6 on desktop)
 *   RIGHT = horizontally-scrollable container of fixed-width tier columns
 *
 * Every cell type has an explicit `height` (head, section, row, cta) so the
 * labels column and tier columns stay in lockstep without relying on grid
 * auto-rows. Labels that overflow are clamped to two lines + ellipsis so the
 * row height stays predictable.
 */
export function Pricing4({
  eyebrow = "Pricing · compare",
  heading,
  matrix = DEFAULT_MATRIX,
  className,
}: Pricing4Props) {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      className={`lui-pricing-root lui-pricing-matrix${className ? ` ${className}` : ""}`}
    >
      <PricingStyles />

      <motion.header
        className="lui-pricing-matrix-head"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={CARD_FADE}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <div className="lui-pricing-matrix-head-l">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="lui-pricing-heading-sm">
            {heading ?? (
              <>
                Compare plans
                <br />
                <em>side by side.</em>
              </>
            )}
          </h2>
        </div>
        <div className="lui-pricing-matrix-head-ts">
          Prices in <strong>USD</strong>
          <br />
          Updated this quarter
          <br />
          Available worldwide
        </div>
      </motion.header>

      <motion.div
        className="lui-pricing-matrix-table"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
      >
        {/* LEFT — sticky labels column */}
        <div className="lui-pricing-matrix-labels">
          <div className="lui-pricing-matrix-cell cell-head cell-label">
            <span>Plan · feature</span>
          </div>
          {matrix.sections.map((s, si) => (
            <Fragment key={s.name + si}>
              <div className="lui-pricing-matrix-cell cell-section cell-label">
                <span>{s.name}</span>
              </div>
              {s.rows.map((row, ri) => (
                <div
                  key={row[0] + ri}
                  className="lui-pricing-matrix-cell cell-row cell-label"
                >
                  <span>{row[0]}</span>
                </div>
              ))}
            </Fragment>
          ))}
          <div className="lui-pricing-matrix-cell cell-cta cell-label">
            <span>Begin · cancel anytime</span>
          </div>
        </div>

        {/* RIGHT — horizontally scrollable tier columns */}
        <div className="lui-pricing-matrix-cols">
          {matrix.tiers.map((t, ti) => (
            <div
              key={t.name + ti}
              className={`lui-pricing-matrix-col${t.featured ? " is-featured" : ""}`}
            >
              <div className="lui-pricing-matrix-cell cell-head">
                {t.featured && !reduce && (
                  <motion.span
                    className="lui-pricing-matrix-top-edge"
                    aria-hidden
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <div className="lui-pricing-matrix-tier-name">{t.name}</div>
                <div className="lui-pricing-matrix-tier-price">
                  {typeof t.price === "number"
                    ? `$${t.price}${t.per ?? ""}`
                    : t.price}
                </div>
              </div>

              {matrix.sections.map((s, si) => (
                <Fragment key={s.name + si}>
                  <div className="lui-pricing-matrix-cell cell-section" />
                  {s.rows.map((row, ri) => (
                    <motion.div
                      key={row[0] + ri}
                      className="lui-pricing-matrix-cell cell-row cell-value"
                      initial={reduce ? false : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={VIEWPORT}
                      transition={{
                        duration: 0.35,
                        delay: 0.18 + (si * s.rows.length + ri) * 0.02,
                        ease: EASE_OUT,
                      }}
                    >
                      <MatrixCellContent
                        value={row[ti + 1]}
                        featured={t.featured}
                      />
                    </motion.div>
                  ))}
                </Fragment>
              ))}

              <div className="lui-pricing-matrix-cell cell-cta cell-value">
                {t.featured ? (
                  <PrimaryButton>Choose {t.name}</PrimaryButton>
                ) : (
                  <SecondaryButton>
                    {typeof t.price === "string" && t.price === "Custom"
                      ? "Contact sales"
                      : `Try ${t.name}`}
                  </SecondaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="lui-pricing-matrix-foot">
        <span>Prices exclude applicable taxes</span>
        <span>All plans include unlimited collaborators on guest accounts</span>
      </div>
    </section>
  );
}

Pricing4.displayName = "Pricing4";
