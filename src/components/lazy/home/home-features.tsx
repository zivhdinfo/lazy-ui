"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// Bento entrance — the ai-saas ImageReveal vocabulary: each tile is scrubbed to
// the scroll position (not a one-shot whileInView), so it resolves buttery-
// smooth as it travels through the viewport. Tiles pull IN from the two sides:
// direction is decided by the tile's real position — anything whose centre sits
// left of the grid midline flies in from the left edge, the rest from the right.
// `REVEAL_PULL` is how far (% of the tile's own width) it starts off to its side.
const REVEAL_PULL = 90;
const REVEAL_FROM_BASE = { scale: 0.88, filter: "blur(16px)", opacity: 0 } as const;

// Heading entrance — same blur fade-up vocabulary as the tiles and the hero,
// staggered line by line (eyebrow → title → lead).
const HEAD_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

// Monochrome border arc — black/white/gray only, per the home's one-accent rule
// (DESIGN.md §2). Theme-aware tokens (see globals.css): a gray→black gradient on
// light, gray→white on dark. Three stops give the comet its gradient sweep.
const GLOW = ["var(--glow-1)", "var(--glow-2)", "var(--glow-3)"];

// Each bento tile is a BorderGlow whose arc lights toward the pointer — the
// whole grid responds at once (mode="cursor"). The `glow-cell` owns the grid
// span + the GSAP scrub transform; the glow fills it; `tile-inner` carries the
// resting 1px border (and the hover lift, so it never fights GSAP's transform).
function GlowTile({
  span,
  inner,
  count,
  children,
}: {
  span: string;
  inner?: string;
  count?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`glow-cell ${span}${count ? " glow-cell--count" : ""}`}>
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
    </div>
  );
}

export function HomeFeatures() {
  const reduced = useReducedMotion();
  const componentCount = useMemo(() => getPublishedComponentsOnly().length, []);
  const blockCount = useMemo(() => getPublishedBlocks().length, []);

  // Counter animates when its `value` changes — hold at 0 until the tile
  // enters the viewport, then flip to the real total (same trick as the hero).
  const [counted, setCounted] = useState(false);

  // Heading reveal — a blur fade-up cascade (eyebrow → title → lead), the same
  // vocabulary as the hero and the tiles. Reduced motion → plain opacity.
  const headItem = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      };
  const headItemTransition = { duration: reduced ? 0.2 : 0.8, ease: REVEAL_EASE };

  // GSAP scrub reveal — each `.glow-cell` is tied to its own scroll travel
  // (ImageReveal mechanism). Lives in a gsap.context so every tween + trigger
  // is reverted on unmount. Reduced motion skips it entirely (tiles render at
  // rest). The counter tile flips `counted` from its own trigger's onEnter.
  const bentoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) {
      // Reduced motion: no scrub, so show the real counts immediately (one-shot).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCounted(true);
      return;
    }
    const root = bentoRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray<HTMLElement>(".glow-cell", root);
      const rootRect = root.getBoundingClientRect();
      const midX = rootRect.left + rootRect.width / 2;
      cells.forEach((cell) => {
        const r = cell.getBoundingClientRect();
        const fromLeft = r.left + r.width / 2 < midX;
        gsap.fromTo(
          cell,
          {
            ...REVEAL_FROM_BASE,
            xPercent: fromLeft ? -REVEAL_PULL : REVEAL_PULL,
            transformOrigin: fromLeft ? "0% 50%" : "100% 50%",
            willChange: "transform, filter",
          },
          {
            xPercent: 0,
            scale: 1,
            filter: "blur(0px)",
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: cell,
              start: "clamp(top bottom)",
              end: "clamp(top 45%)",
              scrub: true,
            },
          },
        );
      });

      const countCell = root.querySelector<HTMLElement>(".glow-cell--count");
      if (countCell) {
        ScrollTrigger.create({
          trigger: countCell,
          start: "top 85%",
          onEnter: () => setCounted(true),
        });
      }
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="features" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <motion.div
          className="features-head"
          variants={HEAD_STAGGER}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-15%" }}
        >
          <motion.span
            className="eyebrow"
            variants={headItem}
            transition={headItemTransition}
          >
            <span className="dotpulse" />
            Why
          </motion.span>
          <motion.h2
            id="why-title"
            className="features-title"
            variants={headItem}
            transition={headItemTransition}
          >
            Built to feel finished.
          </motion.h2>
          <motion.p
            className="features-lead"
            variants={headItem}
            transition={headItemTransition}
          >
            Backgrounds, animation, and primitives that drop into your React
            app and look done — without the dependency tax.
          </motion.p>
        </motion.div>

        <div className="bento" ref={bentoRef}>
          {/* Anchor — strongest claim, spans two rows. */}
          <GlowTile span="tile--anchor" inner="tile-inner--anchor">
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
                npx shadcn@latest add <span className="snip-em">2lazyui.com/r/pixel-cursor.json</span>
              </span>
            </div>
          </GlowTile>

          {/* Companions — span-3. */}
          <GlowTile span="tile--wide">
            <span className="tile-eyebrow">Registry</span>
            <h3 className="tile-title">Install via URL.</h3>
            <p className="tile-body">
              Not on npm. Point <code className="tile-code">npx shadcn add</code>{" "}
              at a registry URL and the files land where they belong.
            </p>
          </GlowTile>

          <GlowTile span="tile--wide">
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
          <GlowTile span="tile--cap" inner="tile-inner--cap" count>
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

          <GlowTile span="tile--cap" inner="tile-inner--cap">
            <span className="tile-eyebrow">Quality</span>
            <h3 className="tile-title tile-title--sm">Typed &amp; accessible.</h3>
            <p className="tile-body">
              Keyboard-reachable, with full TypeScript types on every prop.
            </p>
          </GlowTile>

          <GlowTile span="tile--cap" inner="tile-inner--cap">
            <div className="tile-stat">MIT</div>
            <span className="tile-eyebrow">Open license · yours to ship</span>
          </GlowTile>
        </div>
      </div>
    </section>
  );
}

export default HomeFeatures;
