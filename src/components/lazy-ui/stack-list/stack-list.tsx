"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
  type Transition,
  type Variants,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface StackListItem {
  /** Stable identifier; also used as the React key. */
  id: string | number;
  /** Item content rendered inside the card. */
  content: ReactNode;
}

/**
 * Entrance/exit animation.
 * - `blur` — soft defocus → focus sweep. Default.
 * - `scale` — visible pop: zooms from 0.55× into place.
 * - `bounce` — directional translate with a soft spring overshoot.
 */
export type StackListAnimation = "blur" | "scale" | "bounce";
export type StackListEnterFrom = "top" | "bottom" | "left" | "right";
export type StackListAlign = "top" | "center" | "bottom";
export type StackListHoverEffect = "none" | "scale" | "lift";
export type StackListClickEffect = "none" | "ripple" | "press";

export interface StackListProps {
  /** Items rendered in the stack. The first entry sits on top. */
  items: StackListItem[];
  /** Entrance/exit animation. @default "blur" */
  animation?: StackListAnimation;
  /** Direction items animate in from (used by `bounce`). @default "top" */
  enterFrom?: StackListEnterFrom;
  /** Animation duration in seconds (ignored for spring animations). @default 0.65 */
  duration?: number;
  /** Cubic-bezier easing control points. @default [0.22, 1, 0.36, 1] */
  easing?: [number, number, number, number];
  /** Vertical alignment within the container when in list mode. @default "center" */
  align?: StackListAlign;
  /** Delay between auto-inserted items in ms. `0` disables auto-insertion. @default 2000 */
  autoInsertDelay?: number;
  /**
   * Maximum visible items. In list mode older items roll off the bottom; in
   * stack mode older items recede behind the front card until they hit
   * `stackDepth` and then unmount.
   * @default 6
   */
  maxItems?: number;
  /** Pause auto-insertion while the pointer is over the list. @default false */
  pauseOnHover?: boolean;
  /** Hover effect applied to the front card. @default "none" */
  hoverEffect?: StackListHoverEffect;
  /** Click effect applied to the front card. @default "none" */
  clickEffect?: StackListClickEffect;
  /**
   * Stack the cards on top of each other (shadcn-toast style) instead of
   * rendering them as a scrolling list. Hovering the container fans the
   * stacked cards out into a list; the pointer leaving collapses them back.
   * The stack anchors on the side `enterFrom` points to (top → anchored at
   * top and fans downward, bottom → anchored at bottom and fans upward).
   * @default true
   */
  stack?: boolean;
  /**
   * How many cards are visible in the collapsed cascade (front card
   * included). Cards beyond this depth still live in state and reveal when
   * the stack expands on hover — they just hide behind the visible cascade
   * while collapsed. Only used when `stack` is true.
   * @default 3
   */
  stackDepth?: number;
  /** Render soft top/bottom fades against `fadeColor`. List mode only. @default false */
  fadeEdges?: boolean;
  /** Fade gradient height in pixels. @default 64 */
  fadeSize?: number;
  /** Solid color the fade gradient resolves to. Required for `fadeEdges` to be visible. */
  fadeColor?: string;
  /** Enable horizontal swipe-to-dismiss on each card. @default false */
  dismissOnSwipe?: boolean;
  /** Pixel offset required to commit a dismiss on release. @default 100 */
  dismissThreshold?: number;
  /** Fires when a card is dismissed via swipe. */
  onDismiss?: (item: StackListItem) => void;
  /** Fires when a card is clicked or activated via keyboard. */
  onItemClick?: (item: StackListItem) => void;
  /** Vertical gap between cards in pixels (list mode + expanded stack). @default 12 */
  gap?: number;
  /** Container height. Number = px, string passes through. @default "min(600px, 80vh)" */
  height?: string | number;
  /** Custom card renderer. Defaults to a plain text row. */
  renderItem?: (item: StackListItem) => ReactNode;
  /** Extra class names merged onto the root. */
  className?: string;
  /** Extra class names merged onto the outer frame of every card. */
  itemClassName?: string;
  /** Extra class names merged onto the inner content surface of every card. */
  innerClassName?: string;
}

const DEFAULT_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWIPE_X_RANGE = [-150, 0, 150] as const;
const SWIPE_OPACITY = [0, 1, 0] as const;
const SWIPE_ROTATE = [-6, 0, 6] as const;
const MAX_RIPPLES = 5;
const RIPPLE_FALLBACK_MS = 900;
const PRESS_SCALE = 0.975;
const STACK_OFFSET_Y = 10;
const STACK_SCALE_STEP = 0.045;
const STACK_OPACITY_STEP = 0.2;
const FALLBACK_CARD_HEIGHT = 80;

interface RippleData {
  id: number;
  x: number;
  y: number;
  size: number;
}

function Ripple({
  id,
  x,
  y,
  size,
  onComplete,
}: RippleData & { onComplete: (id: number) => void }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-full bg-black/15 dark:bg-white/15"
      style={{ left: x, top: y, translateX: "-50%", translateY: "-50%" }}
      initial={{ width: 0, height: 0, opacity: 0.45 }}
      animate={{ width: size, height: size, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => onComplete(id)}
    />
  );
}

interface CardProps {
  item: StackListItem;
  renderContent: (item: StackListItem) => ReactNode;
  hoverEffect: StackListHoverEffect;
  clickEffect: StackListClickEffect;
  dismissOnSwipe: boolean;
  dismissThreshold: number;
  reduced: boolean;
  /** Disables hover/click interactions for cards behind the front in stack mode. */
  inert?: boolean;
  /** Forwarded to measure card height in stack mode. */
  measureRef?: (el: HTMLDivElement | null) => void;
  itemClassName?: string;
  innerClassName?: string;
  onDismiss?: (item: StackListItem) => void;
  onItemClick?: (item: StackListItem) => void;
}

function Card({
  item,
  renderContent,
  hoverEffect,
  clickEffect,
  dismissOnSwipe,
  dismissThreshold,
  reduced,
  inert = false,
  measureRef,
  itemClassName,
  innerClassName,
  onDismiss,
  onItemClick,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const ripplesRef = useRef<RippleData[]>([]);
  const ripplesIdRef = useRef(0);
  const fallbackTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [pressed, setPressed] = useState(false);

  const dragX = useMotionValue(0);
  const contentOpacity = useTransform(
    dragX,
    [...SWIPE_X_RANGE],
    [...SWIPE_OPACITY],
  );
  const contentRotate = useTransform(
    dragX,
    [...SWIPE_X_RANGE],
    [...SWIPE_ROTATE],
  );
  const hintOpacity = useTransform(
    dragX,
    [
      -dismissThreshold,
      -dismissThreshold * 0.4,
      0,
      dismissThreshold * 0.4,
      dismissThreshold,
    ],
    [1, 0, 0, 0, 1],
  );

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      cardRef.current = el;
      measureRef?.(el);
    },
    [measureRef],
  );

  useEffect(() => {
    const timers = fallbackTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const removeRipple = useCallback((id: number) => {
    const timer = fallbackTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      fallbackTimersRef.current.delete(id);
    }
    ripplesRef.current = ripplesRef.current.filter((r) => r.id !== id);
    setRipples(ripplesRef.current);
  }, []);

  const spawnRipple = useCallback(
    (clientX: number, clientY: number) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const id = ripplesIdRef.current++;
      const next = [
        ...ripplesRef.current,
        { id, x: clientX - rect.left, y: clientY - rect.top, size },
      ].slice(-MAX_RIPPLES);
      ripplesRef.current = next;
      setRipples(next);
      const t = setTimeout(() => removeRipple(id), RIPPLE_FALLBACK_MS);
      fallbackTimersRef.current.set(id, t);
    },
    [removeRipple],
  );

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (inert) return;
      if (clickEffect === "ripple" && !reduced) {
        spawnRipple(e.clientX, e.clientY);
      }
      onItemClick?.(item);
    },
    [inert, clickEffect, reduced, onItemClick, item, spawnRipple],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (inert || !onItemClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onItemClick(item);
      }
    },
    [inert, onItemClick, item],
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!dismissOnSwipe || inert) return;
      if (Math.abs(info.offset.x) > dismissThreshold) onDismiss?.(item);
    },
    [dismissOnSwipe, inert, dismissThreshold, onDismiss, item],
  );

  const whileHover = useMemo(() => {
    if (reduced || inert) return undefined;
    if (hoverEffect === "scale") return { scale: 1.02 };
    if (hoverEffect === "lift")
      return {
        y: -2,
        scale: 1.01,
        boxShadow: "0 18px 40px -22px rgba(0,0,0,0.55)",
      };
    return undefined;
  }, [hoverEffect, reduced, inert]);

  const whileTap = useMemo(() => {
    if (reduced || inert || clickEffect !== "press") return undefined;
    return { scale: PRESS_SCALE };
  }, [clickEffect, reduced, inert]);

  const interactive = Boolean(onItemClick) && !inert;
  const dragEnabled = dismissOnSwipe && !inert;

  return (
    <motion.div
      ref={setRef}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        // Outer frame — opaque card with a subtle gradient sheen + soft border.
        "relative isolate w-full overflow-hidden rounded-2xl p-1.5",
        "bg-white dark:bg-neutral-950",
        "bg-linear-to-br from-black/[0.04] to-transparent dark:from-white/[0.06] dark:to-white/[0.01]",
        "border border-black/[0.08] dark:border-white/[0.08]",
        "shadow-[0_10px_28px_-14px_rgb(0_0_0_/_0.18),0_2px_6px_-2px_rgb(0_0_0_/_0.08)] dark:shadow-[0_14px_36px_-14px_rgb(0_0_0_/_0.7),0_2px_8px_-2px_rgb(0_0_0_/_0.4)]",
        "translate-z-0 will-change-transform",
        "transition-colors duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#050505]",
        interactive && "cursor-pointer select-none",
        inert && "pointer-events-none",
        itemClassName,
      )}
      drag={dragEnabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.45}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={() => clickEffect === "press" && !inert && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      animate={{ scale: pressed && !reduced ? PRESS_SCALE : 1 }}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={dragEnabled ? { x: dragX } : undefined}
    >
      {dragEnabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-5"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Dismiss
          </span>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Dismiss
          </span>
        </motion.div>
      )}

      {/* Inner content surface — second layer over the solid outer card. */}
      <motion.div
        className={cn(
          "relative w-full rounded-xl p-4 sm:p-5",
          "bg-linear-to-br from-black/[0.03] to-transparent dark:from-white/[0.05] dark:to-transparent",
          "border border-black/[0.05] dark:border-white/[0.06]",
          "text-black/90 dark:text-white/95",
          "shadow-xs",
          "translate-z-0 will-change-transform",
          innerClassName,
        )}
        style={
          dragEnabled
            ? { opacity: contentOpacity, rotateZ: contentRotate }
            : undefined
        }
      >
        {renderContent(item)}
      </motion.div>

      {ripples.map((r) => (
        <Ripple key={r.id} {...r} onComplete={removeRipple} />
      ))}
    </motion.div>
  );
}

function defaultRender(item: StackListItem): ReactNode {
  return (
    <div className="text-[13px] text-black/85 dark:text-white/85">
      {item.content}
    </div>
  );
}

function buildVariants(
  animation: StackListAnimation,
  enterFrom: StackListEnterFrom,
  reduced: boolean,
): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  if (animation === "scale") {
    // Visible pop — no opacity blend so the size change carries the entrance.
    return {
      initial: { opacity: 1, scale: 0.55 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.85 },
    };
  }

  if (animation === "bounce") {
    const offset =
      enterFrom === "left"
        ? { x: -36, y: 0 }
        : enterFrom === "right"
          ? { x: 36, y: 0 }
          : enterFrom === "bottom"
            ? { x: 0, y: 26 }
            : { x: 0, y: -26 };
    return {
      initial: { opacity: 0, scale: 0.92, ...offset },
      animate: { opacity: 1, scale: 1, x: 0, y: 0 },
      exit: { opacity: 0, scale: 0.94, y: 12 },
    };
  }

  // "blur" — default. Soft defocus → focus.
  return {
    initial: { opacity: 0, filter: "blur(16px)", scale: 0.98 },
    animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
    exit: { opacity: 0, filter: "blur(10px)", scale: 0.98 },
  };
}

/**
 * StackList — vertical card stack with motion-first entrance/exit, optional
 * auto-injection, hover/click effects, swipe-to-dismiss, and an opt-in
 * shadcn-toast stacking mode that fans the cards out on hover.
 *
 * Honors `prefers-reduced-motion`: animations collapse to a quick opacity swap,
 * hover/press transforms drop, and the ripple is suppressed (clicks still fire).
 */
export function StackList({
  items,
  animation = "blur",
  enterFrom = "top",
  duration = 0.65,
  easing = DEFAULT_EASING,
  align = "center",
  autoInsertDelay = 2000,
  maxItems = 6,
  pauseOnHover = false,
  hoverEffect = "none",
  clickEffect = "none",
  stack = true,
  stackDepth = 3,
  fadeEdges = false,
  fadeSize = 64,
  fadeColor,
  dismissOnSwipe = false,
  dismissThreshold = 100,
  onDismiss,
  onItemClick,
  gap = 12,
  height = "min(600px, 80vh)",
  renderItem,
  className,
  itemClassName,
  innerClassName,
}: StackListProps) {
  const reduced = useReducedMotion() ?? false;

  const [visible, setVisible] = useState<StackListItem[]>(() => items);
  const [expanded, setExpanded] = useState(false);
  const [cardHeight, setCardHeight] = useState<number>(FALLBACK_CARD_HEIGHT);

  // Refs let the auto-insert interval read latest props without tearing down
  // the interval (so adjusting sliders doesn't reset the stack).
  const poolRef = useRef(items);
  const maxRef = useRef(maxItems);
  const pausedRef = useRef(false);
  const counterRef = useRef(items.length);
  const measureElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    poolRef.current = items;
  }, [items]);

  useEffect(() => {
    maxRef.current = maxItems;
  }, [maxItems]);

  useEffect(() => {
    if (autoInsertDelay <= 0) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const pool = poolRef.current;
      if (pool.length === 0) return;
      const template = pool[counterRef.current % pool.length];
      const next: StackListItem = {
        id: `${template.id}-${counterRef.current}`,
        content: template.content,
      };
      counterRef.current += 1;
      setVisible((prev) => [next, ...prev].slice(0, maxRef.current));
    }, autoInsertDelay);
    return () => clearInterval(id);
  }, [autoInsertDelay]);

  // Measure the front card so the expanded stack lays out at real card height.
  useLayoutEffect(() => {
    const el = measureElRef.current;
    if (!stack || !el) return;
    const apply = () => {
      const h = el.offsetHeight;
      if (h > 0) setCardHeight((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stack, visible.length]);

  const handleDismiss = useCallback(
    (item: StackListItem) => {
      setVisible((prev) => prev.filter((i) => i.id !== item.id));
      onDismiss?.(item);
    },
    [onDismiss],
  );

  const handlePointerEnter = useCallback(() => {
    if (stack) setExpanded(true);
    if (pauseOnHover) pausedRef.current = true;
  }, [stack, pauseOnHover]);

  const handlePointerLeave = useCallback(() => {
    if (stack) setExpanded(false);
    if (pauseOnHover) pausedRef.current = false;
  }, [stack, pauseOnHover]);

  const renderContent = renderItem ?? defaultRender;

  const variants = useMemo(
    () => buildVariants(animation, enterFrom, reduced),
    [animation, enterFrom, reduced],
  );

  const transition = useMemo<Transition>(() => {
    if (reduced) return { duration: 0.15 };
    if (animation === "bounce") {
      return { type: "spring", stiffness: 240, damping: 18, mass: 0.85 };
    }
    if (animation === "scale") {
      return { type: "spring", stiffness: 220, damping: 20, mass: 0.9 };
    }
    return { duration, ease: easing };
  }, [animation, duration, easing, reduced]);

  // Reused for the expand/collapse interpolation in stack mode.
  const stackLayoutTransition = useMemo<Transition>(
    () =>
      reduced
        ? { duration: 0.15 }
        : { type: "spring", stiffness: 260, damping: 28, mass: 0.7 },
    [reduced],
  );

  const verticalAlign =
    align === "center"
      ? "justify-center"
      : align === "bottom"
        ? "justify-end"
        : "justify-start";

  const rootStyle: CSSProperties = useMemo(
    () => ({ height: typeof height === "number" ? `${height}px` : height }),
    [height],
  );

  const fade = useMemo(() => {
    const c = fadeColor ?? "transparent";
    return {
      top: `linear-gradient(to bottom, ${c} 0%, transparent 100%)`,
      bottom: `linear-gradient(to top, ${c} 0%, transparent 100%)`,
    };
  }, [fadeColor]);

  /* ──────────────────────── Stacked (toast-style) ────────────────────────── */

  if (stack) {
    // `stackDepth` controls how many cards are visible in the COLLAPSED
    // cascade. Cards beyond it stay mounted but park behind the visible
    // cascade at opacity 0 — they reveal when the user hovers and the stack
    // expands. This way `maxItems=5, stackDepth=3` still surfaces all five
    // cards on expand instead of permanently hiding the last two.
    const cascadeCount = Math.max(1, Math.min(stackDepth, maxItems));
    // Stack anchor + fan direction follow `enterFrom`: cards entering from the
    // bottom anchor at the bottom and fan upward; everything else anchors at
    // the top and fans downward.
    const fanUp = enterFrom === "bottom";
    const ySign = fanUp ? -1 : 1;
    const containerAlign = fanUp ? "items-end" : "items-start";
    const itemAnchor = fanUp ? "bottom-0" : "top-0";
    const expandedStep = cardHeight + gap;
    const totalCount = visible.length;

    return (
      <div
        className={cn(
          "relative w-full max-w-full",
          "[-webkit-tap-highlight-color:transparent]",
          className,
        )}
        style={rootStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <div
          className={cn("flex h-full w-full justify-center p-4", containerAlign)}
        >
          <div className="relative w-full max-w-md">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((item, idx) => {
                const isFront = idx === 0;
                const inCascade = idx < cascadeCount;
                const parkIdx = cascadeCount - 1;

                const collapsedMag = inCascade
                  ? idx * STACK_OFFSET_Y
                  : parkIdx * STACK_OFFSET_Y;
                const collapsedScale = inCascade
                  ? 1 - idx * STACK_SCALE_STEP
                  : 1 - parkIdx * STACK_SCALE_STEP;
                const collapsedOpacity = !inCascade
                  ? 0
                  : reduced
                    ? 1
                    : Math.max(0.4, 1 - idx * STACK_OPACITY_STEP);

                const targetY =
                  (expanded ? idx * expandedStep : collapsedMag) * ySign;
                const targetScale = expanded ? 1 : collapsedScale;
                const targetOpacity = expanded ? 1 : collapsedOpacity;
                const interactive = expanded || isFront;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={variants.initial}
                    animate={{
                      ...variants.animate,
                      y: targetY,
                      scale: targetScale,
                      opacity: targetOpacity,
                    }}
                    exit={variants.exit}
                    transition={stackLayoutTransition}
                    className={cn(
                      idx === 0
                        ? "relative"
                        : cn("absolute inset-x-0", itemAnchor),
                      "list-none",
                    )}
                    style={{
                      zIndex: totalCount - idx,
                      willChange: "transform, opacity, filter",
                    }}
                  >
                    <Card
                      item={item}
                      renderContent={renderContent}
                      hoverEffect={hoverEffect}
                      clickEffect={clickEffect}
                      dismissOnSwipe={dismissOnSwipe}
                      dismissThreshold={dismissThreshold}
                      reduced={reduced}
                      // Only the front card is interactive while collapsed;
                      // expanding the stack makes every card live.
                      inert={!interactive}
                      measureRef={
                        isFront ? (el) => (measureElRef.current = el) : undefined
                      }
                      itemClassName={itemClassName}
                      innerClassName={innerClassName}
                      onDismiss={handleDismiss}
                      onItemClick={onItemClick}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────── List mode ─────────────────────────────── */

  return (
    <div
      className={cn(
        "relative w-full max-w-full overflow-hidden",
        "[-webkit-tap-highlight-color:transparent]",
        className,
      )}
      style={rootStyle}
    >
      {fadeEdges && fadeColor && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10"
            style={{ height: fadeSize, background: fade.top }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            style={{ height: fadeSize, background: fade.bottom }}
          />
        </>
      )}

      <div
        className={cn(
          "flex h-full w-full flex-col overflow-y-auto overflow-x-hidden overscroll-contain",
          verticalAlign,
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <ul
          className="flex w-full flex-col px-3 py-4 sm:px-4 sm:py-6"
          style={{ gap: `${gap}px` }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={transition}
                style={{ willChange: "transform, opacity, filter" }}
                className="list-none"
              >
                <Card
                  item={item}
                  renderContent={renderContent}
                  hoverEffect={hoverEffect}
                  clickEffect={clickEffect}
                  dismissOnSwipe={dismissOnSwipe}
                  dismissThreshold={dismissThreshold}
                  reduced={reduced}
                  itemClassName={itemClassName}
                  innerClassName={innerClassName}
                  onDismiss={handleDismiss}
                  onItemClick={onItemClick}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

StackList.displayName = "StackList";
