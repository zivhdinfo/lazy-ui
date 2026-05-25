"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type SpringOptions,
} from "motion/react";

export type SmoothCursorTrigger = "hover" | "press" | "always";

export type SmoothCursorClassNames = {
  root?: string;
  layer?: string;
  cursor?: string;
  glyph?: string;
  label?: string;
};

export type SmoothCursorProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  children?: React.ReactNode;
  label?: React.ReactNode;
  cursor?: React.ReactNode;
  color?: string;
  textColor?: string;
  size?: number;
  trigger?: SmoothCursorTrigger;
  global?: boolean;
  showLabel?: boolean;
  hideNativeCursor?: boolean;
  hideOnTouch?: boolean;
  offset?: { x?: number; y?: number };
  labelOffset?: { x?: number; y?: number };
  spring?: SpringOptions;
  labelSpring?: SpringOptions;
  tilt?: number;
  tiltStrength?: number;
  pressScale?: number;
  zIndex?: number;
  disabled?: boolean;
  classNames?: SmoothCursorClassNames;
};

const HIDE_CLASS = "lazy-ui-smooth-cursor-hide";
const STYLE_ID = "__lazy_ui_smooth_cursor_style__";

const CURSOR_SPRING: SpringOptions = {
  stiffness: 440,
  damping: 34,
  mass: 0.55,
};

const LABEL_SPRING: SpringOptions = {
  stiffness: 260,
  damping: 30,
  mass: 0.75,
};

const FADE = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function setRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function DefaultCursor({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,.24))",
      }}
    >
      <path
        d="M4.7 3.2 20 9.4c.8.3.8 1.5 0 1.8l-5.9 2.4-2.5 5.9c-.3.8-1.5.8-1.8 0L3.5 4.4c-.3-.7.5-1.4 1.2-1.2Z"
        fill="currentColor"
        stroke="rgba(0,0,0,.2)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const SmoothCursor = React.forwardRef<HTMLDivElement, SmoothCursorProps>(
  function SmoothCursor(
    {
      children,
      label = "Lazy UI",
      cursor,
      color = "#f97316",
      textColor = "#ffffff",
      size = 28,
      trigger = "hover",
      global = false,
      showLabel = true,
      hideNativeCursor = true,
      hideOnTouch = true,
      offset,
      labelOffset,
      spring,
      labelSpring,
      tilt = -14,
      tiltStrength = 12,
      pressScale = 0.92,
      zIndex = 50,
      classNames,
      className,
      style,
      disabled,
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref,
  ) {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [active, setActive] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const [coarsePointer, setCoarsePointer] = React.useState(() =>
      typeof window === "undefined" || !window.matchMedia
        ? false
        : window.matchMedia("(pointer: coarse)").matches,
    );
    const reducedMotion = useReducedMotion();

    const x = useMotionValue(-9999);
    const y = useMotionValue(-9999);
    const cursorX = useSpring(x, { ...CURSOR_SPRING, ...spring });
    const cursorY = useSpring(y, { ...CURSOR_SPRING, ...spring });
    const labelX = useSpring(x, { ...LABEL_SPRING, ...labelSpring });
    const labelY = useSpring(y, { ...LABEL_SPRING, ...labelSpring });
    const velocityX = useSpring(useVelocity(x), {
      stiffness: 120,
      damping: 22,
      mass: 0.45,
    });
    const rotate = useTransform(
      velocityX,
      [-900, 900],
      [tilt - tiltStrength, tilt + tiltStrength],
      { clamp: true },
    );
    const labelRotate = useTransform(
      velocityX,
      [-900, 900],
      [-tiltStrength * 0.35, tiltStrength * 0.35],
      { clamp: true },
    );

    const offsetX = offset?.x ?? 0;
    const offsetY = offset?.y ?? 0;
    const labelOffsetX = labelOffset?.x ?? size * 0.9;
    const labelOffsetY = labelOffset?.y ?? size * 0.32 + 4;
    const coarse = hideOnTouch && coarsePointer;
    const visible = !disabled && !coarse && active;

    const setActiveValue = React.useCallback((next: boolean) => {
      setActive((current) => (current === next ? current : next));
    }, []);

    const moveTo = React.useCallback(
      (clientX: number, clientY: number) => {
        if (global) {
          x.set(clientX + offsetX);
          y.set(clientY + offsetY);
          return;
        }

        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(clientX - rect.left + offsetX);
        y.set(clientY - rect.top + offsetY);
      },
      [global, offsetX, offsetY, x, y],
    );

    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        setRef(ref, node);
      },
      [ref],
    );

    React.useEffect(() => {
      if (!hideNativeCursor || typeof document === "undefined") return;
      if (document.getElementById(STYLE_ID)) return;

      const styleElement = document.createElement("style");
      styleElement.id = STYLE_ID;
      styleElement.textContent = `.${HIDE_CLASS}, .${HIDE_CLASS} * { cursor: none !important; }`;
      document.head.appendChild(styleElement);
    }, [hideNativeCursor]);

    React.useEffect(() => {
      if (!hideOnTouch || typeof window === "undefined") return;

      const media = window.matchMedia("(pointer: coarse)");
      const update = () => setCoarsePointer(media.matches);
      const timer = window.setTimeout(update, 0);
      media.addEventListener?.("change", update);
      return () => {
        window.clearTimeout(timer);
        media.removeEventListener?.("change", update);
      };
    }, [hideOnTouch]);

    React.useEffect(() => {
      if (!global || disabled || coarse || typeof window === "undefined") return;

      const move = (event: PointerEvent) => {
        moveTo(event.clientX, event.clientY);
        if (trigger !== "press") setActiveValue(true);
      };
      const down = (event: PointerEvent) => {
        moveTo(event.clientX, event.clientY);
        setPressed(true);
        if (trigger === "press") setActiveValue(true);
      };
      const up = () => {
        setPressed(false);
        if (trigger === "press") setActiveValue(false);
      };
      const leaveWindow = (event: PointerEvent) => {
        if (event.relatedTarget !== null) return;
        setPressed(false);
        setActiveValue(false);
      };
      const hide = () => {
        setPressed(false);
        setActiveValue(false);
      };

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerdown", down, { passive: true });
      window.addEventListener("pointerup", up, { passive: true });
      window.addEventListener("pointerout", leaveWindow, { passive: true });
      window.addEventListener("blur", hide);
      document.addEventListener("visibilitychange", hide);

      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerdown", down);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointerout", leaveWindow);
        window.removeEventListener("blur", hide);
        document.removeEventListener("visibilitychange", hide);
      };
    }, [coarse, disabled, global, moveTo, setActiveValue, trigger]);

    React.useEffect(() => {
      if (!global || !hideNativeCursor || typeof document === "undefined") return;
      document.documentElement.classList.toggle(HIDE_CLASS, visible);
      return () => document.documentElement.classList.remove(HIDE_CLASS);
    }, [global, hideNativeCursor, visible]);

    const rootClassName = cx(
      !global && hideNativeCursor && visible && HIDE_CLASS,
      classNames?.root,
      className,
    );

    return (
      <div
        ref={setRootRef}
        className={rootClassName}
        style={{ position: global ? undefined : "relative", ...style }}
        data-smooth-cursor-active={visible ? "" : undefined}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (event.defaultPrevented || disabled || global) return;
          moveTo(event.clientX, event.clientY);
          if (trigger !== "press") setActiveValue(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.defaultPrevented || global) return;
          setPressed(false);
          setActiveValue(false);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (event.defaultPrevented || disabled || global) return;
          moveTo(event.clientX, event.clientY);
          if (trigger === "always") setActiveValue(true);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || disabled || global) return;
          moveTo(event.clientX, event.clientY);
          setPressed(true);
          if (trigger === "press") setActiveValue(true);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (event.defaultPrevented || global) return;
          setPressed(false);
          if (trigger === "press") setActiveValue(false);
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          if (global) return;
          setPressed(false);
          setActiveValue(false);
        }}
        {...props}
      >
        {children}

        {!coarse && (
          <div
            aria-hidden="true"
            className={classNames?.layer}
            style={{
              position: global ? "fixed" : "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex,
              overflow: "visible",
            }}
          >
            <motion.div
              className={cx(
                "absolute left-0 top-0 select-none will-change-transform",
                classNames?.cursor,
              )}
              style={{
                x: cursorX,
                y: cursorY,
                rotate: reducedMotion ? tilt : rotate,
                color,
                transformOrigin: "4px 4px",
              }}
              initial={false}
              animate={{
                opacity: visible ? 1 : 0,
                scale: visible ? (pressed ? pressScale : 1) : 0.72,
              }}
              transition={reducedMotion ? { duration: 0 } : FADE}
            >
              <span className={cx("block", classNames?.glyph)}>
                {cursor ?? <DefaultCursor size={size} />}
              </span>
            </motion.div>

            {showLabel && label !== null && (
              <motion.div
                className={cx(
                  "absolute left-0 top-0 select-none will-change-transform",
                  classNames?.label,
                )}
                style={{
                  x: labelX,
                  y: labelY,
                  rotate: reducedMotion ? 0 : labelRotate,
                }}
                initial={false}
                animate={{
                  opacity: visible ? 1 : 0,
                  scale: visible ? (pressed ? pressScale : 1) : 0.78,
                }}
                transition={reducedMotion ? { duration: 0 } : FADE}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    transform: `translate(${labelOffsetX}px, ${labelOffsetY}px)`,
                    borderRadius: 999,
                    background: color,
                    color: textColor,
                    padding: `${Math.max(5, size * 0.18)}px ${Math.max(
                      10,
                      size * 0.44,
                    )}px`,
                    fontSize: Math.max(11, size * 0.48),
                    fontWeight: 600,
                    lineHeight: 1,
                    boxShadow: "0 6px 18px rgba(0,0,0,.18)",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  },
);
