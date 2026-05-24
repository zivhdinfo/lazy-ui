"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type Transition,
} from "motion/react";

import { cn } from "@/lib/utils";
import { getStrictContext } from "@/lib/get-strict-context";

export type Side = "top" | "right" | "bottom" | "left";
export type SideOrAuto = Side | "auto";
export type Align = "start" | "center" | "end";

export type ActiveTooltip = {
  id: string;
  triggerEl: HTMLElement;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  content: React.ReactNode;
  className?: string;
  arrow: boolean;
};

type TooltipContextValue = {
  active: ActiveTooltip | null;
  show: (data: ActiveTooltip) => void;
  hide: () => void;
  hideImmediate: () => void;
  providerId: string;
  transition: Transition;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  slideBetween: boolean;
};

const [
  GlobalTooltipProvider,
  useTooltipContext,
  useOptionalTooltipContext,
] = getStrictContext<TooltipContextValue>("TooltipProvider");

export { useTooltipContext, useOptionalTooltipContext };

export type TooltipProviderProps = {
  children: React.ReactNode;
  /** Delay before the first tooltip opens on hover (ms). @default 150 */
  openDelay?: number;
  /**
   * Time window after a tooltip closes during which the next hover opens
   * with no delay (ms). Also the close-out timeout. @default 300
   */
  closeDelay?: number;
  /** Spring transition shared by the singleton overlay's enter/exit/slide. */
  transition?: Transition;
  /**
   * When true, moving from trigger A to trigger B slides the same overlay
   * between positions (shared `layoutId`). When false, A fades out and B
   * fades in independently. @default true
   */
  slideBetween?: boolean;
};

export function TooltipProvider({
  children,
  openDelay = 150,
  closeDelay = 300,
  transition = { type: "spring", stiffness: 300, damping: 30 },
  slideBetween = true,
}: TooltipProviderProps) {
  const providerId = React.useId();
  const [active, setActive] = React.useState<ActiveTooltip | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const lastCloseAt = React.useRef(0);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const clearTimer = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const show = React.useCallback(
    (data: ActiveTooltip) => {
      clearTimer();
      if (active != null) {
        setActive(data);
        return;
      }
      const sinceClose = Date.now() - lastCloseAt.current;
      const delay = sinceClose < closeDelay ? 0 : openDelay;
      if (delay <= 0) {
        setActive(data);
      } else {
        timeoutRef.current = window.setTimeout(() => {
          setActive(data);
          timeoutRef.current = null;
        }, delay);
      }
    },
    [openDelay, closeDelay, active],
  );

  const hide = React.useCallback(() => {
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      setActive(null);
      lastCloseAt.current = Date.now();
      timeoutRef.current = null;
    }, closeDelay);
  }, [closeDelay]);

  const hideImmediate = React.useCallback(() => {
    clearTimer();
    setActive(null);
    lastCloseAt.current = Date.now();
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideImmediate();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", hideImmediate, true);
    window.addEventListener("resize", hideImmediate, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", hideImmediate, true);
      window.removeEventListener("resize", hideImmediate, true);
    };
  }, [hideImmediate]);

  React.useEffect(() => {
    cursorX.set(0);
    cursorY.set(0);
  }, [active?.id, cursorX, cursorY]);

  const value = React.useMemo<TooltipContextValue>(
    () => ({
      active,
      show,
      hide,
      hideImmediate,
      providerId,
      transition,
      cursorX,
      cursorY,
      slideBetween,
    }),
    [
      active,
      show,
      hide,
      hideImmediate,
      providerId,
      transition,
      cursorX,
      cursorY,
      slideBetween,
    ],
  );

  return (
    <GlobalTooltipProvider value={value}>
      {children}
      <TooltipOverlay />
    </GlobalTooltipProvider>
  );
}

type Position = { left: number; top: number; resolvedSide: Side };

function computePosition(data: ActiveTooltip, contentRect: DOMRect): Position {
  const trigger = data.triggerEl.getBoundingClientRect();
  const { side, sideOffset, align, alignOffset } = data;
  let left = 0;
  let top = 0;
  switch (side) {
    case "top":
      top = trigger.top - contentRect.height - sideOffset;
      left = trigger.left + trigger.width / 2 - contentRect.width / 2;
      if (align === "start") left = trigger.left;
      else if (align === "end") left = trigger.right - contentRect.width;
      left += alignOffset;
      break;
    case "bottom":
      top = trigger.bottom + sideOffset;
      left = trigger.left + trigger.width / 2 - contentRect.width / 2;
      if (align === "start") left = trigger.left;
      else if (align === "end") left = trigger.right - contentRect.width;
      left += alignOffset;
      break;
    case "left":
      left = trigger.left - contentRect.width - sideOffset;
      top = trigger.top + trigger.height / 2 - contentRect.height / 2;
      if (align === "start") top = trigger.top;
      else if (align === "end") top = trigger.bottom - contentRect.height;
      top += alignOffset;
      break;
    case "right":
      left = trigger.right + sideOffset;
      top = trigger.top + trigger.height / 2 - contentRect.height / 2;
      if (align === "start") top = trigger.top;
      else if (align === "end") top = trigger.bottom - contentRect.height;
      top += alignOffset;
      break;
  }

  let resolvedSide: Side = side;
  const margin = 8;
  if (typeof window !== "undefined") {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fits = (s: Side) => {
      switch (s) {
        case "top":
          return trigger.top - contentRect.height - sideOffset >= margin;
        case "bottom":
          return trigger.bottom + sideOffset + contentRect.height <= vh - margin;
        case "left":
          return trigger.left - contentRect.width - sideOffset >= margin;
        case "right":
          return trigger.right + sideOffset + contentRect.width <= vw - margin;
      }
    };
    const opposite: Record<Side, Side> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    if (!fits(side) && fits(opposite[side])) {
      resolvedSide = opposite[side];
      return computePosition({ ...data, side: resolvedSide }, contentRect);
    }
    left = Math.min(Math.max(left, margin), vw - contentRect.width - margin);
    top = Math.min(Math.max(top, margin), vh - contentRect.height - margin);
  }

  return { left, top, resolvedSide };
}

function transformOriginFor(side: Side): string {
  switch (side) {
    case "top":
      return "50% 100%";
    case "bottom":
      return "50% 0%";
    case "left":
      return "100% 50%";
    case "right":
      return "0% 50%";
  }
}

function TooltipOverlay() {
  const { active, slideBetween } = useTooltipContext();
  // active is null on SSR/initial hydration, so the portal renders nothing —
  // no mismatch. Only check for document at runtime in case React renders
  // this in a non-DOM environment.
  if (typeof document === "undefined") return null;

  // slideBetween true (default): constant key keeps the same overlay across
  // trigger changes. The motion.div's `animate.left` / `animate.top` then
  // springs to each new position — that's the slide.
  // false: key by active.id forces a remount per trigger, so AnimatePresence
  // fades the old one out while the new one fades in at its own position.
  return createPortal(
    <AnimatePresence>
      {active && (
        <TooltipOverlayInner
          key={slideBetween ? "tooltip-overlay" : `tooltip-overlay-${active.id}`}
          data={active}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

const TOOLTIP_CLASSES =
  "pointer-events-none inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background";

function TooltipOverlayInner({ data }: { data: ActiveTooltip }) {
  const { transition, cursorX, cursorY } = useTooltipContext();
  const ref = React.useRef<HTMLDivElement>(null);
  // null = "not yet measured". We render the content offscreen+invisible first
  // so we can read its real size, then re-render at the computed position. This
  // avoids the (0,0) flash and the wrong-bounds layout animation that comes
  // from guessing the initial position.
  const [position, setPosition] = React.useState<Position | null>(null);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition(computePosition(data, rect));
  }, [data]);

  const springX = useSpring(cursorX, { stiffness: 200, damping: 17 });
  const springY = useSpring(cursorY, { stiffness: 200, damping: 17 });

  if (!position) {
    // Measurement pass: render the content with the same classes so size
    // matches the final tooltip, but parked offscreen and invisible.
    return (
      <div
        ref={ref}
        className={cn(TOOLTIP_CLASSES, data.className)}
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          opacity: 0,
        }}
      >
        {data.content}
        {data.arrow && <TooltipArrow side={data.side} />}
      </div>
    );
  }

  const resolvedSide = position.resolvedSide;

  return (
    <motion.div
      ref={ref}
      data-slot="tooltip-content"
      data-side={resolvedSide}
      data-align={data.align}
      data-state="open"
      // initial captures the computed position so the first paint is exactly
      // at the final spot — no slide from origin.
      initial={{
        opacity: 0,
        scale: 0.5,
        left: position.left,
        top: position.top,
      }}
      // animate's left/top targets are what motion springs to on subsequent
      // re-renders. When `data` changes (trigger A → B), useLayoutEffect runs
      // and updates `position`; motion sees the new left/top and slides.
      animate={{
        opacity: 1,
        scale: 1,
        left: position.left,
        top: position.top,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={transition}
      style={{
        position: "fixed",
        zIndex: 50,
        transformOrigin: transformOriginFor(resolvedSide),
        x: springX,
        y: springY,
      }}
      className={cn(TOOLTIP_CLASSES, data.className)}
    >
      {data.content}
      {data.arrow && <TooltipArrow side={resolvedSide} />}
    </motion.div>
  );
}

function TooltipArrow({ side }: { side: Side }) {
  const positionStyle: React.CSSProperties = (() => {
    switch (side) {
      case "top":
        return { bottom: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
      case "bottom":
        return { top: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
      case "left":
        return { right: -4, top: "50%", transform: "translateY(-50%) rotate(45deg)" };
      case "right":
        return { left: -4, top: "50%", transform: "translateY(-50%) rotate(45deg)" };
    }
  })();

  return (
    <span
      data-slot="tooltip-arrow"
      aria-hidden
      className="pointer-events-none absolute size-2 rounded-[2px] bg-foreground"
      style={positionStyle}
    />
  );
}

export type TooltipPortalProps = {
  children?: React.ReactNode;
};

export function TooltipPortal({ children }: TooltipPortalProps) {
  return <>{children}</>;
}

export type TooltipContentMotionProps = HTMLMotionProps<"div">;

export {
  TooltipArrow,
};
