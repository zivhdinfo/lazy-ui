"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { BorderGlow } from "@/components/lazy-ui/border-glow";
import { SmoothCursor } from "@/components/lazy-ui/smooth-cursor";

import { BrandMark } from "../brand-mark";

import { DiscordIcon } from "./home-icons";

// Closing CTA + site footer for the home surface. Lives inside `.lui-home`, so
// all light/dark tokens cascade in. Reuses the home's shared `.btn`, `.eyebrow`,
// and `.brand` styles. Also gives the page real height below the pinned marquee.

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// Monochrome arc for the GitHub button; Discord brand palette for the Discord one.
const STAR_GLOW = ["var(--glow-1)", "var(--glow-2)", "var(--glow-3)"];
const DISCORD_GLOW = ["#5865f2", "#8c9eff", "#404eed"];

const FOOTER_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Blocks", href: "/blocks" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Changelog", href: "/docs/changelog" },
    ],
  },
];

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function HomeFooter() {
  const reduced = useReducedMotion();
  const reveal = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      };
  const revealTr = { duration: reduced ? 0.2 : 0.8, ease: REVEAL_EASE };

  return (
    <>
      <section className="home-cta" aria-labelledby="cta-title">
        <div className="wrap">
          <motion.div
            className="cta-card-wrap"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-15%" }}
            transition={revealTr}
          >
            {/* Hovering the card shows the smooth-following cursor (confined to
                the card, native cursor hidden). */}
            <SmoothCursor
              color="var(--ink)"
              textColor="var(--ink-text)"
              label="Lazy UI"
              size={26}
              className="cta-cursor"
            >
              <div className="cta-card">
                <div className="cta-card-inner">
                  <h2 id="cta-title" className="cta-title">
                    Build <span className="dim">lazily.</span>
                  </h2>
                  <p className="cta-sub">
                    Copy-paste backgrounds, animation, and UI primitives into your
                    React app as registry files. No package, no lock-in — the
                    source is yours.
                  </p>
                  {/* stopPropagation on pointerdown keeps SmoothCursor from
                      capturing the pointer (which would swallow the click). */}
                  <div className="cta-row" onPointerDown={(e) => e.stopPropagation()}>
                    <Link href="/components" className="btn btn-solid">
                      Browse components
                      <span className="cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                    {/* Star on GitHub — monochrome glow border. */}
                    <BorderGlow
                      mode="auto"
                      colors={STAR_GLOW}
                      background="var(--panel)"
                      radius={10}
                      thickness={1.5}
                      coneSpread={42}
                      glowSize={12}
                      intensity={0.9}
                      speed={0.8}
                      bling={false}
                      className="cta-glow"
                    >
                      <a
                        href="https://github.com/zivhdinfo/lazy-ui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-glow-btn"
                      >
                        <GithubIcon />
                        Star on GitHub
                      </a>
                    </BorderGlow>
                    {/* Join Discord — glow border in the Discord blurple palette. */}
                    <BorderGlow
                      mode="auto"
                      colors={DISCORD_GLOW}
                      background="var(--panel)"
                      radius={10}
                      thickness={1.5}
                      coneSpread={42}
                      glowSize={12}
                      intensity={1}
                      speed={0.9}
                      bling={false}
                      className="cta-glow"
                    >
                      <a
                        href="https://discord.gg/gCqzeefZ8M"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-glow-btn cta-discord"
                      >
                        <DiscordIcon />
                        Join Discord
                      </a>
                    </BorderGlow>
                  </div>
                </div>
              </div>
            </SmoothCursor>
          </motion.div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="brand" aria-label="Lazy UI home">
                <span className="mark">
                  <BrandMark size={26} />
                </span>
                <span>
                  <b>Lazy</b> <span className="z">UI</span>
                </span>
              </Link>
              <p>
                An open-source React component registry. Built by people who got
                tired of building the same modal twice.
              </p>
            </div>
            <div className="footer-cols">
              {FOOTER_COLS.map((col) => (
                <div key={col.title} className="footer-col">
                  <h4>{col.title}</h4>
                  {col.links.map((l) => (
                    <Link key={l.label} href={l.href}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Lazy UI · MIT license</span>
            <span className="footer-credit">
              Made by{" "}
              <a
                href="https://github.com/zivhdinfo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Zivhd
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default HomeFooter;
