"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";

import { CATEGORY_TO_TYPE, componentHref } from "@/registry/categories";
import { getPublishedComponentsOnly, type ComponentItem } from "@/registry/components";

import { initialValues, type CustomizeValues } from "./customize";
import { viewFor } from "./component-view/registry";
import type { ComponentView } from "./component-view/types";
import { previewVideoFitFor, previewVideoFor } from "./preview-videos";
import { NEW_SLUGS } from "./sidebar";
import { useScrollReveal } from "./use-scroll-reveal";

// CATEGORY_TO_TYPE key order is the canonical sidebar order; used as the
// tie-breaker when two categories have the same component count.
const CATEGORY_ORDER = Object.keys(CATEGORY_TO_TYPE);

// Components mounted "bare" — the raw export filling a 16:9 box with no
// children — so their baked-in demo copy ("Build lazily." overlays, HeroOverlay
// chrome) never shows and the visual is sized to the card instead of cropped
// from a 480px stage. Backgrounds are all surface components; matrix-grid is an
// Animate canvas that reads the same way.
const BARE_PREVIEW_SLUGS = new Set<string>(["matrix-grid"]);
function isBarePreview(item: ComponentItem): boolean {
  return item.category === "Background" || BARE_PREVIEW_SLUGS.has(item.slug);
}

type Tab = { id: string; label: string; items: ComponentItem[] };

function buildTabs(all: ComponentItem[]): Tab[] {
  const tabs: Tab[] = [{ id: "all", label: "All", items: all }];

  const fresh = all.filter((c) => NEW_SLUGS.has(c.slug));
  if (fresh.length) tabs.push({ id: "new", label: "New", items: fresh });

  const byCategory = new Map<string, ComponentItem[]>();
  for (const item of all) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  const categoryTabs = [...byCategory.entries()]
    .map(([category, items]) => ({ id: category, label: category, items }))
    // Most-populated category first; equal counts fall back to sidebar order.
    .sort(
      (a, b) =>
        b.items.length - a.items.length ||
        CATEGORY_ORDER.indexOf(a.id) - CATEGORY_ORDER.indexOf(b.id),
    );

  return [...tabs, ...categoryTabs];
}

export function AllComponentsPage() {
  useScrollReveal();

  const tabs = useMemo(() => {
    // Only components with a registered live preview earn a card — no
    // placeholders. `getPublishedComponentsOnly` already drops blocks.
    const all = getPublishedComponentsOnly().filter((c) => viewFor(c.slug));
    return buildTabs(all);
  }, []);

  // Deep link: `/get-started/all-component?tab=new` (the home "New" pill) lands
  // on that tab. Unknown/absent values fall back to "All".
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const resolveRequested = (value: string | null) =>
    value && tabs.some((t) => t.id === value) ? value : null;

  const [activeTab, setActiveTab] = useState(
    () => resolveRequested(requestedTab) ?? "all",
  );

  // React to a new ?tab= arriving while the page stays mounted (the layout
  // persists across /get-started navigation). Tracking the previous value in
  // state — the react.dev "adjust state during render" pattern — applies it
  // before paint without an effect.
  const [seenTab, setSeenTab] = useState(requestedTab);
  if (seenTab !== requestedTab) {
    setSeenTab(requestedTab);
    const resolved = resolveRequested(requestedTab);
    if (resolved) setActiveTab(resolved);
  }

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <main className="main">
      <div className="crumb reveal">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <Link href="/get-started">Get Started</Link>
        <span className="sep">›</span>
        <span className="cur">All components</span>
      </div>

      <h1 className="page-title reveal">All components</h1>
      <p
        className="page-sub reveal d-1"
        style={{ maxWidth: "62ch", marginLeft: 0 }}
      >
        Every Lazy-ui component with a live preview. Interact with any card; the
        arrow opens its full docs.
      </p>

      <div className="all-components-tabs reveal d-2" role="tablist" aria-label="Filter components">
        {tabs.map((t) => {
          const isActive = t.id === active.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(t.id)}
              className={`all-components-tab${isActive ? " is-active" : ""}`}
            >
              {t.label}
              <span className="all-components-tab-count">{t.items.length}</span>
            </button>
          );
        })}
      </div>

      <div key={active.id} className="all-components-grid">
        {active.items.map((item) => (
          <ComponentCard key={item.slug} item={item} />
        ))}
      </div>
    </main>
  );
}

function ComponentCard({ item }: { item: ComponentItem }) {
  const view = viewFor(item.slug)!;
  const bare = isBarePreview(item);
  const videoSrc = previewVideoFor(item.slug);
  const values = useMemo<CustomizeValues>(
    () => ({
      ...(view.controls ? initialValues(view.controls) : {}),
      ...(view.footer?.defaults ?? {}),
    }),
    [view],
  );

  // Mount the preview only while the card is near the viewport, and UNMOUNT it
  // once it scrolls a generous margin away. Many previews hold a WebGL context
  // and browsers cap concurrent contexts (~16); unmount-offscreen keeps the
  // live count bounded. Components release their context on unmount.
  const cardRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Defer out of the effect body so it isn't a synchronous setState.
      const t = window.setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setMounted(e.isIntersecting);
      },
      { rootMargin: "250px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article ref={cardRef} className="all-components-card">
      <div className="all-components-card-preview">
        {!mounted ? (
          <CardSkeleton />
        ) : videoSrc ? (
          <CardVideo src={videoSrc} fit={previewVideoFitFor(item.slug)} />
        ) : (
          <CardPreview view={view} values={values} bare={bare} />
        )}
      </div>

      <span className="all-components-card-pill">{item.title}</span>

      <Link
        href={componentHref(item)}
        className="all-components-card-arrow"
        aria-label={`Open ${item.title}`}
      >
        <ArrowUpRight size={15} strokeWidth={2} />
      </Link>
    </article>
  );
}

/**
 * Compact mirror of component-view's `LiveRender`.
 * - `bare`: mount the raw export filling a 16:9 box, no children → pure visual.
 * - otherwise: use the curated `render()` scene (or the declarative mount),
 *   vertically centered so the component shows when the card crops it.
 */
function CardPreview({
  view,
  values,
  bare,
}: {
  view: ComponentView;
  values: CustomizeValues;
  bare: boolean;
}) {
  const Dynamic = useMemo<ComponentType<Record<string, unknown>> | null>(() => {
    if (!bare && view.render) return null;
    return dynamic(
      () =>
        view.load().then(
          (m) => m[view.export] as ComponentType<Record<string, unknown>>,
        ),
      { ssr: false, loading: () => <CardSkeleton /> },
    ) as ComponentType<Record<string, unknown>>;
  }, [view, bare]);

  if (!bare && view.render) return <>{view.render(values)}</>;
  if (!Dynamic) return <CardSkeleton />;

  const props = {
    ...(view.staticProps ?? {}),
    ...(view.mapProps?.(values) ?? {}),
  };

  if (bare) {
    const className =
      `absolute inset-0 h-full w-full ${(props.className as string) ?? ""}`.trim();
    return (
      <div className="all-components-card-fill">
        <Dynamic {...props} className={className} />
      </div>
    );
  }

  return (
    <div className="all-components-card-center">
      <Dynamic {...props} />
    </div>
  );
}

/**
 * Plays a pre-recorded clip for the heaviest backgrounds — no live WebGL
 * context, so a grid of surfaces stays smooth. Decorative only: autoplays
 * muted on loop with no controls and is hidden from assistive tech.
 */
function CardVideo({ src, fit }: { src: string; fit: "cover" | "contain" }) {
  return (
    <div className="all-components-card-fill">
      <video
        className={`all-components-card-video${fit === "contain" ? " is-contain" : ""}`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={src} type="video/webm" />
      </video>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="all-components-card-skeleton">
      <span className="all-components-card-spinner" />
    </div>
  );
}
