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
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Box,
  ChevronRight,
  Compass,
  Image,
  Layers,
  MessageSquare,
  MousePointerClick,
  Smartphone,
  Sparkles,
  TextCursorInput,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { getPublishedComponentsOnly } from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

export type SidebarItem = {
  label: string;
  href: string;
  tag?: string;
};

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
export const NEW_SLUGS: ReadonlySet<string> = new Set(["border-glow", "pixel-cursor"]);

const DOC_SECTION: SidebarSection = {
  id: "docs",
  title: "Get Started",
  eyebrow: "Docs",
  items: [
    { label: "Introduction", href: "/docs" },
    { label: "Installation", href: "/docs/installation" },
    { label: "Changelog", href: "/docs/changelog" },
    { label: "All Components", href: "/components" },
  ],
};

// One icon per component category, shown on the collapsible group title.
// Falls back to a neutral glyph so a brand-new category never renders
// icon-less.
const CATEGORY_ICON: Record<string, LucideIcon> = {
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
  if (href === "/docs") return pathname === "/docs";
  if (href === "/components") return pathname === "/components";
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
        href: `/components/${item.slug}`,
        tag: NEW_SLUGS.has(item.slug) ? "New" : undefined,
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
}: {
  section: SidebarSection;
  open: boolean;
  panelId: string;
  Icon: LucideIcon;
  onToggle: () => void;
  pathname: string | null;
  onNavigate?: () => void;
}) {
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
        <ChevronRight className="sb-chevron" strokeWidth={2} aria-hidden />
      </button>
      <div className="sb-sub-wrap" id={panelId} ref={setWrap} data-open={open}>
        <ul className="sb-sub">
          {section.items.map((item) => {
            const active = isSidebarItemActive(pathname, item.href);
            return (
              <li key={item.href} className="sb-sub-item">
                <Link
                  href={item.href}
                  className={`sb-sub-link${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  tabIndex={open ? undefined : -1}
                  onClick={onNavigate}
                >
                  <span className="sb-sub-label">{item.label}</span>
                  {item.tag && <span className="new-tag">{item.tag}</span>}
                </Link>
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

  // Only the component categories live in the sidebar now — the "Get Started"
  // doc links were lifted out (they stay reachable from the header). The
  // exported getSidebarSections() still returns them for global search.
  const categorySections = useMemo(() => getSidebarSections().slice(1), []);

  const activeSectionId = useMemo(
    () =>
      categorySections.find((section) =>
        section.items.some((item) => isSidebarItemActive(pathname, item.href)),
      )?.id,
    [pathname, categorySections],
  );

  // Which category groups are expanded. Seed with the group that owns the
  // current route so a deep link opens to the right place.
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(activeSectionId ? [activeSectionId] : []),
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

  // Cursor-following hover highlight — a single pill that slides to whichever
  // title/link is under the pointer. Driven imperatively (no React state) so
  // mousemove never re-renders the tree. The pill sits behind the items.
  const navRef = useRef<HTMLElement | null>(null);
  const hoverRef = useRef<HTMLSpanElement | null>(null);

  // Active indicator — a pill that slides from the previous active link to the
  // new one whenever the route changes. The sidebar persists across navigation
  // (chrome lives in the layout), so this element survives the click and a CSS
  // transition carries it across. Snaps on first paint and when (re)appearing.
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const activeSeenRef = useRef(false);
  useEffect(() => {
    const pill = activeRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;

    const place = (slide: boolean) => {
      const active = nav.querySelector<HTMLElement>(".sb-sub-link.active");
      // Hide when there's no active link, or its category is collapsed (a
      // clipped link still reports a layout box, so check the panel height).
      const wrap = active?.closest<HTMLElement>(".sb-sub-wrap");
      if (!active || (wrap && wrap.clientHeight === 0)) {
        pill.style.opacity = "0";
        return;
      }
      const aRect = active.getBoundingClientRect();
      const nRect = nav.getBoundingClientRect();
      if (!slide) pill.style.transition = "none";
      pill.style.transform = `translate(${aRect.left - nRect.left}px, ${aRect.top - nRect.top}px)`;
      pill.style.width = `${aRect.width}px`;
      pill.style.height = `${aRect.height}px`;
      pill.style.opacity = "1";
      if (!slide) {
        void pill.offsetWidth; // commit the snap before re-enabling the slide
        pill.style.transition = "";
      }
    };

    // Slide only when it was already on screen; otherwise snap into place so it
    // doesn't streak across from a stale spot.
    const wasVisible = pill.style.opacity === "1";
    place(activeSeenRef.current && wasVisible);
    activeSeenRef.current = true;

    // A collapse/expand can shift the active link mid-transition — re-place once
    // the layout settles so the pill lands exactly.
    const settle = window.setTimeout(() => place(true), 300);
    return () => window.clearTimeout(settle);
  }, [pathname, openIds]);

  const moveHover = (event: ReactMouseEvent<HTMLElement>) => {
    const pill = hoverRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".sb-sub-link, .sb-group-title",
    );
    if (!target) return; // gliding over a gap — keep the pill where it was
    const tRect = target.getBoundingClientRect();
    const nRect = nav.getBoundingClientRect();
    const x = tRect.left - nRect.left;
    const y = tRect.top - nRect.top;
    const place = () => {
      pill.style.transform = `translate(${x}px, ${y}px)`;
      pill.style.width = `${tRect.width}px`;
      pill.style.height = `${tRect.height}px`;
    };
    if (pill.style.opacity !== "1") {
      // First reveal — snap into place so it doesn't slide in from the corner.
      pill.style.transition = "none";
      place();
      void pill.offsetWidth;
      pill.style.transition = "";
      pill.style.opacity = "1";
    } else {
      place();
    }
  };

  const hideHover = () => {
    const pill = hoverRef.current;
    if (pill) pill.style.opacity = "0";
  };

  return (
    <aside
      ref={asideRef}
      className="sidebar sb-sidebar"
      aria-label="Component navigation"
    >
      <nav
        className="sb-menu"
        ref={navRef}
        onMouseMove={moveHover}
        onMouseLeave={hideHover}
      >
        <span className="sb-active-pill" ref={activeRef} aria-hidden />
        <span className="sb-hover" ref={hoverRef} aria-hidden />
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
          />
        ))}
      </nav>
    </aside>
  );
}
