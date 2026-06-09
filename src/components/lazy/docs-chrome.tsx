"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button";

import { BrandMark } from "./brand-mark";
import {
  NEW_SLUGS,
  getSidebarSections,
  isSidebarItemActive,
} from "./sidebar";

// Shared light/dark chrome for the docs/component/blocks surface. Mirrors the
// home (.lui-home): a fixed matte frame with concave rounded corners + a carved
// header pill. Theme persists in the SAME localStorage key as the home, so the
// choice carries across home ↔ docs. Code blocks + live previews stay dark in
// both themes by intent (see lui-docs.css).

type Theme = "light" | "dark";
const THEME_KEY = "lazyui-theme";
const GH_OWNER = "zivhdinfo";
const GH_REPO = "lazy-ui";

const NAV_LINKS: { label: string; href: string; match: string }[] = [
  { label: "Components", href: "/components", match: "/components" },
  { label: "Blocks", href: "/blocks", match: "/blocks" },
  { label: "Docs", href: "/docs", match: "/docs" },
];

function ThemeIcon() {
  return (
    <>
      <svg
        className="sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className="moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </>
  );
}

// Concave quarter used by the matte frame + carved header joins.
function CornerSvg({ className }: { className: string }) {
  return (
    <svg
      className={className}
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.50871e-06 0C-0.00788227 37.3001 8.99616 50.0116 50 50H5.50871e-06V0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DocsChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";

  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sections = useMemo(() => getSidebarSections(), []);
  const searchItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({ ...item, section: section.title })),
      ),
    [sections],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return searchItems.slice(0, 8);
    return searchItems
      .filter((item) =>
        `${item.label} ${item.section}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 10);
  }, [normalizedQuery, searchItems]);

  // Theme is CSS-driven off <html data-theme> (set pre-paint by the root layout
  // script and persisted across client navigation). Re-affirm it from the
  // shared key on mount — covers a theme changed on another surface (e.g. the
  // home) before navigating here — and keep following the system when no manual
  // choice has been made. No React state: the toggle is a pure DOM mutation, so
  // route changes never flash the wrong theme.
  useEffect(() => {
    const apply = (t: Theme) => {
      document.documentElement.dataset.theme = t;
    };
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(saved === "light" || saved === "dark" ? saved : mq.matches ? "dark" : "light");
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) apply(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    const next: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Lock body scroll while an overlay is open.
  useEffect(() => {
    if (!searchOpen && !drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchOpen, drawerOpen]);

  // "/" opens search, Escape closes overlays.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="lui-docs">
      <div className="site-frame site-frame--top" aria-hidden="true" />
      <div className="site-frame site-frame--bottom" aria-hidden="true" />
      <div className="site-frame site-frame--left" aria-hidden="true" />
      <div className="site-frame site-frame--right" aria-hidden="true" />
      <CornerSvg className="site-corner site-corner--top-left" />
      <CornerSvg className="site-corner site-corner--top-right" />
      <CornerSvg className="site-corner site-corner--bottom-left" />
      <CornerSvg className="site-corner site-corner--bottom-right" />

      <header className="home-header">
        <div className="nav-shell">
          <CornerSvg className="home-corner home-corner--left" />
          <CornerSvg className="home-corner home-corner--right" />
          <div className="nav">
            <Link className="brand" href="/" aria-label="Lazy UI home">
              <span className="mark">
                <BrandMark size={25} />
              </span>
              <span>
                <b>Lazy</b> <span className="z">UI</span>
              </span>
            </Link>

            <nav className="nav-links" aria-label="Primary">
              {NAV_LINKS.map((item) => {
                const active = currentPath.startsWith(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="nav-right">
              <button
                type="button"
                className="docs-search"
                aria-label="Search Lazy UI"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={15} aria-hidden />
                <span>Search</span>
                <span className="kbd">/</span>
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <ThemeIcon />
              </button>
              <GithubStarsButton
                username={GH_OWNER}
                repo={GH_REPO}
                apiEndpoint="/api/github-stars"
                label="Star"
                displayFormat="compact"
                variant="ghost"
                className="lui-gh"
              />
              <button
                type="button"
                className="icon-btn docs-menu-btn"
                aria-label="Open navigation"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      {children}

      {searchOpen && (
        <div
          className="lui-docs-search-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Search Lazy UI"
        >
          <button
            type="button"
            className="lui-docs-search-backdrop"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <div className="lui-docs-search-panel">
            <div className="lui-docs-search-field">
              <Search size={16} aria-hidden />
              <input
                autoFocus
                value={query}
                placeholder="Search components and docs"
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <X size={15} aria-hidden />
              </button>
            </div>
            <div className="lui-docs-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="lui-docs-search-result"
                    onClick={() => setSearchOpen(false)}
                  >
                    <span>{item.label}</span>
                    <small>{item.section}</small>
                  </Link>
                ))
              ) : (
                <div className="lui-docs-search-empty">No results</div>
              )}
            </div>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="lui-docs-drawer-layer">
          <button
            type="button"
            className="lui-docs-drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="lui-docs-drawer-panel">
            <div className="lui-docs-drawer-head">
              <Link className="brand" href="/" onClick={() => setDrawerOpen(false)}>
                <span className="mark">
                  <BrandMark size={22} />
                </span>
                <span>
                  <b>Lazy</b> <span className="z">UI</span>
                </span>
              </Link>
              <button type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
                <X size={16} aria-hidden />
              </button>
            </div>
            {sections.map((section) => (
              <div key={section.id} className="lui-docs-drawer-section">
                <span className="lui-docs-drawer-section-title">{section.title}</span>
                {section.items.map((item) => {
                  const active = isSidebarItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`lui-docs-drawer-link${active ? " active" : ""}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span>{item.label}</span>
                      {item.tag && NEW_SLUGS.size > 0 && (
                        <span className="new-tag">{item.tag}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
