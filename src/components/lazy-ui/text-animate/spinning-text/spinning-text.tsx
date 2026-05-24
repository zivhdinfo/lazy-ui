"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { type CSSProperties, type ReactNode } from "react";

export interface SpinningTextProps
  extends Omit<HTMLMotionProps<"div">, "children" | "animate" | "transition"> {
  /** Letters laid around the ring. */
  children: string;
  /** Seconds per full rotation. Minimum 0.5. @default 10 */
  duration?: number;
  /** Spin counter-clockwise. @default false */
  reverse?: boolean;
  /** Ring radius in `ch` units — scales naturally with the inherited font-size. @default 5 */
  radius?: number;
  /** Content rendered at the dead center (icon, badge, etc.). */
  center?: ReactNode;
}

const SPIN_TRANSITION = {
  repeat: Infinity,
  ease: "linear" as const,
};

const CENTER_STYLE: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
};

export function SpinningText({
  children,
  duration = 10,
  reverse = false,
  radius = 5,
  center,
  className,
  style,
  ...rest
}: SpinningTextProps) {
  const reduced = useReducedMotion();
  const safeDuration = Math.max(0.5, duration);

  // Trailing space closes the ring so the last glyph doesn't kiss the first.
  const glyphs = (children + " ").split("");
  const step = 360 / glyphs.length;
  const target = reverse ? -360 : 360;

  return (
    <motion.div
      {...rest}
      // motion caches infinite-repeat transitions after the first frame, so the
      // `transition` prop doesn't propagate when the consumer changes `duration`
      // or `reverse` mid-flight. Keying off those values remounts the wrapper
      // so the new transition takes effect.
      key={`${safeDuration}-${reverse}`}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        // Self-size off the radius so the spin sits centered in any layout
        // without callers needing to set width/height by hand. `+ 2ch` keeps
        // wider glyphs from overflowing.
        width: `${radius * 2 + 2}ch`,
        height: `${radius * 2 + 2}ch`,
        ...style,
      }}
      animate={reduced ? undefined : { rotate: target }}
      transition={
        reduced ? undefined : { ...SPIN_TRANSITION, duration: safeDuration }
      }
    >
      <span key="sr" className="sr-only">{children}</span>
      {glyphs.map((glyph, i) => (
        <span
          key={`glyph-${i}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            display: "inline-block",
            transformOrigin: "center",
            transform: `translate(-50%, -50%) rotate(${step * i}deg) translateY(-${radius}ch)`,
          }}
        >
          {glyph}
        </span>
      ))}
      {center !== undefined && center !== null && (
        <span key="center" aria-hidden="true" style={CENTER_STYLE}>
          {center}
        </span>
      )}
    </motion.div>
  );
}
