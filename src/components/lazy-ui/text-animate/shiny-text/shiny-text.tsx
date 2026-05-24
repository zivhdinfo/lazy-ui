import type { ComponentProps, CSSProperties, ReactNode } from "react";

export type ShinyTextVariant = "beam" | "glass";

export interface ShinyTextProps extends ComponentProps<"span"> {
  children?: ReactNode;
  /** Sweep duration in seconds. @default 5 */
  duration?: number;
  /** Dimmed text intensity from 0 to 1. @default 0.32 */
  intensity?: number;
  /** `beam` uses a sharp moving glint, `glass` uses a softer liquid band. @default "beam" */
  variant?: ShinyTextVariant;
  /** Disable the animated treatment. */
  disabled?: boolean;
  /** Stop animation when the user prefers reduced motion. @default true */
  respectMotion?: boolean;
}

const SHINY_TEXT_CSS = `@keyframes lazy-shiny-text-drift{0%{background-position:140% 0,0 0}100%{background-position:-40% 0,0 0}}@media (prefers-reduced-motion:reduce){.lazy-shiny-text[data-motion=auto]{animation:none!important;background:none!important;-webkit-text-fill-color:currentColor!important}}`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ShinyText({
  children,
  duration = 5,
  intensity = 0.32,
  variant = "beam",
  disabled = false,
  respectMotion = true,
  className,
  style,
  ...props
}: ShinyTextProps) {
  const alpha = clamp(intensity, 0, 1);
  const base = `color-mix(in srgb, currentColor ${alpha * 100}%, transparent)`;
  const soft = `color-mix(in srgb, currentColor ${Math.min(alpha + 0.22, 1) * 100}%, transparent)`;
  const glint =
    variant === "glass"
      ? `linear-gradient(100deg, transparent 0 32%, ${soft} 42%, currentColor 48%, ${soft} 54%, transparent 66% 100%)`
      : `linear-gradient(105deg, transparent 0 43%, currentColor 48%, white 50%, currentColor 52%, transparent 57% 100%)`;
  const fill =
    variant === "glass"
      ? `linear-gradient(180deg, ${base}, currentColor 52%, ${base})`
      : `linear-gradient(90deg, ${base}, currentColor 48%, ${base})`;
  const shineStyle: CSSProperties = disabled
    ? style ?? {}
    : {
        ...style,
        WebkitTextFillColor: "transparent",
        backgroundImage: `${glint}, ${fill}`,
        backgroundSize: "260% 100%, 100% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        animation: `lazy-shiny-text-drift ${Math.max(0.1, duration)}s cubic-bezier(0.45, 0, 0.55, 1) infinite`,
      };

  return (
    <>
      <style>{SHINY_TEXT_CSS}</style>
      <span
        {...props}
        data-motion={respectMotion ? "auto" : undefined}
        className={["lazy-shiny-text inline-block", className]
          .filter(Boolean)
          .join(" ")}
        style={shineStyle}
      >
        {children}
      </span>
    </>
  );
}
