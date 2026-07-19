"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type Transition,
} from "motion/react";

import { cn } from "@/lib/utils";

/** Snap animation used when the value changes. */
export type ProgressAnimation = "spring" | "smooth" | "wobble";
/** Decorative treatment applied to the indicator. */
export type ProgressEffect = "none" | "stripes" | "glow" | "pulse";
/**
 * Where the live value label is rendered.
 * - `hidden`:          no label (default)
 * - `end`:             above the bar, right-aligned
 * - `above-leading`:   above the bar, x-tracks the fill's leading edge
 * - `inside-leading`:  inside the fill, anchored to its leading edge
 * - `edge-leading`:    popup chip at the leading edge above the bar; at 100%
 *                      the chip dives into the bar and the value text settles
 *                      centered inside the fill (and reverses when dropping)
 */
export type ProgressValuePosition =
  | "hidden"
  | "end"
  | "above-leading"
  | "inside-leading"
  | "edge-leading";

const ANIM: Record<ProgressAnimation, Transition> = {
  spring: { type: "spring", stiffness: 120, damping: 22, mass: 0.5 },
  smooth: { type: "tween", duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  wobble: { type: "spring", stiffness: 90, damping: 9, mass: 0.6 },
};

const CHIP_TRANSITION: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 30,
};

/** Built-in palette presets for the `glow` effect. */
export const PROGRESS_GLOW_PRESETS = {
  default: ["#f7f7f7", "#e100ff"],
  rainbow: [
    "#ff3b3b",
    "#ff9f1c",
    "#ffd23f",
    "#3ddc97",
    "#26c6da",
    "#7c4dff",
    "#e100ff",
  ],
  warm: ["#ffd23f", "#ff9f1c", "#ff3b3b"],
  cool: ["#3ddc97", "#26c6da", "#7c4dff"],
} as const satisfies Record<string, readonly string[]>;

export type ProgressGlowPresetName = keyof typeof PROGRESS_GLOW_PRESETS;
/** Either a preset name (e.g. `"rainbow"`) or a custom array of colors. */
export type ProgressGlowPalette =
  | ProgressGlowPresetName
  | readonly string[];

function resolveGlowPalette(
  palette: ProgressGlowPalette,
): readonly string[] {
  if (typeof palette === "string") {
    return PROGRESS_GLOW_PRESETS[palette] ?? PROGRESS_GLOW_PRESETS.default;
  }
  return palette.length > 0 ? palette : PROGRESS_GLOW_PRESETS.default;
}

type ProgressProps = Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value" | "getValueLabel"
> & {
  /** Current value. `null` / `undefined` → indeterminate (shuttle loop). */
  value?: number | null;
  /** Maximum value. @default 100 */
  max?: number;
  /** Visual size preset. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Animation curve for value transitions. @default "spring" */
  animation?: ProgressAnimation;
  /** Visual treatment of the indicator. @default "none" */
  effect?: ProgressEffect;
  /** Where to render the live value label. @default "hidden" */
  valuePosition?: ProgressValuePosition;
  /** Palette used by the `glow` effect. Accepts either a preset name
   *  (`"default"` | `"rainbow"` | `"warm"` | `"cool"`) or your own array of
   *  CSS colors. The gradient sits inside the white fill and only animates
   *  / lights up while the value is changing — rising glows brighter,
   *  falling glows softer.
   *  @default "default" */
  glowPalette?: ProgressGlowPalette;
  /** Format the displayed value text.
   *  @default v => `${Math.round((v / max) * 100)}%` */
  formatValue?: (value: number, max: number) => string;
  /** Screen-reader value label. Forwards to Radix. */
  getValueLabel?: (value: number, max: number) => string;
  /** Extra class names merged onto the track (the outer bar). */
  trackClassName?: string;
  /** Extra class names merged onto the indicator. */
  indicatorClassName?: string;
  /** Extra class names merged onto the value label span. */
  valueClassName?: string;
};

const DEFAULT_FORMAT = (v: number, max: number) =>
  `${Math.round((v / max) * 100)}%`;

function Progress({
  value,
  max = 100,
  className,
  size = "md",
  animation = "spring",
  effect = "none",
  valuePosition = "hidden",
  glowPalette = "default",
  formatValue,
  getValueLabel,
  trackClassName,
  indicatorClassName,
  valueClassName,
  ...props
}: ProgressProps) {
  const isIndeterminate = value === null || value === undefined;
  const isComplete = !isIndeterminate && (value ?? 0) >= max;
  const isGlow = effect === "glow";
  const glowColors = React.useMemo(
    () => resolveGlowPalette(glowPalette),
    [glowPalette],
  );

  // Motion value drives the indicator width AND the live text content.
  const progress = useMotionValue(0);
  const widthPct = useTransform(progress, (v) => {
    const pct = Math.max(0, Math.min(100, (v / max) * 100));
    return `${pct}%`;
  });

  // ---- Glow ----
  // `glowPulse` rests at 0. Each time `value` changes, it pulses to a peak
  // (brighter on rise, softer on fall) then decays back to 0 over ~1.2 s.
  // Drives the colored overlay's opacity and a subtle inset rim shadow.
  // Result: bar stays white when nothing is happening; gradient tint + soft
  // inner glow only appear during the transition.
  const glowPulse = useMotionValue(0);
  const prevValueRef = React.useRef<number | null | undefined>(undefined);

  React.useEffect(() => {
    if (!isGlow || isIndeterminate || value == null) {
      prevValueRef.current = value ?? null;
      return;
    }
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    if (prev === undefined || prev === null || prev === value) return;
    const peak = value > prev ? 1 : 0.55;
    const controls = animate(glowPulse, [glowPulse.get(), peak, 0], {
      duration: 1.3,
      times: [0, 0.18, 1],
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, isGlow, isIndeterminate, glowPulse]);

  const glowGradient = React.useMemo(() => {
    // Close the loop so background-position wraps without a hard jump.
    // OKLCH interpolation gives perceptually uniform color transitions —
    // no muddy mid-tones the way RGB interpolation produces.
    const looped =
      glowColors.length >= 2
        ? [...glowColors, glowColors[0]]
        : glowColors;
    return `linear-gradient(90deg in oklch, ${looped.join(", ")})`;
  }, [glowColors]);
  // Colored overlay opacity — caps at ~0.55 so the white fill always reads.
  // Two layers: main is the saturated band, soft is a slower, blurrier wash.
  const overlayOpacity = useTransform(glowPulse, (v) => v * 0.55);
  const overlayOpacitySoft = useTransform(glowPulse, (v) => v * 0.4);
  // Soft inner rim shadow — only shown when actively glowing.
  const innerGlowShadow = useTransform(glowPulse, (v) => {
    if (v < 0.05) return "none";
    const blur = 2 + v * 5;
    const accent = glowColors[glowColors.length - 1] ?? "#ffffff";
    return `inset 0 0 ${blur}px ${accent}`;
  });

  const fmt = formatValue ?? DEFAULT_FORMAT;
  const labelRef = React.useRef<HTMLSpanElement>(null);

  useMotionValueEvent(progress, "change", (v) => {
    if (labelRef.current && !isIndeterminate) {
      labelRef.current.textContent = fmt(v, max);
    }
  });

  React.useEffect(() => {
    if (isIndeterminate) return;
    const target = Math.max(0, Math.min(max, value ?? 0));
    const controls = animate(progress, target, ANIM[animation]);
    return () => controls.stop();
  }, [value, max, animation, isIndeterminate, progress]);

  const initialLabel = !isIndeterminate ? fmt(progress.get(), max) : "";

  const sizeClasses =
    valuePosition === "inside-leading" || valuePosition === "edge-leading"
      ? "data-[size=sm]:h-4 data-[size=md]:h-5 data-[size=lg]:h-6"
      : "data-[size=sm]:h-1 data-[size=md]:h-1.5 data-[size=lg]:h-2.5";

  const isStandalone =
    isIndeterminate ||
    valuePosition === "hidden" ||
    valuePosition === "inside-leading";

  // Bar fill stays white. Glow adds an inset rim that only appears during a
  // value change — no outer halo, no permanent tint.
  const indicatorStyle =
    isGlow && !isIndeterminate
      ? { width: widthPct, boxShadow: innerGlowShadow }
      : { width: widthPct };

  const bar = (
    <ProgressPrimitive.Root
      value={isIndeterminate ? null : (value ?? 0)}
      max={max}
      getValueLabel={getValueLabel}
      data-slot="progress"
      data-size={size}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.08]",
        sizeClasses,
        isStandalone && className,
        trackClassName,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator asChild>
        {isIndeterminate ? (
          <motion.div
            key="indeterminate"
            data-slot="progress-indicator"
            animate={{ x: ["-110%", "330%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: [0.45, 0.05, 0.55, 0.95],
            }}
            className={cn(
              "absolute inset-y-0 left-0 w-[33%] overflow-hidden rounded-full bg-neutral-900 will-change-transform dark:bg-white",
              indicatorClassName,
            )}
          >
            <EffectOverlay effect={isGlow ? "none" : effect} />
          </motion.div>
        ) : (
          <motion.div
            key="determinate"
            data-slot="progress-indicator"
            style={indicatorStyle}
            className={cn(
              "absolute inset-y-0 left-0 overflow-hidden rounded-full bg-neutral-900 dark:bg-white",
              indicatorClassName,
            )}
          >
            {isGlow ? (
              // Two stacked gradient layers flow continuously but are only
              // visible (via opacity) while the value is changing. The
              // second layer runs slower, at a different offset and softer
              // blur — the parallax gives the colors a silky depth instead
              // of a single sliding band.
              <>
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage: glowGradient,
                    backgroundSize: "320% 100%",
                    opacity: overlayOpacity,
                    filter: "blur(2px)",
                  }}
                  animate={{ backgroundPositionX: ["0%", "-320%"] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full mix-blend-screen"
                  style={{
                    backgroundImage: glowGradient,
                    backgroundSize: "500% 100%",
                    opacity: overlayOpacitySoft,
                    filter: "blur(5px)",
                  }}
                  animate={{ backgroundPositionX: ["-160%", "-660%"] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </>
            ) : (
              <EffectOverlay effect={effect} />
            )}
            {valuePosition === "inside-leading" && (
              <span
                ref={labelRef}
                className={cn(
                  "absolute top-1/2 right-1.5 z-10 -translate-y-1/2 text-[10px] font-medium tabular-nums text-white dark:text-neutral-950",
                  valueClassName,
                )}
              >
                {initialLabel}
              </span>
            )}
          </motion.div>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );

  if (isStandalone) return bar;

  if (valuePosition === "end") {
    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        <div className="flex items-baseline justify-end text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
          <span ref={labelRef} className={valueClassName}>
            {initialLabel}
          </span>
        </div>
        {bar}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full",
        valuePosition === "above-leading" && "pt-4",
        valuePosition === "edge-leading" && "pt-5",
        className,
      )}
    >
      {valuePosition === "above-leading" && (
        <motion.span
          aria-hidden
          style={{ left: widthPct, x: "-50%" }}
          className="pointer-events-none absolute top-0 z-10 whitespace-nowrap text-[10px] tabular-nums text-neutral-500 dark:text-neutral-300"
        >
          <span ref={labelRef} className={valueClassName}>
            {initialLabel}
          </span>
        </motion.span>
      )}
      <div className="relative w-full">
        {valuePosition === "edge-leading" && (
          <>
            <AnimatePresence initial={false}>
              {!isComplete && (
                <motion.span
                  key="edge-popup"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.55, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 14 }}
                  transition={CHIP_TRANSITION}
                  style={{ left: widthPct, x: "-50%" }}
                  className="pointer-events-none absolute bottom-full z-10 flex origin-bottom flex-col items-center"
                >
                  <span className="rounded-md bg-neutral-900 px-1.5 py-px whitespace-nowrap shadow-sm dark:bg-white">
                    <span
                      ref={labelRef}
                      className={cn(
                        "text-[10px] font-medium tabular-nums text-white dark:text-neutral-950",
                        valueClassName,
                      )}
                    >
                      {initialLabel}
                    </span>
                  </span>
                  <svg
                    width="8"
                    height="4"
                    viewBox="0 0 8 4"
                    className="-mt-px block"
                    aria-hidden
                  >
                    <path
                      d="M0 0 H8 L4 4 Z"
                      className="fill-neutral-900 dark:fill-white"
                    />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {isComplete && (
                <motion.span
                  key="edge-inside"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={CHIP_TRANSITION}
                  className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
                >
                  <span
                    ref={labelRef}
                    className={cn(
                      "text-[10px] font-medium tabular-nums text-white dark:text-neutral-950",
                      valueClassName,
                    )}
                  >
                    {initialLabel}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}
        {bar}
      </div>
    </div>
  );
}

function EffectOverlay({ effect }: { effect: ProgressEffect }) {
  if (effect === "none" || effect === "glow") return null;
  if (effect === "stripes") {
    return (
      <motion.div
        aria-hidden
        // Stripes sit on the fill, so they contrast against it: the fill is ink
        // on light (white stripes) and white on dark (ink stripes).
        className="absolute inset-y-0 -left-[25%] w-[150%] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.28)_0_8px,transparent_8px_16px)] dark:bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.22)_0_8px,transparent_8px_16px)]"
        animate={{ x: [0, 22.63] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  if (effect === "pulse") {
    return (
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-white dark:bg-black"
        animate={{ opacity: [0, 0.22, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }
  return null;
}

export { Progress, type ProgressProps };
