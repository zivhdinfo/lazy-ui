"use client";

import { useRef, useState, type HTMLAttributes, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

export interface GravityButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** How hard the content chases the pointer, 0 to 1. @default 0.4 */
  strength?: number;
  /** Maximum travel from the resting position, in px. @default 24 */
  radius?: number;
  /** Extra travel applied to the inner layer for a parallax lag. @default 0.3 */
  depth?: number;
  /** Spring stiffness of the follow. Higher is snappier. @default 170 */
  stiffness?: number;
  /** Spring damping of the follow. Higher settles sooner. @default 18 */
  damping?: number;
  /** Outline the pull area while the pointer is inside it. @default true */
  field?: boolean;
  /** Freeze the content at rest. @default false */
  disabled?: boolean;
}

/**
 * GravityButton — wraps any control and pulls it toward the pointer, releasing
 * it back on a spring. Purely a motion wrapper: the child keeps its own chrome,
 * focus ring, and click handling.
 *
 * Pointer moves write to motion values instead of state, so a drag across the
 * field costs zero React renders — only entering and leaving re-render, and only
 * when `field` is on.
 */
export function GravityButton({
  children,
  strength = 0.4,
  radius = 24,
  depth = 0.3,
  stiffness = 170,
  damping = 18,
  field = true,
  disabled = false,
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: GravityButtonProps) {
  const reducedMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  // Measured once per hover instead of on every move — getBoundingClientRect in
  // a pointermove handler forces layout on each frame.
  const boundsRef = useRef<DOMRect | null>(null);
  const [engaged, setEngaged] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness, damping, mass: 0.35 };
  const px = useSpring(x, spring);
  const py = useSpring(y, spring);
  const innerX = useTransform(px, (v) => v * depth);
  const innerY = useTransform(py, (v) => v * depth);

  const active = !disabled && !reducedMotion;

  const handleEnter = (event: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    if (!active) return;
    boundsRef.current = hostRef.current?.getBoundingClientRect() ?? null;
    if (field) setEngaged(true);
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (!active) return;
    if (!boundsRef.current) {
      boundsRef.current = hostRef.current?.getBoundingClientRect() ?? null;
    }
    const rect = boundsRef.current;
    if (!rect) return;

    let dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
    let dy = (event.clientY - (rect.top + rect.height / 2)) * strength;

    // Clamp radially so a diagonal pull never travels further than a straight one.
    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      const scale = radius / distance;
      dx *= scale;
      dy *= scale;
    }

    x.set(dx);
    y.set(dy);
  };

  const handleLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    boundsRef.current = null;
    x.set(0);
    y.set(0);
    setEngaged(false);
  };

  return (
    <div
      {...props}
      ref={hostRef}
      data-engaged={engaged || undefined}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={[
        "inline-flex rounded-xl border border-dashed transition-colors duration-200 ease-out",
        engaged
          ? "border-neutral-400 bg-neutral-500/[0.07] dark:border-white/25 dark:bg-white/[0.07]"
          : "border-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.div style={{ x: px, y: py }} className="inline-flex">
        <motion.div style={{ x: innerX, y: innerY }} className="inline-flex">
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

GravityButton.displayName = "GravityButton";
