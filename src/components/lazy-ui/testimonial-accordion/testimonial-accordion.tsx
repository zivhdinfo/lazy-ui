"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type TestimonialAccordionTrigger = "hover" | "click";

export type TestimonialAccordionOrientation = "auto" | "horizontal" | "vertical";

export interface Testimonial {
  /** Stable key for the panel. */
  id: string;
  /** Company / brand name shown as the story heading. */
  name: string;
  /** One-line summary rendered under the name. */
  description: string;
  /** The pull-quote — the largest text in the expanded panel. */
  quote: string;
  /** Person credited with the quote. */
  author: string;
  /** Author role + company, e.g. `"CEO, Brightfold"`. */
  role?: string;
  /** Avatar image URL. Falls back to an initials monogram when omitted. */
  avatar?: string;
  /** "Read the story" link target. The link is hidden when omitted. */
  href?: string;
  /** White brand mark. Falls back to a first-letter tile when omitted. */
  logo?: ReactNode;
  /** Brand color — fills the collapsed bar and seeds the expanded gradient. */
  accent: string;
}

export interface TestimonialAccordionProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Stories rendered as panels, left to right. */
  testimonials: Testimonial[];
  /** How a collapsed panel expands. Focus and click always work too. @default "hover" */
  trigger?: TestimonialAccordionTrigger;
  /** Layout direction. `"auto"` stacks the panels vertically once the
   * container is narrower than `breakpoint`. @default "auto" */
  orientation?: TestimonialAccordionOrientation;
  /** Container width, in px, under which `"auto"` switches to the vertical
   * layout. @default 640 */
  breakpoint?: number;
  /** Animation speed multiplier. `2` is twice as fast, `0.5` half. @default 1 */
  speed?: number;
  /** Cycle the open panel on a timer. Pauses on hover/focus and under
   * reduced-motion. @default false */
  autoplay?: boolean;
  /** Milliseconds each panel stays open while autoplaying. @default 4000 */
  autoplayInterval?: number;
  /** Index expanded on mount. @default 0 */
  defaultIndex?: number;
  /** Thickness of a collapsed bar, in px — its width when horizontal, its
   * height when vertical. @default 64 */
  collapsedWidth?: number;
  /** Panel height, in px. Horizontal layout only — stacked panels hug their own
   * copy. @default 500 */
  height?: number;
  /** Gap between panels, in px. @default 12 */
  gap?: number;
  /** Corner radius of each panel, in px. @default 16 */
  radius?: number;
  /** Label for the story link. @default "Read the story" */
  linkLabel?: string;
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const BASE_SIZE_MS = 560;
const BASE_FADE_MS = 420;
const BASE_STAGGER_MS = 90;
const LOGO_SIZE = 32;
// Layout width the expanded content is laid out at, so text never re-wraps
// while a panel animates its width — the panel's `overflow: hidden` just clips
// it. Capped to what the row can actually spend on the open panel (see
// `contentWidth`). Vertical panels animate height instead, so their content
// spans full width.
const CONTENT_WIDTH = 620;
const MIN_CONTENT_WIDTH = 260;
// Container width under which the vertical layout tightens its padding.
const COMPACT_WIDTH = 420;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) return 1;
  return Math.min(Math.max(speed, 0.25), 4);
}

/**
 * A horizontal accordion of customer stories: brand-colored bars that expand —
 * on hover, focus, or click — to reveal a quote, author, and link. Data-driven,
 * so each panel carries its own accent color. The logo stays pinned while the
 * text reveals with a staggered slide-up cascade; optional autoplay cycles it.
 * On narrow containers the panels stack and expand vertically instead.
 */
export function TestimonialAccordion({
  testimonials,
  trigger = "hover",
  orientation = "auto",
  breakpoint = 640,
  speed = 1,
  autoplay = false,
  autoplayInterval = 4000,
  defaultIndex = 0,
  collapsedWidth = 64,
  height = 500,
  gap = 12,
  radius = 16,
  linkLabel = "Read the story",
  className,
  style,
  ...props
}: TestimonialAccordionProps) {
  const reduced = useReducedMotion();
  const count = testimonials.length;
  const [active, setActive] = useState(() =>
    Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)),
  );
  const [paused, setPaused] = useState(false);
  const [rootWidth, setRootWidth] = useState(0);
  const [openHeights, setOpenHeights] = useState<number[]>([]);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // Container-based, not viewport-based, so the accordion also stacks — and
  // sizes its copy — when placed in a narrow column on a wide screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setRootWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Width 0 is the first paint, before the observer reports: stay horizontal
  // rather than flashing the stacked layout on every mount.
  const vertical =
    orientation === "vertical" ||
    (orientation === "auto" && rootWidth > 0 && rootWidth < breakpoint);

  // Stacked panels hug their own copy — a fixed height would leave a long quote
  // clipped and a short one floating in dead space. CSS can't tween to `auto`,
  // so each panel's natural content height is measured and animated to in px.
  useEffect(() => {
    if (!vertical) return;
    const els = contentRefs.current.slice(0, count);
    const measure = () =>
      setOpenHeights((prev) => {
        const next = els.map((el) => el?.offsetHeight ?? 0);
        return next.every((h, i) => h === prev[i]) && next.length === prev.length
          ? prev
          : next;
      });
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of els) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [vertical, count]);

  // Advance the open panel on a timer, but never while the user is interacting
  // or when the OS asks for reduced motion (autoplay is a motion effect).
  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % count),
      Math.max(1200, autoplayInterval),
    );
    return () => window.clearInterval(id);
  }, [autoplay, paused, reduced, count, autoplayInterval]);

  const s = clampSpeed(speed);
  const sizeMs = Math.round(BASE_SIZE_MS / s);
  const fadeMs = Math.round(BASE_FADE_MS / s);
  const staggerMs = Math.round(BASE_STAGGER_MS / s);
  const resting = reduced ? "none" : "translateY(26px)";
  // Center the pinned logo inside a collapsed bar; the text column shares this
  // inset so nothing shifts between states. Horizontal bars center it on the
  // x-axis (with a floor, since a thin bar still needs breathing room from the
  // edge), vertical bars center it exactly on the y-axis.
  const padCross = Math.max(16, Math.round((collapsedWidth - LOGO_SIZE) / 2));
  const padTop = Math.max(8, Math.round((collapsedWidth - LOGO_SIZE) / 2));

  // What the row has left for the open panel once every collapsed bar and gap
  // is paid for. Laying the content out wider than that only clips it.
  const openWidth = rootWidth
    ? rootWidth - (count - 1) * (collapsedWidth + gap)
    : CONTENT_WIDTH;
  const contentWidth = Math.max(
    MIN_CONTENT_WIDTH,
    Math.min(CONTENT_WIDTH, openWidth),
  );
  const compact = vertical && rootWidth > 0 && rootWidth < COMPACT_WIDTH;
  const padInline = compact ? 16 : 20;
  const blockGap = compact ? 20 : 24;
  // Sized off the container the quote actually lives in, not the viewport: a
  // narrow column on a 4K screen should not get 29px display text. Stacked
  // panels stay in reading sizes — the quote is body copy there, not a display
  // line the way it is across a wide open panel.
  const quoteSize = vertical
    ? Math.round(Math.min(20, Math.max(16, (rootWidth || 430) * 0.038)))
    : Math.round(Math.min(29, Math.max(19, contentWidth * 0.047)));
  // Stacked panels drop a step down the type scale across the board — 13px meta
  // copy set against a 20px quote reads heavy on a phone.
  const metaClass = vertical ? "text-[12.5px]" : "text-[13px]";

  const sizeTransition = reduced
    ? undefined
    : `${vertical ? "height" : "flex-grow"} ${sizeMs}ms ${EASE}`;
  const overlayTransition = reduced ? undefined : `opacity ${fadeMs}ms ${EASE}`;
  const revealTransition = (delay: number): string | undefined =>
    reduced
      ? undefined
      : `opacity ${fadeMs}ms ${EASE} ${delay}ms, transform ${fadeMs}ms ${EASE} ${delay}ms`;

  const revealStyle = (isActive: boolean, delay: number): CSSProperties => ({
    opacity: isActive ? 1 : 0,
    transform: isActive ? "none" : resting,
    transformOrigin: "left center",
    transition: revealTransition(delay),
    willChange: "opacity, transform",
  });

  const onKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const dir =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!dir) return;
    event.preventDefault();
    buttonsRef.current[(index + dir + count) % count]?.focus();
  };

  const onBlurCapture = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPaused(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full overflow-hidden",
        vertical ? "flex-col" : "flex-nowrap",
        className,
      )}
      style={{ gap, ...style }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={onBlurCapture}
      {...props}
    >
      {testimonials.map((item, index) => {
        const isActive = index === active;
        // Vertical panels animate an explicit height (both endpoints are px
        // values — the open one measured from the copy); horizontal ones animate
        // flex-grow against the row width.
        const panelStyle: CSSProperties = vertical
          ? {
              height: isActive ? openHeights[index] || height : collapsedWidth,
              width: "100%",
              borderRadius: radius,
              background: item.accent,
              // Skip the transition on the frame before the copy is measured,
              // so the open panel doesn't animate from its fallback height.
              transition: openHeights.length ? sizeTransition : undefined,
            }
          : {
              flexGrow: isActive ? 1 : 0,
              flexBasis: 0,
              minWidth: collapsedWidth,
              height,
              borderRadius: radius,
              background: item.accent,
              transition: sizeTransition,
            };
        const gradient = `linear-gradient(150deg, color-mix(in srgb, ${item.accent} 88%, #fff) 0%, ${item.accent} 42%, color-mix(in srgb, ${item.accent} 76%, #000) 100%)`;

        return (
          <button
            key={item.id}
            ref={(el) => {
              buttonsRef.current[index] = el;
            }}
            type="button"
            aria-expanded={isActive}
            aria-label={item.name}
            onClick={() => setActive(index)}
            onFocus={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            onPointerEnter={
              trigger === "hover" ? () => setActive(index) : undefined
            }
            className="group relative shrink-0 cursor-pointer appearance-none overflow-hidden border-0 p-0 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-0"
            style={panelStyle}
          >
            {/* Solid accent → gradient as a fading overlay: CSS can't tween a
                color into a gradient, so animate an overlay's opacity instead. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: gradient,
                opacity: isActive ? 1 : 0,
                transition: overlayTransition,
              }}
            />

            <div
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className={cn(
                "absolute flex flex-col",
                vertical ? "inset-x-0 top-0" : "inset-y-0 left-0 justify-between",
              )}
              style={
                vertical
                  ? {
                      gap: blockGap,
                      paddingLeft: padInline,
                      paddingTop: padTop,
                      paddingRight: padInline,
                      paddingBottom: compact ? 24 : 28,
                    }
                  : {
                      width: contentWidth,
                      paddingLeft: padCross,
                      paddingTop: 24,
                      paddingRight: 28,
                      paddingBottom: 30,
                    }
              }
            >
              <div>
                {/* Pinned: same element, same position in both states. */}
                <Mark item={item} />
                <div aria-hidden={!isActive} style={revealStyle(isActive, 0)}>
                  <h3
                    className={cn(
                      "font-semibold tracking-tight",
                      vertical ? "mt-5 text-[15px]" : "mt-6 text-base",
                    )}
                  >
                    {item.name}
                  </h3>
                  {/* Stacked panels wrap against the container instead of a
                      measure cap — capping there would waste the narrow width
                      the layout already has. */}
                  <p
                    className={cn(
                      "mt-1 font-medium leading-snug text-white/55",
                      metaClass,
                      vertical ? undefined : "max-w-[46ch]",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                aria-hidden={!isActive}
                style={revealStyle(isActive, staggerMs)}
              >
                <p
                  className={cn(
                    "font-medium tracking-[-0.01em]",
                    vertical ? "leading-[1.35]" : "max-w-[30ch] leading-[1.18]",
                  )}
                  style={{ fontSize: quoteSize }}
                >
                  {item.quote}
                </p>

                <div className={cn("flex items-center gap-3", compact ? "mt-5" : "mt-6")}>
                  <Avatar item={item} small={vertical} />
                  <span className={cn("font-semibold text-white/80", metaClass)}>
                    {item.author}
                    {item.role ? (
                      <span className="font-medium text-white/50">
                        {" "}
                        {item.role}
                      </span>
                    ) : null}
                  </span>
                </div>

                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={isActive ? 0 : -1}
                    onClick={(event) => event.stopPropagation()}
                    className={cn(
                      "inline-flex items-center gap-1.5 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white",
                      metaClass,
                      vertical ? "mt-4" : "mt-5",
                    )}
                  >
                    {linkLabel}
                    <span aria-hidden>→</span>
                  </a>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

TestimonialAccordion.displayName = "TestimonialAccordion";

function Mark({ item }: { item: Testimonial }) {
  if (item.logo) {
    return (
      <span className="flex h-8 w-8 items-center justify-center text-white [&_svg]:h-full [&_svg]:w-full">
        {item.logo}
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white">
      {item.name[0]?.toUpperCase()}
    </span>
  );
}

function Avatar({ item, small }: { item: Testimonial; small?: boolean }) {
  const box = small ? "h-6 w-6" : "h-7 w-7";
  if (item.avatar) {
    return (
      // Plain <img>: the copied component stays dependency-free of next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.avatar}
        alt={item.author}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-white/25", box)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white/20 font-bold text-white ring-1 ring-white/25",
        small ? "text-[9px]" : "text-[10px]",
        box,
      )}
    >
      {initials(item.author)}
    </span>
  );
}
