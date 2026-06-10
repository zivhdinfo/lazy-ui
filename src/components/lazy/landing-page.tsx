"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useMemo, type CSSProperties, type ReactNode } from "react";

import { LiquidChrome } from "@/components/lazy-ui/liquid-chrome";
import { LiquidReveal } from "@/components/lazy-ui/liquid-reveal";
import { OrbitMesh } from "@/components/lazy-ui/orbit-mesh";
import { WaveCipher } from "@/components/lazy-ui/wave-cipher";
import { ShinyText } from "@/components/lazy-ui/text-animate/shiny-text";
import { componentHref } from "@/registry/categories";
import {
  getPublishedBlocks,
  getPublishedComponentsOnly,
} from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button/github-stars-button";

import { BrandMark } from "./brand-mark";
import {
  LpReveal,
  lpRevealAnimate,
  lpRevealInitial,
  lpRevealTransition,
  lpRevealViewport,
} from "./lp-reveal";
import { NEW_SLUGS } from "./sidebar";

export function LandingPage() {
  const components = useMemo(() => getPublishedComponentsOnly(), []);
  const blocks = useMemo(() => getPublishedBlocks(), []);
  // Preserve `NEW_SLUGS` insertion order (latest-first) so the hero pill
  // surfaces the most recent component as the headline name.
  const newComponents = useMemo(() => {
    const bySlug = new Map(components.map((c) => [c.slug, c]));
    const out: ComponentItem[] = [];
    for (const slug of NEW_SLUGS) {
      const c = bySlug.get(slug);
      if (c) out.push(c);
    }
    return out;
  }, [components]);

  return (
    <div className="lp">
      <Hero
        componentCount={components.length}
        blockCount={blocks.length}
        newComponents={newComponents}
      />
      <div className="lp-cipher-zone">
        <ComponentsSection components={components} />
        <BlocksSection blocks={blocks} />
        <LPFooter />
      </div>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────

function Hero({
  componentCount,
  blockCount,
  newComponents,
}: {
  componentCount: number;
  blockCount: number;
  newComponents: ComponentItem[];
}) {
  const reduced = useReducedMotion();
  // Scroll-driven parallax for the hero background. Slower drift + scale +
  // fade creates depth as the user moves past the fold without competing
  // with the section title.
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, -100]);
  const bgScale = useTransform(scrollY, [0, 700], [1, 1.06]);
  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0.25]);
  const copyY = useTransform(scrollY, [0, 500], [0, 60]);
  const copyOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);

  const parallaxStyle = reduced
    ? undefined
    : { y: bgY, scale: bgScale, opacity: bgOpacity };
  const copyStyle = reduced ? undefined : { y: copyY, opacity: copyOpacity };

  return (
    <section className="lp-section lp-hero" id="top">
      <motion.div
        className="lp-hero-bg"
        aria-hidden="true"
        style={parallaxStyle}
      >
        <OrbitMesh
          effect="wave"
          speed={0.09}
          scale={0.5}
          colorLayers={3}
          spiralArms={5}
          waveIntensity={0.22}
          spiralIntensity={1.8}
          lineThickness={0.13}
          falloff={1.65}
          brightness={2.4}
          colorTint="#ef1212ff"
          className="lp-hero-canvas"
        />
        <div className="lp-hero-edge-fade" />
        <div className="lp-hero-fade" />
      </motion.div>
      <motion.div className="lp-shell lp-hero-center" style={copyStyle}>
        <LpReveal className="lp-hero-copy">
          <div className="lp-eyebrow">
            <span className="lp-dot" />
            <span>Backgrounds · Components · Registry files</span>
          </div>
          <h1 className="lp-hero-title">
            React components for{" "}
            <br />
            lazy <em>builders</em>.
          </h1>
          <p className="lp-hero-sub">
            Highly customizable backgrounds, animations, and UI primitives that
            drop into your React project as shadcn registry files and make it
            feel finished immediately.
          </p>
          <div className="lp-hero-ctas">
            <Link className="lp-btn lp-btn--primary" href="/components">
              Browse components
              <span className="lp-arrow">→</span>
            </Link>
            {newComponents.length > 0 && (() => {
              // Always headline the single newest component. Anything beyond
              // it rolls into a `+N` chip so the pill never balloons past its
              // `max-width` (and stays scannable at a glance).
              const visibleNames =
                newComponents.length > 1
                  ? newComponents.slice(0, 1)
                  : newComponents;
              const hiddenCount = newComponents.length - visibleNames.length;
              return (
                <Link
                  href="/components?tab=new"
                  className="lp-new-pill"
                  aria-label={`${newComponents.length} new component${
                    newComponents.length === 1 ? "" : "s"
                  }: ${newComponents.map((c) => c.title).join(", ")}`}
                >
                  <span className="lp-new-pill-badge">
                    New component{newComponents.length === 1 ? "" : "s"}
                  </span>
                  <span className="lp-new-pill-names">
                    {visibleNames.map((c) => c.title).join(" · ")}
                  </span>
                  {hiddenCount > 0 && (
                    <span className="lp-new-pill-more" aria-hidden>
                      +{hiddenCount}
                    </span>
                  )}
                </Link>
              );
            })()}
            <GithubStarsButton
              username="zivhdinfo"
              repo="lazy-ui"
              label="Star on GitHub"
              variant="ghost"
              className="lp-btn lp-btn--ghost"
            />
          </div>
          <div className="lp-hero-meta">
            <span className="lp-mono">npx shadcn@latest add</span>
            <span className="lp-sep" />
            <span>
              {componentCount} components &middot; {blockCount} blocks live
            </span>
            <span className="lp-sep" />
            <span>Backgrounds, text, forms, and effects</span>
          </div>
        </LpReveal>
      </motion.div>

      <LpReveal className="lp-shell" delay={0.2}>
        <Stats componentCount={componentCount} blockCount={blockCount} />
      </LpReveal>
    </section>
  );
}

function Stats({
  componentCount,
  blockCount,
}: {
  componentCount: number;
  blockCount: number;
}) {
  return (
    <div className="lp-stats">
      <div className="lp-stat">
        <div className="lp-stat-num">
          {componentCount}
          <span className="lp-stat-unit">/component</span>
        </div>
        <div className="lp-stat-label">Components</div>
      </div>
      <div className="lp-stat">
        <div className="lp-stat-num">
          {blockCount}
          <span className="lp-stat-unit">/block</span>
        </div>
        <div className="lp-stat-label">Blocks</div>
        <div className="lp-stat-soon">Pricing live · hero next</div>
      </div>
      <div className="lp-stat">
        <div className="lp-stat-num">
          <em>—</em>
        </div>
        <div className="lp-stat-label">Templates</div>
        <div className="lp-stat-soon">Q4 · 2026</div>
      </div>
      <div className="lp-stat">
        <div className="lp-stat-num">MIT</div>
        <div className="lp-stat-label">License</div>
      </div>
    </div>
  );
}

// ─── Components section ────────────────────────────────────────────────

function ComponentsSection({ components }: { components: ComponentItem[] }) {
  return (
    <section className="lp-section" id="components">
      <div className="lp-shell">
        <LpReveal className="lp-sec-head">
          <div className="lp-sec-head-copy">
            <div className="lp-eyebrow">
              <span className="lp-num">01 /</span>
              <span>Components — Available now</span>
            </div>
            <h2 className="lp-sec-title">
              {components.length} primitives.
              <br />
              <em>Copy via URL, ship.</em>
            </h2>
            <p className="lp-sec-sub">
              Accessible, typed React components and motion-forward backgrounds.
              Lazy-ui isn&rsquo;t on npm — each component lives at a registry URL
              you point{" "}
              <code className="lp-inline-code">npx shadcn@latest add</code> at.
              The source lands directly in your project, fully editable.
            </p>
          </div>
          <div className="lp-sec-head-aside">
            <Link className="lp-btn lp-btn--ghost lp-btn--sm" href="/get-started">
              Read docs
            </Link>
            <Link className="lp-btn lp-btn--primary lp-btn--sm" href="/components">
              Browse all {components.length} →
            </Link>
          </div>
        </LpReveal>

        <LpReveal delay={0.08}>
          <Bento components={components} />
        </LpReveal>

        <LpReveal className="lp-cloud" delay={0.12}>
          <div className="lp-cloud-head">
            <div>
              <div className="lp-cloud-title">All {components.length} components</div>
              <div className="lp-cloud-sub">
                Every primitive is keyboard-accessible and ships with TypeScript types.
              </div>
            </div>
            <div className="lp-cloud-status">
              <span className="lp-dot" />
              Stable
            </div>
          </div>
          <div className="lp-cloud-chips">
            {components.map((c) => (
              <Link key={c.slug} href={componentHref(c)} className="lp-chip">
                <span className="lp-dot" />
                {c.title}
              </Link>
            ))}
          </div>
        </LpReveal>
      </div>
    </section>
  );
}

// ─── Bento ────────────────────────────────────────────────────────────

// Three flagship visuals laid out as a 2-column × 4-row mosaic:
// left column stacks two square-ish cards, right column is a single
// tall card spanning the full height.
const BENTO_CELLS: ReadonlyArray<{
  slug: string;
  col: string;
  row: string;
  render: () => ReactNode;
}> = [
    {
      slug: "liquid-chrome",
      col: "1",
      row: "1 / span 2",
      render: () => (
        <LiquidChrome
          palette="nightfire"
          speed={0.45}
          scale={0.8}
          warp={0.45}
          relief={0.85}
          tilt={45}
          highlight={1.4}
          roughness={0.58}
          ambient={0.28}
          mouseInfluence={0.22}
          className="lp-cell-canvas"
        />
      ),
    },
    {
      slug: "liquid-reveal",
      col: "1",
      row: "3 / span 2",
      render: () => (
        <LiquidReveal
          frontImage="/images/armor.png"
          backImage="/images/human.png"
          cursorSize={100}
          mouseForce={55}
          resolution={0.5}
          viscous={42}
          revealStrength={1}
          revealSoftness={0.85}
          autoDemo
          autoSpeed={0.55}
          className="lp-cell-canvas"
        />
      ),
    },
    {
      slug: "wave-cipher",
      col: "2",
      row: "1 / span 4",
      render: () => (
        <WaveCipher
          columns={3}
          invertColumns
          bandWidth={0.6}
          characters="0123456789ABCDEF"
          color="#d4d4d4"
          speed={0.85}
          size={14}
          noisePower={2}
          glyphChurn={0.6}
          opacity={1}
          className="lp-cell-canvas"
        />
      ),
    },
  ];

function Bento({ components }: { components: ComponentItem[] }) {
  const reduced = useReducedMotion();
  const bySlug = new Map(components.map((c) => [c.slug, c]));
  return (
    <div className="lp-bento">
      {BENTO_CELLS.map(({ slug, col, row, render }, i) => {
        const item = bySlug.get(slug);
        if (!item) return null;
        const cellStyle: CSSProperties = { gridColumn: col, gridRow: row };
        const motionProps = reduced
          ? {}
          : {
              initial: lpRevealInitial,
              whileInView: lpRevealAnimate,
              viewport: lpRevealViewport,
              transition: lpRevealTransition(i * 0.08),
            };
        return (
          <motion.article
            key={slug}
            className="lp-cell"
            style={cellStyle}
            {...motionProps}
          >
            <div className="lp-cell-head">
              <div className="lp-cell-name">{item.title}</div>
              <Link
                href={componentHref(item)}
                className="lp-cell-open"
                aria-label={`Open ${item.title}`}
              >
                /{slug}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="lp-cell-body">{render()}</div>
          </motion.article>
        );
      })}
    </div>
  );
}

// ─── Blocks section ────────────────────────────────────────────────────

function BlocksSection({ blocks }: { blocks: ComponentItem[] }) {
  return (
    <section className="lp-section" id="blocks">
      <div className="lp-shell">
        <LpReveal className="lp-sec-head">
          <div className="lp-sec-head-copy">
            <div className="lp-eyebrow">
              <span className="lp-num">02 /</span>
              <span>Blocks</span>
            </div>
            <h2 className="lp-sec-title">
              Page sections,
              <br />
              <em>drop-in ready.</em>
            </h2>
            <p className="lp-sec-sub">
              Pre-composed sections that ship as registry files — same install
              path as every component. Override props, swap primitives, deploy.
            </p>
          </div>
          <div className="lp-sec-head-aside">
            <Link className="lp-btn lp-btn--ghost lp-btn--sm" href="/get-started/installation">
              How to install
            </Link>
            <Link className="lp-btn lp-btn--primary lp-btn--sm" href="/blocks">
              Browse all {blocks.length} →
            </Link>
          </div>
        </LpReveal>

        <LpReveal className="lp-cloud" delay={0.1}>
          <div className="lp-cloud-head">
            <div>
              <div className="lp-cloud-title">{blocks.length} blocks live</div>
              <div className="lp-cloud-sub">
                Pricing layouts available today. Hero strips, feature grids,
                and footer sections shipping next.
              </div>
            </div>
            <div className="lp-cloud-status">
              <span className="lp-dot" />
              Shipping
            </div>
          </div>
          <div className="lp-cloud-chips">
            {blocks.map((b) => (
              <Link key={b.slug} href={`/blocks/${b.slug}`} className="lp-chip">
                <span className="lp-dot" />
                {b.title}
              </Link>
            ))}
          </div>
        </LpReveal>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────

function LPFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Link href="/" className="lp-brand">
              <BrandMark size={32} />
              <span className="lp-brand-name">
                Lazy<em>-ui</em>
              </span>
            </Link>
            <p>
              An open-source React component registry. Built by humans who got
              tired of building the same modal twice.
            </p>
          </div>
          <FooterCol
            title="Library"
            items={[
              { label: "Components", href: "/components" },
              { label: "Blocks", href: "/blocks" },
            ]}
          />
          <FooterCol
            title="Docs"
            items={[
              { label: "Introduction", href: "/get-started" },
              { label: "Installation", href: "/get-started/installation" },
              { label: "Changelog", href: "/get-started/changelog" },
            ]}
          />
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 Lazy-ui · MIT license</span>
          <span className="lp-footer-status">
            <span className="lp-footer-ok">
              Made by{" "}
              <a
                href="https://github.com/zivhdinfo"
                rel="noopener noreferrer"
                target="_blank"
                className="lp-footer-credit-link"
              >
                <ShinyText duration={6} variant="beam">
                  Zivhd
                </ShinyText>
              </a>{" "}
              — hope you enjoy it.
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="lp-footer-col">
      <h4>{title}</h4>
      {items.map((it) =>
        it.href.startsWith("http") ? (
          <a key={it.label} href={it.href} rel="noopener noreferrer" target="_blank">
            {it.label}
          </a>
        ) : (
          <Link key={it.label} href={it.href}>
            {it.label}
          </Link>
        ),
      )}
    </div>
  );
}

