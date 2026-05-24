"use client";

import Link from "next/link";

import { getPublishedComponents } from "@/registry/components";

import { Icons } from "./icons";
import { rippleClick } from "./ripple";
import { attachSpotlight, useScrollReveal } from "./use-scroll-reveal";

export function IntroPage(_: { sources: Record<string, string> }) {
  const total = getPublishedComponents().length;
  useScrollReveal();
  const bindSpot = (n: HTMLDivElement | null) => attachSpotlight(n);

  return (
    <main className="main">
      <div className="crumb reveal">
        <span>Docs</span>
        <span className="sep">›</span>
        <span>Get Started</span>
        <span className="sep">›</span>
        <span className="cur">Introduction</span>
      </div>

      <h1 className="page-title reveal">
        Build <em>lazily.</em>
      </h1>
      <p className="page-sub reveal d-1">
        Lazy-ui is an open-source collection of{" "}
        <strong style={{ color: "var(--fg-0)", fontWeight: 600 }}>
          {total} React components
        </strong>{" "}
        built to add visual personality to your projects — WebGL backgrounds,
        text and motion effects, device mocks, and a few focused interactive
        primitives.
      </p>
      <p className="page-sub reveal d-2" style={{ marginTop: 12 }}>
        It is not a generic UI kit. You won&rsquo;t find another button or input
        family here. Lazy-ui exists to help your pages stand out without
        rebuilding the visual heavy lifting from scratch.
      </p>

      <div className="action-row reveal d-3">
        <Link className="lazy-btn primary" href="/docs/installation" onClick={rippleClick}>
          {Icons.arrowRight}
          Install a component
        </Link>
        <Link className="lazy-btn" href="/components" onClick={rippleClick}>
          {Icons.chevrons}
          Browse {total} components
        </Link>
      </div>

      {/* Mission */}
      <section className="block reveal">
        <h2 className="block-title">Mission</h2>
        <p className="block-sub">
          Ship visually striking React components that you can own, customize,
          and adopt one at a time.
        </p>

        <div className="bento">
          <div className="tile span-3 reveal d-1" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Free for everyone
            </div>
            <h3 className="tile-h">You own the code.</h3>
            <p className="tile-p">
              Source files land in your repo under{" "}
              <code className="inline-code">components/lazy-ui</code>. Modify,
              rename, or extend without waiting on a package release.
            </p>
          </div>

          <div className="tile span-3 reveal d-2" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Prop-first
            </div>
            <h3 className="tile-h">Tune through props.</h3>
            <p className="tile-p">
              Every component exposes the knobs that matter — palette, speed,
              intensity, easing — so most adjustments never need a code dive.
            </p>
          </div>

          <div className="tile span-3 reveal d-3" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Fully modular
            </div>
            <h3 className="tile-h">No bundle, no lock-in.</h3>
            <p className="tile-p">
              Lazy-ui isn&rsquo;t on npm. Pull only the components you need via
              the shadcn CLI — no transitive deps, no unused code shipped.
            </p>
          </div>

          <div className="tile span-3 reveal d-4" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Bring your own design
            </div>
            <h3 className="tile-h">Themable by default.</h3>
            <p className="tile-p">
              The default surface is dark, but every component is built on
              Tailwind and exposed props — swap colors, easing, or type to
              match the design system you already have.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="block reveal">
        <h2 className="block-title">Performance</h2>
        <p className="block-sub">
          Most Lazy-ui pieces are GPU-accelerated WebGL or motion effects.
          A few things to keep in mind when you wire them in.
        </p>

        <div className="bento">
          <div className="tile span-2 reveal d-1" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Less is more
            </div>
            <h3 className="tile-h">One or two per page.</h3>
            <p className="tile-p">
              Stacking multiple WebGL surfaces on a single screen will compete
              for the GPU and dilute the visual focus. Pick the hero piece;
              keep the rest static.
            </p>
          </div>

          <div className="tile span-2 reveal d-2" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Mobile
            </div>
            <h3 className="tile-h">Downgrade gracefully.</h3>
            <p className="tile-p">
              On smaller viewports or older devices, swap heavy effects for a
              static fallback. Image posters and CSS gradients carry most of
              the visual weight at a fraction of the cost.
            </p>
          </div>

          <div className="tile span-2 reveal d-3" ref={bindSpot}>
            <div className="tile-eyebrow">
              <span className="dot" />
              Reduced motion
            </div>
            <h3 className="tile-h">Respect the preference.</h3>
            <p className="tile-p">
              Components honor{" "}
              <code className="inline-code">prefers-reduced-motion</code> and
              short-circuit decorative loops. Verify on a real device before
              shipping.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
