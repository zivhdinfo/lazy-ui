"use client";

import {
  useEffect,
  useRef,
  type ComponentProps,
  type RefObject,
} from "react";

/** Preset fills. `ink` follows the theme; the colour tones stay put. */
export type ShinyButtonTone = "ink" | "midnight" | "violet" | "glass";

export type ShinyButtonSize = "sm" | "md" | "lg";

export interface ProximityShineOptions {
  /** Distance from the element's edge where the shine starts, in px. @default 140 */
  proximity?: number;
  /** Peak opacity of the shine when the pointer is on the element, 0 to 1. @default 0.65 */
  shine?: number;
  /** Skew of the light slash, in degrees. @default 18 */
  tilt?: number;
  /** Follow lag, 0 to 1. Lower glides longer. @default 0.16 */
  smoothing?: number;
  /** Park the shine at rest. @default true */
  enabled?: boolean;
}

export interface ProximityShine<T extends HTMLElement> {
  /** Attach to the element the pointer distance is measured against. */
  rootRef: RefObject<T | null>;
  /** Attach to an absolutely positioned child — the light slash itself. */
  slashRef: RefObject<HTMLSpanElement | null>;
}

/**
 * Tracks the pointer anywhere on the page and drives a light slash inside
 * `rootRef`: it fades in as the pointer closes on the element and slides to
 * follow it across.
 *
 * Both the opacity and the position are written straight to the slash's inline
 * style inside a rAF loop, so a sweep past the button costs zero React renders.
 * Options are read through a ref, so turning a knob never restarts the loop.
 */
export function useProximityShine<T extends HTMLElement>({
  proximity = 140,
  shine = 0.65,
  tilt = 18,
  smoothing = 0.16,
  enabled = true,
}: ProximityShineOptions = {}): ProximityShine<T> {
  const rootRef = useRef<T>(null);
  const slashRef = useRef<HTMLSpanElement>(null);
  const paramsRef = useRef({ proximity, shine, tilt, smoothing, enabled });

  useEffect(() => {
    paramsRef.current = { proximity, shine, tilt, smoothing, enabled };
  });

  useEffect(() => {
    const root = rootRef.current;
    const slash = slashRef.current;
    if (!root || !slash) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Layout reads are batched here instead of per pointermove — measuring the
    // rect on every frame of a page-wide listener forces a reflow each time.
    let rect = root.getBoundingClientRect();
    let slashWidth = slash.offsetWidth;
    const measure = () => {
      rect = root.getBoundingClientRect();
      slashWidth = slash.offsetWidth;
    };

    let x = rect.width / 2;
    let targetX = x;
    let alpha = 0;
    let targetAlpha = 0;
    let frame = 0;

    const commit = () => {
      slash.style.opacity = alpha.toFixed(3);
      slash.style.transform = `translate3d(${(x - slashWidth / 2).toFixed(1)}px, 0, 0) skewX(${-paramsRef.current.tilt}deg)`;
    };

    const tick = () => {
      frame = 0;
      // Reduced motion keeps the shine — it answers direct pointer intent, like
      // a ripple — but drops the glide so nothing travels on its own.
      const ease = reduced.matches ? 1 : Math.min(1, Math.max(0.02, paramsRef.current.smoothing));
      x += (targetX - x) * ease;
      alpha += (targetAlpha - alpha) * ease;

      if (Math.abs(targetX - x) < 0.3 && Math.abs(targetAlpha - alpha) < 0.002) {
        x = targetX;
        alpha = targetAlpha;
        commit();
        return;
      }
      commit();
      schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const settle = (nextAlpha: number, nextX: number) => {
      targetAlpha = nextAlpha;
      targetX = nextX;
      schedule();
    };

    const handleMove = (event: PointerEvent) => {
      const p = paramsRef.current;
      if (!p.enabled) {
        settle(0, targetX);
        return;
      }
      // Distance to the rect, not to its centre: a wide button should light up
      // as soon as the pointer nears any edge.
      const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      const near = 1 - Math.min(Math.hypot(dx, dy) / Math.max(1, p.proximity), 1);

      settle(
        near * near * p.shine,
        Math.min(Math.max(event.clientX - rect.left, -slashWidth), rect.width + slashWidth),
      );
    };

    const handleLeave = () => settle(0, targetX);
    const handleFocus = () => {
      const p = paramsRef.current;
      if (p.enabled && root.matches(":focus-visible")) settle(p.shine, rect.width / 2);
    };

    commit();
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("blur", handleLeave);
    document.addEventListener("pointerleave", handleLeave);
    window.addEventListener("scroll", measure, { passive: true, capture: true });
    root.addEventListener("focus", handleFocus);
    root.addEventListener("blur", handleLeave);

    // The slash is measured too: changing its width doesn't resize the root, so
    // observing only the root would leave the centering offset stale.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(slash);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("blur", handleLeave);
      document.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("scroll", measure, { capture: true });
      root.removeEventListener("focus", handleFocus);
      root.removeEventListener("blur", handleLeave);
      observer.disconnect();
    };
  }, []);

  return { rootRef, slashRef };
}

// `--shine` is the slash colour, `--rim` the 1px top highlight, `--ring` the
// inset hairline, `--glow` the inset bloom on hover. Declared per tone so a
// white pill in dark mode gets a dark slash instead of an invisible white one.
const TONE_CLASSES: Record<ShinyButtonTone, string> = {
  ink: [
    "bg-[linear-gradient(180deg,#27272a_0%,#09090b_100%)] text-white",
    "[--shine:rgba(255,255,255,0.8)] [--rim:rgba(255,255,255,0.28)] [--ring:rgba(255,255,255,0.16)] [--glow:rgba(255,255,255,0.3)]",
    "dark:bg-[linear-gradient(180deg,#ffffff_0%,#d4d4d8_100%)] dark:text-neutral-950",
    "dark:[--shine:rgba(0,0,0,0.24)] dark:[--rim:rgba(255,255,255,0.9)] dark:[--ring:rgba(0,0,0,0.14)] dark:[--glow:rgba(0,0,0,0.18)]",
  ].join(" "),
  midnight: [
    "bg-[linear-gradient(180deg,#1b1d2e_0%,#0a0b12_100%)] text-white",
    "[--shine:rgba(148,163,255,0.9)] [--rim:rgba(255,255,255,0.22)] [--ring:rgba(255,255,255,0.15)] [--glow:rgba(88,101,242,0.55)]",
  ].join(" "),
  violet: [
    "bg-[linear-gradient(180deg,#7c3aed_0%,#4c1d95_100%)] text-white",
    "[--shine:rgba(255,255,255,0.85)] [--rim:rgba(255,255,255,0.4)] [--ring:rgba(255,255,255,0.2)] [--glow:rgba(196,181,253,0.6)]",
  ].join(" "),
  glass: [
    "bg-white/70 text-neutral-900 backdrop-blur-md",
    "[--shine:rgba(9,9,11,0.18)] [--rim:rgba(255,255,255,0.9)] [--ring:rgba(0,0,0,0.1)] [--glow:rgba(0,0,0,0.12)]",
    "dark:bg-white/10 dark:text-white",
    "dark:[--shine:rgba(255,255,255,0.6)] dark:[--rim:rgba(255,255,255,0.24)] dark:[--ring:rgba(255,255,255,0.14)] dark:[--glow:rgba(255,255,255,0.22)]",
  ].join(" "),
};

const SHADOW_CLASSES: Record<ShinyButtonTone, string> = {
  ink: "shadow-[0_1px_2px_rgba(0,0,0,0.3)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
  midnight: "shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
  violet: "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
  glass: "shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
};

const GLOW_CLASSES: Record<ShinyButtonTone, string> = {
  ink: "hover:shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_0_24px_0_var(--glow)]",
  midnight: "hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_0_24px_0_var(--glow)]",
  violet: "hover:shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_0_24px_0_var(--glow)]",
  glass: "hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_0_24px_0_var(--glow)]",
};

const SIZE_CLASSES: Record<ShinyButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-[9px] px-3.5 text-[13px]",
  md: "h-11 gap-2 rounded-[10px] px-5 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-[15px]",
};

export interface ShinyButtonProps extends ComponentProps<"button"> {
  /** Preset fill. @default "ink" */
  tone?: ShinyButtonTone;
  /** Control height, padding, and label size. @default "md" */
  size?: ShinyButtonSize;
  /** Distance from the edge where the shine starts, in px. @default 140 */
  proximity?: number;
  /** Peak opacity of the shine, 0 to 1. Set 0 to switch it off. @default 0.65 */
  shine?: number;
  /** Width of the light slash, in px. @default 56 */
  slashWidth?: number;
  /** Skew of the light slash, in degrees. @default 18 */
  tilt?: number;
  /** Follow lag, 0 to 1. Lower glides longer. @default 0.16 */
  smoothing?: number;
  /** Bloom the tone's inset glow on hover. @default true */
  glow?: boolean;
  /** Stretch to the container width. @default false */
  fullWidth?: boolean;
}

/**
 * ShinyButton — a CTA that senses the pointer before it arrives: a soft light
 * slash fades in as the cursor closes in and glides across the face to follow
 * it, over a gradient fill with a lit rim and an inset glow on hover.
 *
 * No timers and no animation library — the pointer drives everything through
 * `useProximityShine`, which is exported so the same behaviour can wrap a link,
 * a card, or any other element.
 */
export function ShinyButton({
  tone = "ink",
  size = "md",
  proximity = 140,
  shine = 0.65,
  slashWidth = 56,
  tilt = 18,
  smoothing = 0.16,
  glow = true,
  fullWidth = false,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: ShinyButtonProps) {
  const { rootRef, slashRef } = useProximityShine<HTMLButtonElement>({
    proximity,
    shine,
    tilt,
    smoothing,
    enabled: !disabled && shine > 0,
  });

  return (
    <button
      {...props}
      ref={rootRef}
      type={type}
      disabled={disabled}
      data-tone={tone}
      className={[
        "group relative isolate inline-flex cursor-pointer select-none items-center justify-center overflow-hidden font-medium tracking-[-0.01em]",
        "transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.98]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        "disabled:pointer-events-none disabled:opacity-55",
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        glow ? GLOW_CLASSES[tone] : SHADOW_CLASSES[tone],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: "inset 0 1px 0 var(--rim), inset 0 0 0 1px var(--ring)" }}
      />
      <span
        ref={slashRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-[-60%] left-0 opacity-0 will-change-transform"
        style={{
          width: slashWidth,
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--shine) 50%, transparent 100%)",
          filter: `blur(${Math.max(4, Math.round(slashWidth * 0.16))}px)`,
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-[inherit]">{children}</span>
    </button>
  );
}

ShinyButton.displayName = "ShinyButton";
