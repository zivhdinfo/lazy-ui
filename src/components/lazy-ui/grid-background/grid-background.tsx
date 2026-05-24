"use client";

import { useId, type CSSProperties, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Pattern variant.
 * - `dots` — a small filled circle at every grid intersection. Default.
 * - `lines` — solid horizontal + vertical lines forming the grid.
 * - `dashed` — same as `lines` but stroked with a dasharray.
 * - `crosshair` — small `+` mark at every intersection.
 */
export type GridBackgroundVariant = "dots" | "lines" | "dashed" | "crosshair";

/** Soft mask applied on top of the grid. */
export type GridBackgroundFade = "none" | "edges" | "center" | "top" | "bottom";

export interface GridBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** Pattern variant. @default "dots" */
  variant?: GridBackgroundVariant;
  /** Cell size in pixels. @default 24 */
  size?: number;
  /** Line / stroke thickness for `lines`, `dashed`, and `crosshair` variants. @default 1 */
  lineWidth?: number;
  /** Diameter of each dot for the `dots` variant. @default 3 */
  dotSize?: number;
  /** Dash length in pixels for the `dashed` variant. @default 3 */
  dashLength?: number;
  /** Gap between dashes in pixels for the `dashed` variant. @default 5 */
  dashGap?: number;
  /** Arm length of each crosshair (the full plus is `crossSize * 2` across). @default 5 */
  crossSize?: number;
  /** Stroke / fill color. Any CSS color string. @default "rgba(255,255,255,0.08)" */
  color?: string;
  /** Optional soft fade overlay. @default "none" */
  fade?: GridBackgroundFade;
  /** Strength of the fade. `0` disables it; `1` is full. @default 1 */
  fadeStrength?: number;
}

function fadeMask(
  fade: GridBackgroundFade,
  strength: number,
): CSSProperties["maskImage"] | undefined {
  if (fade === "none" || strength <= 0) return undefined;
  // Higher strength → mask cuts in earlier → harder fade.
  const start = Math.max(0, 100 - strength * 100);
  const stop = 100;
  switch (fade) {
    case "edges":
      return `radial-gradient(ellipse at center, black ${start * 0.5}%, transparent ${stop}%)`;
    case "center":
      return `radial-gradient(ellipse at center, transparent ${start * 0.5}%, black ${stop}%)`;
    case "top":
      return `linear-gradient(to bottom, transparent 0%, black ${stop - start}%)`;
    case "bottom":
      return `linear-gradient(to top, transparent 0%, black ${stop - start}%)`;
    default:
      return undefined;
  }
}

/**
 * GridBackground — SVG-based grid that stays crisp at any browser zoom.
 *
 * The classic CSS approach (two crossed `linear-gradient`s with a 1px line on
 * a 20px tile) breaks at fractional zoom levels: subpixel rounding makes some
 * lines double, some vanish, and dotted-mask variants drift out of phase. This
 * component renders the same family of patterns through SVG `<pattern>` tiles,
 * so the browser's resolution-independent vector rasterizer handles scaling.
 * No subpixel surprises at 110%, 125%, 133%, etc.
 *
 * The root is `pointer-events-none absolute inset-0` by default — drop it
 * into any `relative` container without disturbing layout.
 */
export function GridBackground({
  variant = "dots",
  size = 24,
  lineWidth = 1,
  dotSize = 3,
  dashLength = 3,
  dashGap = 5,
  crossSize = 5,
  color = "rgba(255,255,255,0.08)",
  fade = "none",
  fadeStrength = 1,
  className,
  style,
  ...rest
}: GridBackgroundProps) {
  // useId() gives a deterministic, SSR-safe value, so multiple grids on the
  // same page never clash on `url(#…)` references.
  const reactId = useId();
  const patternId = `gb-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const dotR = dotSize / 2;
  const cellMid = size / 2;
  let patternBody: React.ReactNode = null;

  if (variant === "dots") {
    // Dot drawn at all four tile corners so neighboring tiles each contribute
    // one quadrant of the dot at their shared intersection. Avoids the
    // `overflow="visible"` fallback, which renders inconsistently across
    // browsers — instead every dot is fully constructed from in-tile content.
    patternBody = (
      <>
        <circle cx={0} cy={0} r={dotR} fill={color} />
        <circle cx={size} cy={0} r={dotR} fill={color} />
        <circle cx={0} cy={size} r={dotR} fill={color} />
        <circle cx={size} cy={size} r={dotR} fill={color} />
      </>
    );
  } else if (variant === "lines") {
    // Top + left edge of each tile = vertical lines at x = 0, size, 2·size…
    // and horizontal lines at y = 0, size, 2·size… → a complete grid.
    patternBody = (
      <path
        d={`M ${size} 0 L 0 0 0 ${size}`}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
        shapeRendering="crispEdges"
      />
    );
  } else if (variant === "dashed") {
    patternBody = (
      <path
        d={`M ${size} 0 L 0 0 0 ${size}`}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
        strokeDasharray={`${dashLength} ${dashGap}`}
        strokeLinecap="butt"
      />
    );
  } else {
    // Crosshair — small `+` centered inside each cell. Kept entirely within
    // the tile bounds so no arm ever gets amputated by pattern clipping.
    patternBody = (
      <path
        d={`M ${cellMid - crossSize} ${cellMid} H ${cellMid + crossSize} M ${cellMid} ${cellMid - crossSize} V ${cellMid + crossSize}`}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="butt"
      />
    );
  }

  const mask = fadeMask(fade, fadeStrength);
  const fadeStyle: CSSProperties | undefined = mask
    ? {
        maskImage: mask,
        WebkitMaskImage: mask,
      }
    : undefined;

  return (
    <div
      aria-hidden
      data-grid-background={variant}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ ...fadeStyle, ...style }}
      {...rest}
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <pattern
            id={patternId}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {patternBody}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

GridBackground.displayName = "GridBackground";
