"use client";

import Link from "next/link";

import { componentHref } from "@/registry/categories";
import { getPublishedComponentsOnly } from "@/registry/components";

import { Icons } from "./icons";
import { rippleClick } from "./ripple";
import { useScrollReveal } from "./use-scroll-reveal";

export function IntroPage() {
  // Component-only — blocks live under /blocks and are counted separately.
  const components = getPublishedComponentsOnly();
  const total = components.length;
  // No standalone overview page anymore — open the first component's detail
  // page so the CTA still lands on something real (the sidebar lists the rest).
  const firstComponentHref = componentHref(components[0]);
  useScrollReveal();

  return (
    <main className="main">
      <h1 className="page-title reveal">
        Build <em>lazily.</em>
      </h1>
      <p className="page-sub reveal d-1">
        You own every file. All{" "}
        <strong style={{ color: "var(--fg-0)", fontWeight: 600 }}>
          {total} React and Tailwind components
        </strong>{" "}
        — WebGL backgrounds, text and motion effects, device mocks, and a few
        interactive primitives — install as shadcn registry files that land in
        your repo, fully editable. Not an import. Source you keep.
      </p>

      <div className="action-row reveal d-2">
        <Link className="lazy-btn" href="/get-started/installation" onClick={rippleClick}>
          {Icons.arrowRight}
          Install a component
        </Link>
        <Link className="lazy-btn" href={firstComponentHref} onClick={rippleClick}>
          {Icons.chevrons}
          Browse {total} components
        </Link>
      </div>

      {/* Mission */}
      <section className="block reveal">
        <h2 className="block-title">Mission</h2>
        <p className="block-sub">
          You own the source from the first install. Striking components you
          drop in one at a time, tune through props, and rewrite whenever the
          design needs it.
        </p>

        <div className="doc-section-list">
          <article className="doc-section reveal d-1">
            <div>
              <span className="doc-section-index">01</span>
              <h3>You own the code.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Source lands in your repo under{" "}
                <code className="inline-code">components/lazy-ui</code>. Edit it,
                rename it, extend it — no package release to wait on, no version
                to bump.
              </p>
            </div>
          </article>

          <article className="doc-section reveal d-2">
            <div>
              <span className="doc-section-index">02</span>
              <h3>Tune through props.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Palette, speed, intensity, easing — the knobs that matter are
                props. Most adjustments never need a code dive.
              </p>
            </div>
          </article>

          <article className="doc-section reveal d-3">
            <div>
              <span className="doc-section-index">03</span>
              <h3>No bundle, no lock-in.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Not on npm. Pull only what you need via shadcn registry URLs —
                no transitive deps, no unused code in your bundle.
              </p>
            </div>
          </article>

          <article className="doc-section reveal d-4">
            <div>
              <span className="doc-section-index">04</span>
              <h3>Themable by default.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Dark by default, but it&rsquo;s all Tailwind and props
                underneath. Swap colors, easing, or type to match the design
                system you already run.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Performance */}
      <section className="block reveal">
        <h2 className="block-title">Performance</h2>
        <p className="block-sub">
          You own the source, so you control the cost. These are
          GPU-accelerated WebGL and motion effects — a few things to keep in
          mind when you wire them in.
        </p>

        <div className="doc-section-list">
          <article className="doc-section reveal d-1">
            <div>
              <span className="doc-section-index">01</span>
              <h3>One or two per page.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Stack several WebGL surfaces on one screen and they fight for
                the GPU and split the focus. Pick the hero piece. Keep the rest
                static.
              </p>
            </div>
          </article>

          <article className="doc-section reveal d-2">
            <div>
              <span className="doc-section-index">02</span>
              <h3>Downgrade gracefully.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                On smaller or older devices, swap heavy effects for a static
                fallback. A poster image or CSS gradient carries most of the
                look at a fraction of the cost.
              </p>
            </div>
          </article>

          <article className="doc-section reveal d-3">
            <div>
              <span className="doc-section-index">03</span>
              <h3>Respect the preference.</h3>
            </div>
            <div className="doc-section-body">
              <p>
                Every component honors{" "}
                <code className="inline-code">prefers-reduced-motion</code> and
                short-circuits decorative loops. Test on a real device before
                you ship.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
