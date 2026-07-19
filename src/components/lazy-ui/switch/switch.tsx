"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import {
  animate,
  motion,
  useMotionValue,
  type Transition,
} from "motion/react";

import { cn } from "@/lib/utils";

/** Snap animation used on release / external state change. */
export type SwitchAnimation = "spring" | "wobble" | "smooth" | "stretch";

const ANIM: Record<SwitchAnimation, Transition> = {
  spring: { type: "spring", stiffness: 700, damping: 32, mass: 0.5 },
  wobble: { type: "spring", stiffness: 380, damping: 10, mass: 0.6 },
  smooth: { type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  stretch: { type: "spring", stiffness: 520, damping: 26, mass: 0.5 },
};

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "checked" | "defaultChecked" | "onCheckedChange"
> & {
  /** Controlled checked state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Initial state when uncontrolled. @default false */
  defaultChecked?: boolean;
  /** Fires whenever the state changes (click, keyboard, or drag release). */
  onCheckedChange?: (checked: boolean) => void;
  /** Visual size preset. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Snap animation on release / state change. @default "spring" */
  animation?: SwitchAnimation;
  /** Content rendered inside the thumb. */
  thumbContent?: React.ReactNode;
  /** Disable click-and-drag — toggle becomes click-only. @default false */
  disableDrag?: boolean;
  /** Flick velocity threshold in px/ms. @default 0.35 */
  flickVelocity?: number;
  /** Extra class names merged onto the thumb. */
  thumbClassName?: string;
};

function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  size = "md",
  animation = "spring",
  thumbContent,
  disableDrag = false,
  flickVelocity = 0.35,
  thumbClassName,
  disabled,
  ...props
}: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internal;

  const rootRef = React.useRef<HTMLButtonElement>(null);
  const thumbRef = React.useRef<HTMLSpanElement>(null);

  // Motion values drive the thumb transform. `x` is in px; `scaleX` is the
  // squash factor used by the "stretch" animation.
  const x = useMotionValue(0);
  const scaleX = useMotionValue(1);

  // Track geometry, measured once + on resize.
  const maxOffsetRef = React.useRef(0);
  const prevChecked = React.useRef<boolean | null>(null);
  const dragEndAt = React.useRef(0);
  const drag = React.useRef<{
    pointerId: number;
    startX: number;
    initialOffset: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
  } | null>(null);

  const commit = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  // Radix's click fires after pointerup. If a drag just committed a value,
  // ignore that trailing click so it doesn't undo us.
  const handleCheckedChange = (next: boolean) => {
    if (performance.now() - dragEndAt.current < 120) return;
    commit(next);
  };

  // Measure the rest target. Runs synchronously before paint so the initial
  // position lands without a flicker.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const thumb = thumbRef.current;
    if (!root || !thumb) return;
    const measure = () => {
      const r = root.getBoundingClientRect();
      const t = thumb.getBoundingClientRect();
      const padding = Math.max(0, (r.height - t.height) / 2);
      maxOffsetRef.current = Math.max(
        0,
        r.width - t.width - padding * 2,
      );
    };
    measure();
    // First settle: snap x to the resting target.
    x.set(isChecked ? maxOffsetRef.current : 0);
    const ro = new ResizeObserver(() => {
      measure();
      // Resize while at rest — snap to the new resting target.
      if (drag.current === null) {
        x.set(isChecked ? maxOffsetRef.current : 0);
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate to the new target whenever the bound state changes.
  React.useEffect(() => {
    if (prevChecked.current === null) {
      prevChecked.current = isChecked;
      return; // initial position handled in the layout effect
    }
    if (prevChecked.current === isChecked) return;
    prevChecked.current = isChecked;
    const target = isChecked ? maxOffsetRef.current : 0;
    const controls = animate(x, target, ANIM[animation]);
    let stretchControls: ReturnType<typeof animate> | undefined;
    if (animation === "stretch") {
      stretchControls = animate(scaleX, [1, 1.35, 1], {
        duration: 0.36,
        times: [0, 0.45, 1],
        ease: [0.16, 1, 0.3, 1],
      });
    }
    return () => {
      controls.stop();
      stretchControls?.stop();
    };
  }, [isChecked, animation, x, scaleX]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disableDrag || disabled || e.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    // Stop any in-flight snap so the finger picks up exactly where it is.
    x.stop();
    scaleX.stop();
    scaleX.set(1);
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      initialOffset: x.get(),
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
    };
    root.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 2) d.moved = true;
    const offset = Math.max(
      0,
      Math.min(maxOffsetRef.current, d.initialOffset + dx),
    );
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.velocity = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = now;
    x.set(offset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    if (!d.moved) return; // not a drag — let Radix's click toggle
    const offset = Math.max(
      0,
      Math.min(maxOffsetRef.current, d.initialOffset + (d.lastX - d.startX)),
    );
    const next =
      Math.abs(d.velocity) > flickVelocity
        ? d.velocity > 0
        : offset > maxOffsetRef.current / 2;
    dragEndAt.current = performance.now();
    commit(next);
    // The state effect picks up the rest and animates to the new target.
  };

  return (
    <SwitchPrimitive.Root
      ref={rootRef}
      checked={isChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      data-slot="switch"
      data-size={size}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        // border-2 border-transparent acts as breathing room AND keeps content-box
        // math symmetric: travel = thumb_width exactly. overflow-hidden clips
        // wobble overshoot along the rounded edge.
        "group/switch peer relative inline-flex shrink-0 cursor-pointer touch-none items-center overflow-hidden rounded-full border-2 border-transparent bg-black/[0.12] bg-clip-padding outline-none transition-colors duration-200 ease-out select-none dark:bg-white/[0.08]",
        "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
        "hover:bg-black/[0.18] dark:hover:bg-white/[0.12]",
        "data-[state=checked]:bg-black dark:data-[state=checked]:bg-white",
        "data-[state=checked]:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)] dark:data-[state=checked]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-[size=md]:h-5 data-[size=md]:w-9",
        "data-[size=lg]:h-6 data-[size=lg]:w-11",
        "focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-black",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          ref={thumbRef}
          style={{ x, scaleX }}
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none grid aspect-square h-full origin-center place-items-center rounded-full bg-white shadow-sm will-change-transform",
            "dark:data-[state=checked]:bg-neutral-950",
            thumbClassName,
          )}
        >
          {thumbContent}
        </motion.span>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch, type SwitchProps };
