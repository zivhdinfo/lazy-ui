"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

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
  "Effects",
  "Forms",
  "Buttons",
  "Feedback",
  "Navigation",
  "Overlay",
  "Device Mocks",
];

const NEW_SLUGS = new Set([
  "glass-button",
  "circle-cipher",
  "liquid-reveal",
  "liquid-transition",
  "bling-transition",
  "particle-halo",
  "text-warp",
  "text-rise",
  "text-spin",
  "text-scramble",
  "spinning-text",
  "text-flip",
  "iphone",
  "wave-cipher",
  "horizon-cipher",
  "orbit-cipher",
  "orbit-bloom",
  "orbit-mesh",
  "aurora-mesh",
  "shadow-mesh",
  "prism-drift",
  "chroma-flow",
  "slime-background",
  "neumorphism",
  "ripple-surface",
  "liquid-chrome",
  "matrix-grid",
]);

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

const SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};
const INSTANT = { duration: 0 } as const;

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

export function Sidebar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const sections = useMemo(() => getSidebarSections(), []);

  const activeSectionId = useMemo(
    () =>
      sections.find((section) =>
        section.items.some((item) => isSidebarItemActive(pathname, item.href)),
      )?.id,
    [pathname, sections],
  );

  const transition = reduceMotion ? INSTANT : SPRING;

  // Scroll the active sidebar item into view on first mount (e.g. a deep link
  // to a route at the bottom of the list). We deliberately skip subsequent
  // pathname changes: when the user clicks an item, their scroll position is
  // already where they want it; rewriting scrollTop on every nav feels like
  // the sidebar is fighting them.
  const asideRef = useRef<HTMLElement | null>(null);
  const didInitialScrollRef = useRef(false);
  useEffect(() => {
    if (didInitialScrollRef.current) return;
    const aside = asideRef.current;
    if (!aside) return;
    const target = aside.querySelector<HTMLElement>(".sb-item.active");
    if (!target) return;
    didInitialScrollRef.current = true;

    const aRect = aside.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const relTop = tRect.top - aRect.top + aside.scrollTop;
    const relBottom = relTop + tRect.height;

    // Only scroll if the target is actually clipped — don't nudge items that
    // are merely near an edge.
    const fullyVisible =
      relTop >= aside.scrollTop &&
      relBottom <= aside.scrollTop + aside.clientHeight;
    if (fullyVisible) return;

    const padding = 48;
    const nextScroll = Math.max(0, relTop - padding);
    aside.scrollTo({ top: nextScroll, behavior: "auto" });
  }, [pathname]);

  return (
    <aside
      ref={asideRef}
      className="sidebar sb-sidebar"
      aria-label="Documentation navigation"
    >
      <div className="sb-sidebar-head">
        <span className="sb-sidebar-kicker">Navigation</span>
        <span className="sb-sidebar-count">{sections.length} groups</span>
      </div>

      <nav className="sb-nav-stack">
        {sections.map((section) => {
          const activeInSection = section.id === activeSectionId;
          return (
            <section
              key={section.id}
              className={`sb-section${activeInSection ? " active" : ""}`}
              aria-label={section.title}
            >
              <div className="sb-section-head">
                <span className="sb-section-title">{section.title}</span>
                {section.eyebrow && (
                  <span className="sb-section-meta">{section.eyebrow}</span>
                )}
              </div>
              <ul className="sb-list">
                {section.items.map((item) => {
                  const active = isSidebarItemActive(pathname, item.href);
                  return (
                    <li
                      key={item.href}
                      className={`sb-item${active ? " active" : ""}`}
                    >
                      {active && (
                        <>
                          <motion.span
                            className="sb-active-bg"
                            layoutId="sidebar-active-bg"
                            transition={transition}
                          />
                          <motion.span
                            className="sb-motion-indicator"
                            layoutId="sidebar-active-rail"
                            transition={transition}
                          />
                        </>
                      )}
                      <Link href={item.href} className="sb-link">
                        <span className="sb-label">{item.label}</span>
                        {item.tag && <span className="new-tag">{item.tag}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
