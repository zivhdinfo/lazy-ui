"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type AccordionLayout = "split" | "stacked";

export type AccordionVariant = "line" | "card";

export type AccordionIcon = "chevron" | "plus" | "minus" | "none";

export type AccordionMode = "single" | "multiple";

export type AccordionSize = "sm" | "md" | "lg";

export interface AccordionItem {
  /** Stable key for the row. Falls back to the index. */
  id?: string;
  /** The always-visible trigger label. */
  title: ReactNode;
  /** Revealed on open. Plain text or rich nodes. */
  content: ReactNode;
}

export interface AccordionProps extends HTMLAttributes<HTMLElement> {
  /** Rows rendered top to bottom. */
  items: AccordionItem[];
  /** Section heading above (or beside) the rows. Omit for a bare list. */
  heading?: ReactNode;
  /** Supporting line under the heading. */
  description?: ReactNode;
  /** `"split"` moves the heading into its own column once the container passes
   * 768px; `"stacked"` keeps it above. Needs a heading. @default "stacked" */
  layout?: AccordionLayout;
  /** `"line"` separates rows with hairlines; `"card"` gives each its own
   * bordered tile. @default "line" */
  variant?: AccordionVariant;
  /** Trigger glyph. `"minus"` collapses a plus into a minus. @default "chevron" */
  icon?: AccordionIcon;
  /** `"single"` closes the open row when another opens. @default "single" */
  mode?: AccordionMode;
  /** Index (or indices) open on mount. `null` starts closed. @default null */
  defaultOpen?: number | number[] | null;
  /** Animation speed multiplier. `2` is twice as fast, `0.5` half. @default 1 */
  speed?: number;
  /** Type scale and row rhythm. @default "md" */
  size?: AccordionSize;
  /** Prefix each row with a zero-padded index. @default false */
  numbered?: boolean;
  /** Rail that grows down the side of the open row. @default false */
  indicator?: boolean;
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const BASE_SIZE_MS = 380;
const BASE_FADE_MS = 260;

const SIZES = {
  sm: {
    title: "text-sm",
    content: "text-[13px]",
    row: "py-4",
    contentPad: "pb-4",
    icon: "size-4",
  },
  lg: {
    title: "text-[17px]",
    content: "text-[15px]",
    row: "py-6",
    contentPad: "pb-6",
    icon: "size-5",
  },
  md: {
    title: "text-[15px]",
    content: "text-sm",
    row: "py-5",
    contentPad: "pb-5",
    icon: "size-[18px]",
  },
} as const;

function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) return 1;
  return Math.min(Math.max(speed, 0.25), 4);
}

function normalizeOpen(
  defaultOpen: number | number[] | null,
  mode: AccordionMode,
): number[] {
  if (defaultOpen === null || defaultOpen === undefined) return [];
  const list = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  const clean = list.filter((n) => Number.isInteger(n) && n >= 0);
  return mode === "single" ? clean.slice(0, 1) : clean;
}

/**
 * A disclosure list: hairline or card rows that open one panel at a time.
 * Content-agnostic — FAQ copy, spec tables, filter groups, anything.
 *
 * The open/close motion is pure CSS — a `0fr → 1fr` grid row tween — so no
 * panel is measured, remounted, or animated from JavaScript. Rows stay mounted
 * (and `inert` while closed), which keeps a toggle to one style write.
 */
export function Accordion({
  items,
  heading,
  description,
  layout = "stacked",
  variant = "line",
  icon = "chevron",
  mode = "single",
  defaultOpen = null,
  speed = 1,
  size = "md",
  numbered = false,
  indicator = false,
  className,
  ...props
}: AccordionProps) {
  const reduced = useReducedMotion();
  const uid = useId();
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState<number[]>(() =>
    normalizeOpen(defaultOpen, mode),
  );

  // Re-derive the open set when the props that define it change, without an
  // effect: syncing in an effect would paint one frame of the stale set.
  const resetKey = `${mode}|${
    Array.isArray(defaultOpen) ? defaultOpen.join(",") : String(defaultOpen)
  }`;
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setOpen(normalizeOpen(defaultOpen, mode));
  }

  const s = clampSpeed(speed);
  const sizeMs = reduced ? 0 : Math.round(BASE_SIZE_MS / s);
  const fadeMs = reduced ? 0 : Math.round(BASE_FADE_MS / s);
  const scale = SIZES[size] ?? SIZES.md;
  const isCard = variant === "card";
  const hasHeader = Boolean(heading || description);
  const splitting = layout === "split" && hasHeader;
  const railPad = indicator && !isCard ? "pl-4" : undefined;

  const toggle = (index: number) => {
    setOpen((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index);
      return mode === "single" ? [index] : [...current, index];
    });
  };

  const onKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const count = items.length;
    const next =
      event.key === "ArrowDown"
        ? (index + 1) % count
        : event.key === "ArrowUp"
          ? (index - 1 + count) % count
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    triggersRef.current[next]?.focus();
  };

  return (
    <section
      className={cn("@container w-full text-black dark:text-white", className)}
      {...props}
    >
      <div
        className={cn(
          "grid gap-8",
          splitting && "@3xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @3xl:gap-14",
        )}
      >
        {hasHeader ? (
          <header
            className={cn(splitting && "@3xl:sticky @3xl:top-8 @3xl:self-start")}
          >
            {heading ? (
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-balance @lg:text-2xl">
                {heading}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-black/55 dark:text-white/55">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}

        <div className={cn(isCard && "flex flex-col gap-2")}>
          {items.map((item, index) => {
            const isOpen = open.includes(index);
            const panelId = `${uid}-panel-${index}`;
            const buttonId = `${uid}-trigger-${index}`;

            return (
              <div
                key={item.id ?? index}
                data-open={isOpen}
                className={cn(
                  "group relative",
                  isCard
                    ? "rounded-lg border border-black/[0.09] px-5 transition-colors duration-200 hover:border-black/20 dark:border-white/[0.11] dark:hover:border-white/20"
                    : "border-t border-black/[0.09] last:border-b dark:border-white/[0.11]",
                )}
              >
                {indicator ? (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-0 w-[2px] origin-top rounded-full bg-black transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=false]:scale-y-0 dark:bg-white",
                      isCard ? "inset-y-2" : "inset-y-0",
                    )}
                    style={{ transitionDuration: `${sizeMs}ms` }}
                  />
                ) : null}

                <h3 className={railPad}>
                  <button
                    ref={(el) => {
                      triggersRef.current[index] = el;
                    }}
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={cn(
                      "group/trigger flex w-full cursor-pointer items-center justify-between gap-6 rounded-sm text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white",
                      scale.row,
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      {numbered ? (
                        <span className="shrink-0 text-[11px] font-medium tabular-nums text-black/35 dark:text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "font-medium tracking-[-0.01em]",
                          scale.title,
                        )}
                      >
                        {item.title}
                      </span>
                    </span>
                    <Glyph
                      icon={icon}
                      open={isOpen}
                      ms={fadeMs}
                      className={scale.icon}
                    />
                  </button>
                </h3>

                {/* `0fr → 1fr` instead of an animated height: the browser owns
                    the tween, so nothing here measures the panel or remounts
                    it. `overflow-hidden` is what lets the row collapse to 0. */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    railPad,
                  )}
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transitionDuration: `${sizeMs}ms`,
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      inert={!isOpen}
                      className={cn(
                        "max-w-2xl leading-relaxed text-black/60 dark:text-white/60",
                        scale.content,
                        scale.contentPad,
                      )}
                      style={
                        {
                          opacity: isOpen ? 1 : 0,
                          transition: reduced
                            ? undefined
                            : `opacity ${fadeMs}ms ${EASE} ${isOpen ? Math.round(sizeMs * 0.2) : 0}ms`,
                        } as CSSProperties
                      }
                    >
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Accordion.displayName = "Accordion";

function Glyph({
  icon,
  open,
  ms,
  className,
}: {
  icon: AccordionIcon;
  open: boolean;
  ms: number;
  className?: string;
}) {
  if (icon === "none") return null;

  const shared = cn(
    "shrink-0 text-black/40 transition-[transform,color] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/trigger:text-black/70 dark:text-white/40 dark:group-hover/trigger:text-white/70",
    className,
  );
  const style = { transitionDuration: `${ms}ms` };

  if (icon === "chevron") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={shared}
        style={{ ...style, transform: open ? "rotate(180deg)" : "none" }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  // Plus rotates a quarter turn into a cross; minus keeps the bar horizontal
  // and folds the vertical stroke away instead.
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className={shared}
      style={{
        ...style,
        transform: icon === "plus" && open ? "rotate(45deg)" : "none",
      }}
    >
      <path d="M5 12h14" />
      <path
        d="M12 5v14"
        className="transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          // `fill-box` explicitly: browsers disagree on what `transform-origin:
          // center` resolves to for a bare SVG path without it.
          transformBox: "fill-box",
          transformOrigin: "center",
          transitionDuration: `${ms}ms`,
          transform: icon === "minus" && open ? "scaleY(0)" : "none",
        }}
      />
    </svg>
  );
}
