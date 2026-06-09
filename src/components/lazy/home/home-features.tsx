"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";

import { BorderGlow } from "@/components/lazy-ui/border-glow";
import { Counter } from "@/components/lazy-ui/counter";
import {
  getPublishedBlocks,
  getPublishedComponentsOnly,
} from "@/registry/components";

// "Why" feature strip — the narrative beat right after the hero. A bento of
// value claims following DESIGN.md §8 (6-col grid, a tall anchor tile carrying
// the strongest claim). Lives inside the `.lui-home` tree, so all light/dark
// tokens cascade in — no theme prop needed. Visualizations are CSS-only to
// avoid stacking another WebGL context on top of the hero's canvases.

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// Monochrome border arc — black/white/gray only, per the home's one-accent rule
// (DESIGN.md §2). Theme-aware tokens (see globals.css): a gray→black gradient on
// light, gray→white on dark. Three stops give the comet its gradient sweep.
const GLOW = ["var(--glow-1)", "var(--glow-2)", "var(--glow-3)"];

export function HomeFeatures() {
  const reduced = useReducedMotion();
  const componentCount = useMemo(() => getPublishedComponentsOnly().length, []);
  const blockCount = useMemo(() => getPublishedBlocks().length, []);

  // Counter animates when its `value` changes — hold at 0 until the tile
  // enters the viewport, then flip to the real total (same trick as the hero).
  const [counted, setCounted] = useState(false);

  // Per-tile fade-up; staggered by index. Reduced motion → render final state.
  const reveal = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-15%" },
          transition: { duration: 0.9, ease: REVEAL_EASE, delay: i * 0.06 },
        };

  // Each bento tile is a BorderGlow whose arc lights toward the pointer — the
  // whole grid responds at once (mode="cursor"). The motion wrapper owns the
  // grid span + reveal; the glow fills it; `tile-inner` carries the resting
  // 1px border so cards stay defined before the cursor lights them.
  const GlowTile = ({
    span,
    inner,
    index,
    onViewportEnter,
    children,
  }: {
    span: string;
    inner?: string;
    index: number;
    onViewportEnter?: () => void;
    children: ReactNode;
  }) => (
    <motion.div
      className={`glow-cell ${span}`}
      {...reveal(index)}
      onViewportEnter={onViewportEnter}
    >
      <BorderGlow
        mode="cursor"
        colors={GLOW}
        background="var(--surface)"
        thickness={2}
        radius={20}
        coneSpread={20}
        glowSize={4}
        intensity={1}
        speed={1}
        cursorRadius={100}
        sparkleCount={15}
        bling={true}
        className="glow-card"
      >
        <div className={`tile-inner${inner ? ` ${inner}` : ""}`}>{children}</div>
      </BorderGlow>
    </motion.div>
  );

  return (
    <section className="features" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <motion.div className="features-head" {...reveal(0)}>
          <span className="eyebrow">
            <span className="dotpulse" />
            Why
          </span>
          <h2 id="why-title" className="features-title">
            Built to feel finished.
          </h2>
          <p className="features-lead">
            Backgrounds, animation, and primitives that drop into your React app
            and look done — without the dependency tax.
          </p>
        </motion.div>

        <div className="bento">
          {/* Anchor — strongest claim, spans two rows. */}
          <GlowTile span="tile--anchor" inner="tile-inner--anchor" index={1}>
            <span className="tile-eyebrow">Source</span>
            <h3 className="tile-title">Own every line.</h3>
            <p className="tile-body">
              Each component installs as a shadcn registry file. The source lands
              in your repo, fully editable — no npm package wrapping it, no
              dependency to fight when you need to change one detail.
            </p>
            <div className="tile-snippet mono" aria-hidden="true">
              <span className="snip-prompt">$</span>
              <span>
                npx shadcn@latest add <span className="snip-em">button</span>
              </span>
            </div>
          </GlowTile>

          {/* Companions — span-3. */}
          <GlowTile span="tile--wide" index={2}>
            <span className="tile-eyebrow">Registry</span>
            <h3 className="tile-title">Install via URL.</h3>
            <p className="tile-body">
              Not on npm. Point <code className="tile-code">npx shadcn add</code>{" "}
              at a registry URL and the files land where they belong.
            </p>
          </GlowTile>

          <GlowTile span="tile--wide" index={3}>
            <span className="tile-eyebrow">Motion</span>
            <h3 className="tile-title">Animated by default.</h3>
            <p className="tile-body">
              Motion-forward out of the box, and reduced-motion aware so it never
              fights the user.
            </p>
            <div className="tile-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </GlowTile>

          {/* Capsules — span-2. */}
          <GlowTile
            span="tile--cap"
            inner="tile-inner--cap"
            index={4}
            onViewportEnter={() => setCounted(true)}
          >
            <div className="tile-stat">
              <Counter
                value={counted ? componentCount : 0}
                effect="fade"
                speed={1000}
              />
            </div>
            <span className="tile-eyebrow">
              Components · {blockCount} blocks
            </span>
          </GlowTile>

          <GlowTile span="tile--cap" inner="tile-inner--cap" index={5}>
            <span className="tile-eyebrow">Quality</span>
            <h3 className="tile-title tile-title--sm">Typed &amp; accessible.</h3>
            <p className="tile-body">
              Keyboard-reachable, with full TypeScript types on every prop.
            </p>
          </GlowTile>

          <GlowTile span="tile--cap" inner="tile-inner--cap" index={6}>
            <div className="tile-stat">MIT</div>
            <span className="tile-eyebrow">Open license · yours to ship</span>
          </GlowTile>
        </div>
      </div>
    </section>
  );
}

export default HomeFeatures;
