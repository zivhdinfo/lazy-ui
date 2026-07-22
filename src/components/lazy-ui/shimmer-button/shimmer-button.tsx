"use client";

import type { ComponentProps, CSSProperties } from "react";

/** Preset fills. `ink` follows the theme; the colour tones stay put. */
export type ShimmerButtonTone = "ink" | "violet" | "azure" | "ember";

export type ShimmerButtonSize = "sm" | "md" | "lg";

// The sweep rests off-canvas for the back half of each cycle, so `speed`
// controls the gap between passes as much as the pass itself.
const SHIMMER_CSS = `@keyframes lazy-shimmer-sweep{0%{transform:translateX(-180%) skewX(-20deg)}55%,100%{transform:translateX(560%) skewX(-20deg)}}@media (prefers-reduced-motion:reduce){.lazy-shimmer-sweep{animation:none;opacity:0}}`;

// `--shine` drives the travelling band, `--rim` the 1px top highlight. Both are
// declared per tone so a white pill in dark mode gets a dark sweep instead of an
// invisible white one.
const TONE_CLASSES: Record<ShimmerButtonTone, string> = {
  ink: [
    "bg-[linear-gradient(180deg,#3f3f46_0%,#09090b_100%)] text-white",
    "[--shine:rgba(255,255,255,0.55)] [--rim:rgba(255,255,255,0.28)] [--ring:rgba(255,255,255,0.16)]",
    "dark:bg-[linear-gradient(180deg,#ffffff_0%,#d4d4d8_100%)] dark:text-neutral-950",
    "dark:[--shine:rgba(0,0,0,0.18)] dark:[--rim:rgba(255,255,255,0.9)] dark:[--ring:rgba(0,0,0,0.14)]",
  ].join(" "),
  violet: [
    "bg-[linear-gradient(180deg,#8b5cf6_0%,#5b21b6_100%)] text-white",
    "[--shine:rgba(255,255,255,0.6)] [--rim:rgba(255,255,255,0.42)] [--ring:rgba(255,255,255,0.22)]",
    "dark:bg-[linear-gradient(180deg,#7c3aed_0%,#4c1d95_100%)]",
  ].join(" "),
  azure: [
    "bg-[linear-gradient(180deg,#38bdf8_0%,#1d4ed8_100%)] text-white",
    "[--shine:rgba(255,255,255,0.6)] [--rim:rgba(255,255,255,0.42)] [--ring:rgba(255,255,255,0.22)]",
    "dark:bg-[linear-gradient(180deg,#0ea5e9_0%,#1e3a8a_100%)]",
  ].join(" "),
  ember: [
    "bg-[linear-gradient(180deg,#fb923c_0%,#b91c1c_100%)] text-white",
    "[--shine:rgba(255,255,255,0.6)] [--rim:rgba(255,255,255,0.42)] [--ring:rgba(255,255,255,0.22)]",
    "dark:bg-[linear-gradient(180deg,#f97316_0%,#991b1b_100%)]",
  ].join(" "),
};

const GLOW_CLASSES: Record<ShimmerButtonTone, string> = {
  ink: "shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_30px_-14px_rgba(0,0,0,0.75)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_20px_42px_-16px_rgba(0,0,0,0.8)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25),0_12px_30px_-14px_rgba(255,255,255,0.35)]",
  violet:
    "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_14px_32px_-14px_rgba(109,40,217,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_22px_44px_-16px_rgba(109,40,217,0.95)]",
  azure:
    "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_14px_32px_-14px_rgba(29,78,216,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_22px_44px_-16px_rgba(29,78,216,0.95)]",
  ember:
    "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_14px_32px_-14px_rgba(185,28,28,0.85)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_22px_44px_-16px_rgba(185,28,28,0.95)]",
};

const SIZE_CLASSES: Record<ShimmerButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-[9px] px-3.5 text-[13px]",
  md: "h-11 gap-2 rounded-[10px] px-5 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-[15px]",
};

export interface ShimmerButtonProps extends ComponentProps<"button"> {
  /** Preset fill. @default "ink" */
  tone?: ShimmerButtonTone;
  /** Control height, padding, and label size. @default "md" */
  size?: ShimmerButtonSize;
  /** Seconds per sweep cycle, including the rest between passes. @default 3.4 */
  speed?: number;
  /** Run the travelling highlight. @default true */
  shimmer?: boolean;
  /** Cast the tone-tinted ambient shadow. @default true */
  glow?: boolean;
  /** Custom gradient start colour. Overrides `tone` when paired with `to`. */
  from?: string;
  /** Custom gradient end colour. Overrides `tone` when paired with `from`. */
  to?: string;
  /** Stretch to the container width. @default false */
  fullWidth?: boolean;
}

/**
 * ShimmerButton — a gradient CTA with a light band that sweeps across it, a 1px
 * lit rim, and a tone-tinted ambient shadow.
 *
 * Everything animates in CSS: no timers, no motion values, and the sweep stops
 * entirely under `prefers-reduced-motion`.
 */
export function ShimmerButton({
  tone = "ink",
  size = "md",
  speed = 3.4,
  shimmer = true,
  glow = true,
  from,
  to,
  fullWidth = false,
  children,
  className,
  style,
  type = "button",
  ...props
}: ShimmerButtonProps) {
  const custom = from && to;
  const rootStyle: CSSProperties = custom
    ? { backgroundImage: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`, ...style }
    : (style ?? {});

  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <button
        {...props}
        type={type}
        data-tone={custom ? "custom" : tone}
        style={rootStyle}
        className={[
          "group relative isolate inline-flex select-none items-center justify-center overflow-hidden font-medium tracking-[-0.01em]",
          "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
          "disabled:pointer-events-none disabled:opacity-55",
          SIZE_CLASSES[size],
          TONE_CLASSES[tone],
          glow ? GLOW_CLASSES[tone] : "",
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            boxShadow:
              "inset 0 1px 0 var(--rim), inset 0 0 0 1px var(--ring), inset 0 -8px 16px -12px rgba(0,0,0,0.6)",
          }}
        />
        {shimmer && (
          <span
            aria-hidden
            className="lazy-shimmer-sweep pointer-events-none absolute inset-y-[-40%] left-0 w-[22%]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, var(--shine) 50%, transparent 100%)",
              animation: `lazy-shimmer-sweep ${Math.max(0.4, speed)}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            }}
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-[inherit]">
          {children}
        </span>
      </button>
    </>
  );
}

ShimmerButton.displayName = "ShimmerButton";
