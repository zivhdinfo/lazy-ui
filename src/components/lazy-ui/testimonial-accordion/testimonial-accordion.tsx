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
  /** Animation speed multiplier. `2` is twice as fast, `0.5` half. @default 1 */
  speed?: number;
  /** Cycle the open panel on a timer. Pauses on hover/focus and under
   * reduced-motion. @default false */
  autoplay?: boolean;
  /** Milliseconds each panel stays open while autoplaying. @default 4000 */
  autoplayInterval?: number;
  /** Index expanded on mount. @default 0 */
  defaultIndex?: number;
  /** Width of a collapsed bar, in px. @default 64 */
  collapsedWidth?: number;
  /** Panel height, in px. @default 500 */
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
// Fixed layout width for the expanded content so text never re-wraps while a
// panel animates its width — the panel's `overflow: hidden` just clips it.
const CONTENT_WIDTH = 620;

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
 */
export function TestimonialAccordion({
  testimonials,
  trigger = "hover",
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
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

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
  // inset so nothing shifts horizontally between states.
  const padLeft = Math.max(16, Math.round((collapsedWidth - LOGO_SIZE) / 2));

  const sizeTransition = reduced ? undefined : `flex-grow ${sizeMs}ms ${EASE}`;
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
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
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
      className={cn("flex w-full flex-nowrap overflow-hidden", className)}
      style={{ gap, ...style }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={onBlurCapture}
      {...props}
    >
      {testimonials.map((item, index) => {
        const isActive = index === active;
        const panelStyle: CSSProperties = {
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
              className="absolute inset-y-0 left-0 flex flex-col justify-between"
              style={{
                width: CONTENT_WIDTH,
                paddingLeft: padLeft,
                paddingTop: 24,
                paddingRight: 28,
                paddingBottom: 30,
              }}
            >
              <div>
                {/* Pinned: same element, same position in both states. */}
                <Mark item={item} />
                <div aria-hidden={!isActive} style={revealStyle(isActive, 0)}>
                  <h3 className="mt-6 text-base font-semibold tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-1 max-w-[46ch] text-[13px] font-medium leading-snug text-white/55">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                aria-hidden={!isActive}
                style={revealStyle(isActive, staggerMs)}
              >
                <p className="max-w-[30ch] text-[clamp(20px,2.4vw,29px)] font-medium leading-[1.18] tracking-[-0.01em]">
                  {item.quote}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <Avatar item={item} />
                  <span className="text-[13px] font-semibold text-white/80">
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
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
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

function Avatar({ item }: { item: Testimonial }) {
  if (item.avatar) {
    return (
      // Plain <img>: the copied component stays dependency-free of next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.avatar}
        alt={item.author}
        className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/25"
      />
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white ring-1 ring-white/25">
      {initials(item.author)}
    </span>
  );
}
