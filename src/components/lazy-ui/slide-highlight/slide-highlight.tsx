"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

// Pills inherit `currentColor`, so the highlight tracks the text color and
// stays legible on a light OR dark surface without a `dark:` variant. Give the
// items a stacking context above the pill (`position: relative`) — the pills
// render first, so any positioned item paints over them.
const DEFAULT_HOVER_CLASS =
  "pointer-events-none absolute left-0 top-0 rounded-lg bg-[color-mix(in_srgb,currentColor_6%,transparent)] transition-[transform,width,height,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]";

const DEFAULT_ACTIVE_CLASS =
  "pointer-events-none absolute left-0 top-0 rounded-lg bg-[color-mix(in_srgb,currentColor_10%,transparent)] transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

export interface SlideHighlightProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Element rendered as the positioned track. @default "div" */
  as?: ElementType;
  children: ReactNode;
  /**
   * CSS selector (relative to the track) for the items the hover pill follows.
   * Comma-separated selectors are allowed. @default "[data-slide-item]"
   */
  itemSelector?: string;
  /**
   * CSS selector for the active item the active pill marks. Omit to render only
   * the hover pill.
   */
  activeSelector?: string;
  /**
   * Bump whenever the active target may have moved (route change, tab switch,
   * list reorder) so the active pill re-places. Layout-driven shifts — a
   * collapsible section animating open — are caught automatically.
   */
  activeKey?: string | number | boolean | null;
  /**
   * Pick the real active element when `activeSelector` matches several (e.g. a
   * route mirrored in two lists, or duplicates inside a collapsed section).
   * @default the first match
   */
  resolveActive?: (matches: HTMLElement[]) => HTMLElement | null;
  /** Drop the cursor-following hover pill, keeping only the active pill. @default false */
  hoverDisabled?: boolean;
  /** Class names for the hover pill. Replaces the built-in style when set. */
  hoverClassName?: string;
  /** Class names for the active pill. Replaces the built-in style when set. */
  activeClassName?: string;
}

/**
 * A behavior wrapper that slides a soft pill between its children — the
 * sidebar's "moving highlight", made reusable. It mounts two absolutely
 * positioned pills behind whatever you pass as `children`:
 *
 * - a **hover** pill that follows the cursor across `itemSelector` matches, and
 * - an **active** pill that marks the `activeSelector` match and glides to a new
 *   one whenever `activeKey` changes.
 *
 * Positioning is imperative (no React state) so pointer moves never re-render
 * the tree. Honors `prefers-reduced-motion` by snapping instead of sliding.
 */
export function SlideHighlight({
  as,
  children,
  itemSelector = "[data-slide-item]",
  activeSelector,
  activeKey = null,
  resolveActive,
  hoverDisabled = false,
  hoverClassName,
  activeClassName,
  className,
  onMouseMove,
  onMouseLeave,
  ...rest
}: SlideHighlightProps) {
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLElement | null>(null);
  const hoverRef = useRef<HTMLSpanElement | null>(null);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  // Tracks whether the active pill has ever been on screen, so the first
  // placement snaps instead of streaking in from the corner.
  const activeSeenRef = useRef(false);

  // Position + size a pill over `target`. Snapping (no slide) kills the CSS
  // transition for one committed frame, then restores it.
  const place = useCallback(
    (pill: HTMLElement, target: HTMLElement | null, slide: boolean) => {
      const root = rootRef.current;
      if (!root) return;
      if (!target) {
        pill.style.opacity = "0";
        return;
      }
      const snap = !slide || reduced;
      const t = target.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      // Killing the transition snaps; clearing it (re)enables the CSS easing —
      // the latter also undoes a transition left at "none" by a prior snap (e.g.
      // after reduced-motion turns back off).
      pill.style.transition = snap ? "none" : "";
      pill.style.transform = `translate(${t.left - r.left}px, ${t.top - r.top}px)`;
      pill.style.width = `${t.width}px`;
      pill.style.height = `${t.height}px`;
      pill.style.opacity = "1";
      if (snap && !reduced) {
        void pill.offsetWidth; // commit the snap before re-enabling the slide
        pill.style.transition = "";
      }
    },
    [reduced],
  );

  // Active pill: place on mount + whenever `activeKey`/`activeSelector` changes,
  // and re-place continuously while the track resizes — a collapsible section
  // animating open shifts the active row mid-transition, so a single placement
  // would land it short.
  useEffect(() => {
    const pill = activeRef.current;
    const root = rootRef.current;
    if (!pill || !root) return;

    const placeActive = (slide: boolean) => {
      if (!activeSelector) {
        pill.style.opacity = "0";
        return;
      }
      const matches = Array.from(
        root.querySelectorAll<HTMLElement>(activeSelector),
      );
      const target = resolveActive ? resolveActive(matches) : (matches[0] ?? null);
      // Slide only if it was already on screen; otherwise snap so it doesn't
      // streak across from a stale spot.
      const wasVisible = pill.style.opacity === "1";
      place(pill, target, slide && activeSeenRef.current && wasVisible);
      activeSeenRef.current = true;
    };

    placeActive(true);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => placeActive(true))
        : null;
    ro?.observe(root);
    const onResize = () => placeActive(false);
    window.addEventListener("resize", onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [activeKey, activeSelector, resolveActive, place]);

  const moveHover = (event: ReactMouseEvent<HTMLElement>) => {
    onMouseMove?.(event);
    const pill = hoverRef.current;
    const root = rootRef.current;
    if (!pill || !root) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      itemSelector,
    );
    if (!target || !root.contains(target)) return; // over a gap — hold position
    const wasHidden = pill.style.opacity !== "1";
    place(pill, target, !wasHidden); // snap on first reveal, slide afterwards
  };

  const hideHover = (event: ReactMouseEvent<HTMLElement>) => {
    onMouseLeave?.(event);
    const pill = hoverRef.current;
    if (pill) pill.style.opacity = "0";
  };

  const Root = (as ?? "div") as ElementType;

  return (
    <Root
      {...rest}
      ref={rootRef}
      className={className}
      onMouseMove={moveHover}
      onMouseLeave={hideHover}
    >
      <span
        ref={activeRef}
        aria-hidden
        className={activeClassName ?? DEFAULT_ACTIVE_CLASS}
      />
      {!hoverDisabled && (
        <span
          ref={hoverRef}
          aria-hidden
          className={hoverClassName ?? DEFAULT_HOVER_CLASS}
        />
      )}
      {children}
    </Root>
  );
}

SlideHighlight.displayName = "SlideHighlight";
