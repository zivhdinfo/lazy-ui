"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";

import { CopyButton } from "@/components/lazy-ui/copy-button";
import type { ComponentItem } from "@/registry/components";

import { BrandMark } from "./brand-mark";
import { installCmd, PM_TABS, type PmTab } from "./component-detail/install";
import { STAGE_MIN_HEIGHT } from "./component-detail/stage";
import { Icons } from "./icons";
import { ResponsivePreviewFrame } from "./responsive-preview";
import { useScrollReveal } from "./use-scroll-reveal";

/** Runner command shown on each install-picker tab. */
const PM_RUNNER_LABEL: Record<PmTab, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  bun: "bunx",
  yarn: "yarn dlx",
};

/**
 * Each pricing block is loaded via `next/dynamic` so its module + the
 * pricing-shared styles aren't pulled into the gallery's initial bundle.
 * The chunks are fetched the first time their card mounts (via LazyMount).
 */
const PREVIEW_FOR: Record<string, ComponentType> = {
  "pricing-1": dynamic(
    () => import("@/components/lazy-ui/blocks/pricing-1").then((m) => m.Pricing1),
    { ssr: false, loading: () => <PreviewSkeleton /> },
  ),
  "pricing-2": dynamic(
    () => import("@/components/lazy-ui/blocks/pricing-2").then((m) => m.Pricing2),
    { ssr: false, loading: () => <PreviewSkeleton /> },
  ),
  "pricing-3": dynamic(
    () => import("@/components/lazy-ui/blocks/pricing-3").then((m) => m.Pricing3),
    { ssr: false, loading: () => <PreviewSkeleton /> },
  ),
  "pricing-4": dynamic(
    () => import("@/components/lazy-ui/blocks/pricing-4").then((m) => m.Pricing4),
    { ssr: false, loading: () => <PreviewSkeleton /> },
  ),
  "pricing-5": dynamic(
    () => import("@/components/lazy-ui/blocks/pricing-5").then((m) => m.Pricing5),
    { ssr: false, loading: () => <PreviewSkeleton /> },
  ),
};

/** Caps the preview frame so a tall block doesn't dominate the gallery. */
const GALLERY_MAX_HEIGHT = 680;
/** Reserved height per card (for `content-visibility: auto` intrinsic size). */
const GALLERY_RESERVED_HEIGHT = 760;
/** Minimum time the loading state is visible after the card intersects. */
const LOADING_MIN_MS = 1000;

function PreviewSkeleton() {
  return (
    <div className="blocks-gallery-skeleton" role="status" aria-live="polite">
      <div className="blocks-gallery-skeleton-inner">
        <div className="blocks-gallery-skeleton-logo-wrap">
          <span className="blocks-gallery-skeleton-halo" aria-hidden />
          <span className="blocks-gallery-skeleton-ring" aria-hidden />
          <span className="blocks-gallery-skeleton-logo">
            <BrandMark size={72} />
          </span>
        </div>
        <div className="blocks-gallery-skeleton-text">
          <span>Loading preview</span>
          <span className="blocks-gallery-skeleton-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </div>
        <div className="blocks-gallery-skeleton-bar" aria-hidden>
          <div className="blocks-gallery-skeleton-bar-fill" />
        </div>
      </div>
    </div>
  );
}

type Category = {
  id: string;
  label: string;
};

function deriveCategories(items: ComponentItem[]): Category[] {
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const item of items) {
    if (seen.has(item.category)) continue;
    seen.add(item.category);
    const short = item.category.replace(/^Blocks\s*·\s*/i, "");
    out.push({ id: item.category, label: short });
  }
  return out;
}

export function BlocksGallery({ items }: { items: ComponentItem[] }) {
  useScrollReveal();

  const categories = useMemo(() => deriveCategories(items), [items]);
  const [activeCat, setActiveCat] = useState<string>(
    categories[0]?.id ?? "Blocks · Pricing",
  );

  const filtered = useMemo(
    () => items.filter((i) => i.category === activeCat),
    [items, activeCat],
  );

  return (
    <main className="main blocks-gallery">
      <div className="crumb reveal">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <span className="cur">Blocks</span>
      </div>

      <h1
        className="page-title reveal"
        style={{ fontSize: 56, textAlign: "left", lineHeight: 1.04 }}
      >
        Building blocks{" "}
        <em style={{ color: "var(--fg-2)", fontStyle: "italic" }}>
          for the Web
        </em>
      </h1>
      <p
        className="page-sub reveal d-1"
        style={{ maxWidth: "62ch", marginLeft: 0 }}
      >
        Clean, modern building blocks. Copy and paste into your apps. Works with
        all React frameworks. Open Source. Free forever.
      </p>

      <div
        className="reveal d-2"
        style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}
      >
        <a
          href="#blocks-list"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "var(--silver-grad)",
            color: "var(--ink-text)",
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.08), 0 6px 18px -6px rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.5)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Browse Blocks
          <span style={{ width: 12, height: 12, display: "inline-flex" }}>
            {Icons.arrowRight}
          </span>
        </a>
        <Link
          href="/get-started"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid var(--line-2)",
            color: "var(--fg-1)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          View Components
        </Link>
      </div>

      <div
        id="blocks-list"
        className="reveal d-3 blocks-gallery-tabs"
      >
        <nav
          role="tablist"
          aria-label="Block categories"
          className="blocks-gallery-tabs-nav"
        >
          {categories.map((c) => {
            const active = c.id === activeCat;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCat(c.id)}
                className={`blocks-gallery-tab${active ? " is-active" : ""}`}
              >
                {c.label}
              </button>
            );
          })}
        </nav>
        <span className="blocks-gallery-tabs-count">
          {filtered.length} block{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <section
        className="block reveal d-4"
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {filtered.map((b, i) => (
          <BlockCard key={b.slug} block={b} index={i} />
        ))}
      </section>
    </main>
  );
}

function BlockCard({ block, index }: { block: ComponentItem; index: number }) {
  const Preview = PREVIEW_FOR[block.slug];
  const [pm, setPm] = useState<PmTab>("npm");
  const cmd = installCmd(pm, block.slug);
  const detailHref = `/blocks/${block.slug}`;
  // Cap stage height: gallery cards never grow taller than GALLERY_MAX_HEIGHT.
  // STAGE_MIN_HEIGHT is reused as the floor when the block content is short.
  const baseMin = STAGE_MIN_HEIGHT[block.slug] ?? 560;
  const minHeight = Math.min(baseMin, GALLERY_MAX_HEIGHT);

  // Lazy mount the preview until the card scrolls within 300px of viewport.
  // After intersection, hold the skeleton for at least LOADING_MIN_MS so the
  // user always perceives a clear loading state (no flash of late content).
  //
  // `mounted` starts `false` on both server and first client render to avoid
  // an SSR/CSR hydration mismatch — the no-IntersectionObserver fallback
  // lives inside the effect, so it doesn't fire until after hydration.
  const cardRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    // Browsers without IntersectionObserver: still honor the 1s loading window.
    if (typeof IntersectionObserver === "undefined") {
      const fallbackTimer = window.setTimeout(
        () => setMounted(true),
        LOADING_MIN_MS,
      );
      return () => clearTimeout(fallbackTimer);
    }

    const el = cardRef.current;
    if (!el) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          timer = window.setTimeout(() => setMounted(true), LOADING_MIN_MS);
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [mounted]);

  return (
    <article
      ref={cardRef}
      className={`blocks-gallery-card reveal d-${(index % 5) + 1}`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `auto ${GALLERY_RESERVED_HEIGHT}px`,
      }}
    >
      <ResponsivePreviewFrame
        minHeight={minHeight}
        maxHeight={GALLERY_MAX_HEIGHT}
        toolbarLeft={
          <>
            <span className="blocks-gallery-card-slug" title={block.slug}>
              {block.slug}
            </span>
            <span className="blocks-gallery-card-title">{block.title}</span>
            <span
              className="blocks-gallery-card-install"
              role="group"
              aria-label="Install with"
            >
              <span className="blocks-gallery-card-install-label">
                Install with
              </span>
              {PM_TABS.map((t) => {
                const active = pm === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPm(t)}
                    aria-pressed={active}
                    title={installCmd(t, block.slug)}
                    className={`blocks-gallery-card-install-tab${active ? " is-active" : ""}`}
                  >
                    {PM_RUNNER_LABEL[t]}
                  </button>
                );
              })}
            </span>
            <CopyButton
              content={cmd}
              text={false}
              textAs="tooltip"
              label={`Copy ${PM_RUNNER_LABEL[pm]} install command`}
              iconAnimate="draw"
              className="blocks-gallery-card-copy"
            />
          </>
        }
        toolbarRight={
          <Link href={detailHref} className="blocks-gallery-card-open">
            Open
            <span style={{ width: 11, height: 11, display: "inline-flex" }}>
              {Icons.arrowRight}
            </span>
          </Link>
        }
      >
        {mounted && Preview ? <Preview /> : <PreviewSkeleton />}
      </ResponsivePreviewFrame>
    </article>
  );
}
