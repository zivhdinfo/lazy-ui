"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  ChevronRight,
  Compass,
  Heart,
  Image,
  Layers,
  MessageSquare,
  MousePointerClick,
  Rocket,
  Smartphone,
  Sparkles,
  TextCursorInput,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { BorderGlow } from "@/components/lazy-ui/border-glow";
import { SlideHighlight } from "@/components/lazy-ui/slide-highlight";
import { componentHref } from "@/registry/categories";
import { getPublishedComponentsOnly } from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

import { useFavorites } from "./use-favorites";

export type SidebarItem = {
  label: string;
  href: string;
  tag?: string;
  /** Present for component items — enables the favorite (heart) toggle. */
  slug?: string;
};

const FAVORITES_SECTION_ID = "favorites";

export type SidebarSection = {
  id: string;
  title: string;
  eyebrow?: string;
  items: SidebarItem[];
};

const CATEGORY_ORDER = [
  "Background",
  "Text Animate",
  "Animate",
  "Forms",
  "Buttons",
  "Feedback",
  "Navigation",
  "Overlay",
  "Effects",
  "Device Mocks",
];

// Sidebar badges. A slug listed here renders a tag (e.g. "New", "Update")
// in the sidebar next to the component name AND powers the dedicated "New"
// tab on `/components`. Badge lifetime is bounded — see
// [CLAUDE.md](../../CLAUDE.md#sidebar-badge-rotation) for the rule.
export const NEW_SLUGS: ReadonlySet<string> = new Set(["slide-highlight"]);

// Spectrum for the group count badge's glow ring. Soft, slightly-pastel hues —
// a full rainbow at full saturation reads crude ("thô"); these stay tasteful.
// Module-scoped so the reference is stable across renders (BorderGlow memoizes
// on the colors array).
const GROUP_BADGE_COLORS = [
  "#f472b6",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
];

const DOC_SECTION: SidebarSection = {
  id: "docs",
  title: "Get Started",
  eyebrow: "Docs",
  items: [
    { label: "Introduction", href: "/get-started" },
    { label: "Installation", href: "/get-started/installation" },
    { label: "Changelog", href: "/get-started/changelog" },
    { label: "All components", href: "/get-started/all-component" },
  ],
};

// One icon per component category, shown on the collapsible group title.
// Falls back to a neutral glyph so a brand-new category never renders
// icon-less.
const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Get Started": Rocket,
  Favorites: Heart,
  Background: Image,
  "Text Animate": Type,
  Animate: Zap,
  Forms: TextCursorInput,
  Buttons: MousePointerClick,
  Feedback: MessageSquare,
  Navigation: Compass,
  Overlay: Layers,
  Effects: Sparkles,
  "Device Mocks": Smartphone,
};

export function isSidebarItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/get-started") return pathname === "/get-started";
  return pathname === href;
}

function sortByCategory(items: ComponentItem[]): SidebarSection[] {
  const grouped = new Map<string, ComponentItem[]>();
  for (const item of items) {
    const current = grouped.get(item.category) ?? [];
    current.push(item);
    grouped.set(item.category, current);
  }

  const orderedNames = [
    ...CATEGORY_ORDER,
    ...Array.from(grouped.keys()).filter((name) => !CATEGORY_ORDER.includes(name)),
  ];

  return orderedNames.flatMap((name) => {
    const list = grouped.get(name);
    if (!list?.length) return [];
    return {
      id: `components-${name.toLowerCase().replace(/\s+/g, "-")}`,
      title: name,
      eyebrow: `${list.length} item${list.length === 1 ? "" : "s"}`,
      items: list.map((item) => ({
        label: item.title,
        href: componentHref(item),
        tag: NEW_SLUGS.has(item.slug) ? "New" : undefined,
        slug: item.slug,
      })),
    };
  });
}

export function getSidebarSections(): SidebarSection[] {
  return [DOC_SECTION, ...sortByCategory(getPublishedComponentsOnly())];
}

// One collapsible category: a bold title (icon + label + chevron) over a flat
// list of links. The panel animates between 0 and its exact measured height —
// smooth (no max-height dead travel) and never clips a long category, in the
// desktop rail or the mobile card alike.
function SidebarGroup({
  section,
  open,
  panelId,
  Icon,
  onToggle,
  pathname,
  onNavigate,
  isFavorite,
  onToggleFavorite,
}: {
  section: SidebarSection;
  open: boolean;
  panelId: string;
  Icon: LucideIcon;
  onToggle: () => void;
  pathname: string | null;
  onNavigate?: () => void;
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  // Count of freshly-added children, surfaced as a glowing number on the group
  // title so a collapsed category still signals how many new items it holds.
  const newCount = section.items.reduce(
    (n, item) => (item.tag ? n + 1 : n),
    0,
  );
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Captures the mount-time open state; only the (mount-only) ref callback reads
  // it, so it never needs updating after the first render.
  const openRef = useRef(open);
  const mountedRef = useRef(false);

  // Snap the initial height before first paint so the seeded-open group never
  // flashes open→closed on load. Ref callbacks run during commit (pre-paint)
  // and only on the client, so there's no SSR useLayoutEffect warning.
  const setWrap = useCallback((node: HTMLDivElement | null) => {
    wrapRef.current = node;
    if (node && !mountedRef.current) {
      node.style.height = openRef.current ? "auto" : "0px";
    }
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return; // initial state already applied by the ref callback
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.style.height = open ? "auto" : "0px";
      return;
    }

    if (open) {
      const target = wrap.scrollHeight;
      wrap.style.height = "0px";
      void wrap.offsetHeight; // commit the start height before transitioning
      wrap.style.height = `${target}px`;
      const onEnd = (event: TransitionEvent) => {
        if (event.propertyName !== "height") return;
        wrap.style.height = "auto"; // release so it reflows with its content
        wrap.removeEventListener("transitionend", onEnd);
      };
      wrap.addEventListener("transitionend", onEnd);
      return () => wrap.removeEventListener("transitionend", onEnd);
    }

    const current = wrap.scrollHeight; // from auto → fixed px → 0
    wrap.style.height = `${current}px`;
    void wrap.offsetHeight;
    wrap.style.height = "0px";
  }, [open]);

  return (
    <div className="sb-group">
      <button
        type="button"
        className="sb-group-title"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <Icon className="sb-group-icon" strokeWidth={2} aria-hidden />
        <span className="sb-group-label">{section.title}</span>
        {newCount > 0 && (
          <BorderGlow
            mode="auto"
            colors={GROUP_BADGE_COLORS}
            thickness={1.5}
            radius={6}
            coneSpread={92}
            glowSize={6}
            intensity={0.9}
            speed={0.5}
            bling={false}
            background="var(--surface)"
            className="sb-group-tag"
          >
            <span
              className="sb-group-tag-count"
              aria-label={`${newCount} new`}
            >
              {newCount}
            </span>
          </BorderGlow>
        )}
        <ChevronRight className="sb-chevron" strokeWidth={2} aria-hidden />
      </button>
      <div className="sb-sub-wrap" id={panelId} ref={setWrap} data-open={open}>
        <ul className="sb-sub">
          {section.items.map((item) => {
            const active = isSidebarItemActive(pathname, item.href);
            const fav = item.slug ? isFavorite(item.slug) : false;
            return (
              <li key={item.href} className="sb-sub-item">
                <Link
                  href={item.href}
                  className={`sb-sub-link${active ? " active" : ""}${item.slug ? " has-fav" : ""}`}
                  aria-current={active ? "page" : undefined}
                  tabIndex={open ? undefined : -1}
                  onClick={onNavigate}
                >
                  <span className="sb-sub-label">{item.label}</span>
                  {item.tag && <span className="new-tag">{item.tag}</span>}
                </Link>
                {item.slug && (
                  <button
                    type="button"
                    className={`sb-fav-btn${fav ? " is-fav" : ""}`}
                    aria-pressed={fav}
                    aria-label={
                      fav
                        ? `Remove ${item.label} from favorites`
                        : `Add ${item.label} to favorites`
                    }
                    tabIndex={open ? undefined : -1}
                    onClick={() => onToggleFavorite(item.slug!)}
                  >
                    <Heart
                      className="sb-fav-icon"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// shadcn docs-style sidebar: each category is a collapsible group — a bold
// title (icon + label + chevron) over a flat list of links (no rail). The
// active link reads as a soft accent pill. `onNavigate` lets the mobile sheet
// close itself when a link is tapped.
export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  // Stable per-instance prefix so the desktop + mobile sidebars never collide
  // on the panel ids they wire up with aria-controls.
  const uid = useId();

  const { slugs: favoriteSlugs, isFavorite, toggle: toggleFavorite } =
    useFavorites();

  // Resolve favorited slugs back to their registry items, in favorites order
  // (newest-first). Unknown slugs (e.g. a component since unpublished) drop out.
  const componentBySlug = useMemo(() => {
    const map = new Map<string, ComponentItem>();
    for (const c of getPublishedComponentsOnly()) map.set(c.slug, c);
    return map;
  }, []);

  const favoritesSection = useMemo<SidebarSection | null>(() => {
    const items: SidebarItem[] = favoriteSlugs
      .map((slug) => componentBySlug.get(slug))
      .filter((c): c is ComponentItem => Boolean(c))
      .map((c) => ({ label: c.title, href: componentHref(c), slug: c.slug }));
    if (!items.length) return null;
    return {
      id: FAVORITES_SECTION_ID,
      title: "Favorites",
      eyebrow: `${items.length} saved`,
      items,
    };
  }, [favoriteSlugs, componentBySlug]);

  // "Get Started" sits at the top; Favorites slots in just beneath it (when any
  // exist), then every component category. getSidebarSections() returns the
  // doc + category groups in order.
  const categorySections = useMemo(() => {
    const base = getSidebarSections();
    if (!favoritesSection) return base;
    return [base[0], favoritesSection, ...base.slice(1)];
  }, [favoritesSection]);

  // Resolve to the real category that owns the route, never the Favorites
  // mirror, so a deep link still expands the component's own category group.
  const activeSectionId = useMemo(
    () =>
      categorySections.find(
        (section) =>
          section.id !== FAVORITES_SECTION_ID &&
          section.items.some((item) => isSidebarItemActive(pathname, item.href)),
      )?.id,
    [pathname, categorySections],
  );

  // Which category groups are expanded. Seed with the group that owns the
  // current route so a deep link opens to the right place. Favorites is seeded
  // open so the list is visible the moment it populates after hydration.
  const [openIds, setOpenIds] = useState<Set<string>>(
    () =>
      new Set([
        FAVORITES_SECTION_ID,
        ...(activeSectionId ? [activeSectionId] : []),
      ]),
  );

  // Open the group that owns a freshly-active route (e.g. arriving via search
  // or a cross-category link while the sidebar stays mounted). Adjusting state
  // during render — not in an effect — applies it before paint, so the target
  // panel never flashes closed. See react.dev "You Might Not Need an Effect".
  const lastActiveRef = useRef(activeSectionId);
  if (lastActiveRef.current !== activeSectionId) {
    lastActiveRef.current = activeSectionId;
    if (activeSectionId && !openIds.has(activeSectionId)) {
      setOpenIds((prev) => {
        const next = new Set(prev);
        next.add(activeSectionId);
        return next;
      });
    }
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Scroll the active sidebar link into view on first mount (e.g. a deep link
  // to a route near the bottom of the list). We deliberately skip subsequent
  // pathname changes: when the user clicks a link, their scroll position is
  // already where they want it; rewriting scrollTop on every nav feels like
  // the sidebar is fighting them.
  const asideRef = useRef<HTMLElement | null>(null);
  const didInitialScrollRef = useRef(false);
  useEffect(() => {
    if (didInitialScrollRef.current) return;
    const aside = asideRef.current;
    if (!aside) return;
    const target = aside.querySelector<HTMLElement>(".sb-sub-link.active");
    if (!target) return;
    didInitialScrollRef.current = true;

    const aRect = aside.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const relTop = tRect.top - aRect.top + aside.scrollTop;
    const relBottom = relTop + tRect.height;

    // Only scroll if the target is actually clipped — don't nudge links that
    // are merely near an edge.
    const fullyVisible =
      relTop >= aside.scrollTop &&
      relBottom <= aside.scrollTop + aside.clientHeight;
    if (fullyVisible) return;

    const padding = 48;
    const nextScroll = Math.max(0, relTop - padding);
    aside.scrollTo({ top: nextScroll, behavior: "auto" });
  }, [pathname]);

  // The active pill (and hover pill) is handled by SlideHighlight. The current
  // route can highlight twice — once in its own category and once in the
  // Favorites mirror — so steer the active pill to the first active link in an
  // *open* group; a collapsed panel reports clientHeight 0, so skip those.
  const resolveActiveLink = useCallback((matches: HTMLElement[]) => {
    for (const el of matches) {
      const wrap = el.closest<HTMLElement>(".sb-sub-wrap");
      if (!wrap || wrap.clientHeight > 0) return el;
    }
    return null;
  }, []);

  // Signal SlideHighlight to re-place the active pill whenever the route, the
  // set of open groups, or the favorites list changes — each shifts which link
  // is active or where it sits. (Mid-transition layout shifts are caught by the
  // component's own ResizeObserver.)
  const activeKey = useMemo(
    () =>
      [pathname, [...openIds].sort().join(","), favoriteSlugs.join(",")].join(
        "|",
      ),
    [pathname, openIds, favoriteSlugs],
  );

  return (
    <aside
      ref={asideRef}
      className="sidebar sb-sidebar"
      aria-label="Component navigation"
    >
      <SlideHighlight
        as="nav"
        className="sb-menu"
        itemSelector=".sb-sub-link, .sb-group-title"
        activeSelector=".sb-sub-link.active"
        activeKey={activeKey}
        resolveActive={resolveActiveLink}
        activeClassName="sb-active-pill"
        hoverClassName="sb-hover"
      >
        {categorySections.map((section) => (
          <SidebarGroup
            key={section.id}
            section={section}
            open={openIds.has(section.id)}
            panelId={`${uid}-${section.id}`}
            Icon={CATEGORY_ICON[section.title] ?? Box}
            onToggle={() => toggle(section.id)}
            pathname={pathname}
            onNavigate={onNavigate}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </SlideHighlight>
    </aside>
  );
}
