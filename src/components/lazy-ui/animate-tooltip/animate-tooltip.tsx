"use client";

import * as React from "react";

import {
  TooltipProvider,
  useOptionalTooltipContext,
  useTooltipContext,
  type Align,
  type Side,
  type SideOrAuto,
  type TooltipProviderProps,
} from "@/components/ui/tooltip";

export type AnimateTooltipGroupProps = TooltipProviderProps;

/**
 * AnimateTooltipGroup — wraps multiple `AnimateTooltip`s so they share a single
 * singleton overlay. When the cursor moves from trigger A to trigger B inside
 * the group, the same motion.div slides between positions instead of fading
 * out and fading in again.
 */
export function AnimateTooltipGroup(props: AnimateTooltipGroupProps) {
  return <TooltipProvider {...props} />;
}

export type AnimateTooltipProps = {
  /** The trigger element. Renders without wrapping by default (uses cloneElement). */
  children: React.ReactElement;
  /** Tooltip body. */
  content: React.ReactNode;
  /**
   * Side of the trigger to anchor to. Pass `"auto"` to pick the side based on
   * where the cursor enters the trigger (top half → top, bottom half → bottom,
   * etc.). @default "top"
   */
  side?: SideOrAuto;
  /** Distance from the trigger (px). @default 6 */
  sideOffset?: number;
  /** Alignment along the chosen side. @default "center" */
  align?: Align;
  /** Offset along the alignment axis (px). @default 0 */
  alignOffset?: number;
  /** Delay before opening on hover (ms). @default 150 */
  delayDuration?: number;
  /** Show the small arrow pointing at the trigger. @default false */
  arrow?: boolean;
  /**
   * Let the tooltip drift toward the cursor while it hovers the trigger.
   * `true` follows on both axes; `"x"` or `"y"` constrains to one axis.
   * @default false
   */
  followCursor?: boolean | "x" | "y";
  /** Extra class names merged onto the content. */
  className?: string;
};

function resolveSideFromCursor(
  rect: DOMRect,
  clientX: number,
  clientY: number,
): Side {
  const cx = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
  const cy = (clientY - rect.top - rect.height / 2) / (rect.height / 2);
  if (Math.abs(cy) >= Math.abs(cx)) return cy < 0 ? "top" : "bottom";
  return cx < 0 ? "left" : "right";
}

function AnimateTooltipInner({
  children,
  content,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  arrow = false,
  followCursor = false,
  className,
}: Omit<AnimateTooltipProps, "delayDuration">) {
  const { active, show, hide, cursorX, cursorY } = useTooltipContext();
  const id = React.useId();
  const triggerRef = React.useRef<HTMLElement | null>(null);
  // Tracks the side currently rendered for this trigger so `followCursor` can
  // clamp its drift to the half-axis that points AWAY from the trigger.
  const currentSideRef = React.useRef<Side>("top");

  const setRef = React.useCallback((el: HTMLElement | null) => {
    triggerRef.current = el;
  }, []);

  const isActive = active?.id === id;

  const open = React.useCallback(
    (resolvedSide: Side) => {
      if (!triggerRef.current) return;
      show({
        id,
        triggerEl: triggerRef.current,
        side: resolvedSide,
        sideOffset,
        align,
        alignOffset,
        content,
        className,
        arrow,
      });
    },
    [show, id, sideOffset, align, alignOffset, content, className, arrow],
  );

  const handleEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const resolved =
        side === "auto"
          ? resolveSideFromCursor(rect, e.clientX, e.clientY)
          : side;
      currentSideRef.current = resolved;
      open(resolved);
    },
    [side, open],
  );

  const handleLeave = React.useCallback(() => {
    hide();
  }, [hide]);

  const handleFocus = React.useCallback(() => {
    const fallback: Side = side === "auto" ? "top" : side;
    currentSideRef.current = fallback;
    open(fallback);
  }, [open, side]);

  const handleBlur = React.useCallback(() => {
    hide();
  }, [hide]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isActive || !followCursor) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const renderedSide = currentSideRef.current;
      if (followCursor === "x" || followCursor === true) {
        let ox = (e.clientX - rect.left - rect.width / 2) / 2;
        // Clamp so drift only ever moves AWAY from the trigger — the tooltip
        // must never slide back over its anchor.
        if (renderedSide === "left") ox = Math.min(0, ox);
        else if (renderedSide === "right") ox = Math.max(0, ox);
        cursorX.set(ox);
      }
      if (followCursor === "y" || followCursor === true) {
        let oy = (e.clientY - rect.top - rect.height / 2) / 2;
        if (renderedSide === "top") oy = Math.min(0, oy);
        else if (renderedSide === "bottom") oy = Math.max(0, oy);
        cursorY.set(oy);
      }
    },
    [isActive, followCursor, cursorX, cursorY],
  );

  const child = React.Children.only(children);
  type WithEventHandlers = {
    ref?: React.Ref<HTMLElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onMouseMove?: React.MouseEventHandler<HTMLElement>;
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    "data-state"?: string;
  };
  const childProps = child.props as WithEventHandlers;
  return React.cloneElement(child as React.ReactElement<WithEventHandlers>, {
    ref: setRef,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(e);
      handleEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(e);
      handleLeave();
    },
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseMove?.(e);
      handleMouseMove(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(e);
      handleBlur();
    },
    "data-state": isActive ? "open" : "closed",
  });
}

/**
 * AnimateTooltip — singleton-overlay tooltip driven by `motion/react`. Wraps a
 * single child element and reports hover/focus state to the shared overlay.
 *
 * - Use a single instance for one-off tooltips; it auto-provides its own
 *   `TooltipProvider`.
 * - Wrap multiple instances in `<AnimateTooltipGroup>` so the overlay slides
 *   between triggers instead of fading in/out, and so neighboring tooltips
 *   share a skip-delay window.
 *
 * Pass `side="auto"` to pick the side from where the cursor enters the trigger
 * (top half → top, bottom half → bottom, left/right respectively).
 *
 * Make sure `children` is a single DOM element (or a `forwardRef`-aware
 * component) that accepts a `ref` and pointer/focus handlers via cloneElement.
 */
export function AnimateTooltip({
  delayDuration,
  ...props
}: AnimateTooltipProps) {
  const ctx = useOptionalTooltipContext();
  if (ctx) return <AnimateTooltipInner {...props} />;
  return (
    <TooltipProvider openDelay={delayDuration ?? 150}>
      <AnimateTooltipInner {...props} />
    </TooltipProvider>
  );
}

