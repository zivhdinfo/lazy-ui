"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import type { ReactNode } from "react";

// Shared variants — exported so non-div elements (motion.article, motion.section)
// can replicate the LpReveal feel without nesting an extra wrapper div.
export const lpRevealInitial = {
  opacity: 0,
  y: 28,
  filter: "blur(6px)",
};

export const lpRevealAnimate = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
};

export const lpRevealViewport = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -10% 0px" as const,
};

export function lpRevealTransition(delay = 0) {
  return {
    type: "spring" as const,
    stiffness: 80,
    damping: 20,
    mass: 0.9,
    delay,
    // Non-transform values get their own duration-based tween — springs
    // don't behave well on filter/opacity.
    filter: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
    opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
  };
}

type LpRevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Stagger delay in seconds. @default 0 */
  delay?: number;
  /** Translate-Y distance at entry, in px. @default 28 */
  y?: number;
  /** Initial blur radius at entry, in px. @default 6 */
  blur?: number;
  className?: string;
};

/**
 * Scroll-triggered reveal wrapper. Uses motion/react's `whileInView` so each
 * element runs its own intersection observer; combined with a spring
 * transition + entry blur the effect reads as polished rather than mechanical.
 *
 * Honors `prefers-reduced-motion` by short-circuiting to a plain div.
 */
export function LpReveal({
  children,
  delay = 0,
  y = 28,
  blur = 6,
  className,
  ...rest
}: LpRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 0.9,
        delay,
        // The filter property needs its own duration-based tween — springs
        // produce odd results on non-numeric / non-transform values.
        filter: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
        opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
