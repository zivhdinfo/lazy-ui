"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Terminal, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button";

import { BrandMark } from "./brand-mark";
import { NAV_ITEMS, activeNavIndex } from "./nav-items";
import { getSidebarSections, isSidebarItemActive } from "./sidebar";

const NAV_PILL_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

export function NavPill() {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const active = activeNavIndex(pathname);
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion ? { duration: 0 } : NAV_PILL_SPRING;
  const sections = useMemo(() => getSidebarSections(), []);
  const searchItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({
          ...item,
          section: section.title,
        })),
      ),
    [sections],
  );
  const [query, setQuery] = useState("");
  const installActive = pathname === "/docs/installation";
  const [menuPathname, setMenuPathname] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPathname === currentPath;
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return searchItems.slice(0, 8);
    return searchItems
      .filter((item) =>
        `${item.label} ${item.section}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 10);
  }, [normalizedQuery, searchItems]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTyping =
        tagName === "input" || tagName === "textarea" || target?.isContentEditable;

      if (event.key === "Escape") {
        setSearchOpen(false);
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !isTyping) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <nav className={`nav-pill${menuOpen ? " mobile-open" : ""}`} aria-label="Primary">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="Lazy-ui home">
            <div className="brand-mark">
              <BrandMark />
            </div>
            <div className="brand-copy">
              <div className="brand-name">Lazy-ui</div>
              <div className="brand-subtitle">registry components</div>
            </div>
          </Link>

          <div className="nav-pill-items">
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === active;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-pill-item${isActive ? " active" : ""}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill-active"
                      className="nav-pill-active-bg"
                      transition={pillTransition}
                      aria-hidden
                    />
                  )}
                  <span className="nav-pill-item-label">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nav-right">
            <button
              type="button"
              className="nav-search"
              aria-label="Search Lazy-ui"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={14} />
              <span>Search</span>
              <kbd>/</kbd>
            </button>
            <GithubStarsButton
              username="zivhdinfo"
              repo="lazy-ui"
              label="GitHub"
              initialValue={0}
              counterEffect="fade"
              apiEndpoint="/api/github-stars"
              className="nav-github-stars"
              aria-label="Open Lazy-ui on GitHub"
            />
            <Link
              href="/docs/installation"
              className={`nav-install-link${installActive ? " active" : ""}`}
            >
              <Terminal size={14} />
              <span>Install</span>
            </Link>
            <button
              type="button"
              className="nav-mobile-trigger"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="nav-mobile-menu"
              onClick={() =>
                setMenuPathname((openPath) =>
                  openPath === currentPath ? null : currentPath,
                )
              }
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="nav-search-layer" role="dialog" aria-label="Search Lazy-ui">
          <button
            type="button"
            className="nav-search-backdrop"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <div className="nav-search-panel">
            <div className="nav-search-field">
              <Search size={16} />
              <input
                autoFocus
                value={query}
                placeholder="Search components and docs"
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="nav-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-search-result"
                    onClick={() => setSearchOpen(false)}
                  >
                    <span>{item.label}</span>
                    <small>{item.section}</small>
                  </Link>
                ))
              ) : (
                <div className="nav-search-empty">No results</div>
              )}
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="nav-mobile-layer" id="nav-mobile-menu">
          <button
            type="button"
            className="nav-mobile-backdrop"
            aria-label="Close navigation"
            onClick={() => setMenuPathname(null)}
          />
          <div className="nav-mobile-panel">
            <div className="nav-mobile-head">
              <span className="nav-mobile-kicker">Lazy-ui</span>
              <span className="nav-mobile-count">{sections.length} groups</span>
            </div>

            <div className="nav-mobile-quick" aria-label="Primary links">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-mobile-quick-link${i === active ? " active" : ""}`}
                  onClick={() => setMenuPathname(null)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="nav-mobile-scroll">
              {sections.map((section) => (
                <section key={section.id} className="nav-mobile-section">
                  <div className="nav-mobile-section-head">
                    <span>{section.title}</span>
                    {section.eyebrow && <span>{section.eyebrow}</span>}
                  </div>
                  <div className="nav-mobile-section-list">
                    {section.items.map((item) => {
                      const itemActive = isSidebarItemActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-mobile-link${itemActive ? " active" : ""}`}
                          onClick={() => setMenuPathname(null)}
                        >
                          <span>{item.label}</span>
                          {item.tag && (
                            <span className="nav-mobile-tag">{item.tag}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
