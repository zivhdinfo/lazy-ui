"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
  type Variant,
} from "motion/react";

export type FlipButtonDirection = "top" | "bottom";
export type FlipButtonPalette = "light" | "dark";

export type FlipButtonClassNames = {
  front?: string;
  back?: string;
  content?: string;
};

export type FlipButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: React.ReactNode;
  front?: React.ReactNode;
  reveal?: React.ReactNode;
  from?: FlipButtonDirection;
  palette?: FlipButtonPalette;
  tapScale?: number;
  perspective?: number;
  flipTransition?: Transition;
  classNames?: FlipButtonClassNames;
};

// A glide tween on the project's --ease-out curve reads smoother than the old
// spring — no overshoot wobble, both faces cross-fade in lockstep.
const DEFAULT_TRANSITION: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
};

const FACE_CLASS =
  "col-start-1 row-start-1 inline-flex h-full w-full items-center justify-center rounded-[inherit] border px-4 backdrop-blur-[.5px] will-change-transform";

// Monochrome only — the ink design language has a single accent. `light` is the
// secondary-button surface (white → bg-2, ink text); `dark` is the primary
// ink-grad fill (white text). Front/back differ by one shade so the flip reads.
const PALETTE_CLASS: Record<
  FlipButtonPalette,
  { front: string; back: string }
> = {
  light: {
    front:
      "border-black/10 bg-white text-[#09090b] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(0,0,0,.08),0_8px_20px_rgba(0,0,0,.06)]",
    back:
      "border-black/10 bg-[#f4f4f5] text-[#09090b] shadow-[inset_0_1px_2px_rgba(0,0,0,.06),0_8px_20px_rgba(0,0,0,.08)]",
  },
  dark: {
    front:
      "border-white/10 bg-[linear-gradient(180deg,#27272a,#09090b)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_1px_2px_rgba(0,0,0,.4),0_10px_24px_rgba(0,0,0,.25)]",
    back:
      "border-white/10 bg-[linear-gradient(180deg,#3f3f46,#18181b)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_10px_24px_rgba(0,0,0,.3)]",
  },
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function directionState(from: FlipButtonDirection) {
  return {
    moveProp: "y",
    rotateProp: "rotateX",
    sign: from === "top" ? 1 : -1,
  } as const;
}

function faceVariant({
  opacity,
  rotateProp,
  rotate,
  moveProp,
  move,
}: {
  opacity: number;
  rotateProp: "rotateX" | "rotateY";
  rotate: number;
  moveProp: "x" | "y";
  move: number;
}): Variant {
  return {
    opacity,
    [rotateProp]: rotate,
    [moveProp]: `${move}%`,
  };
}

export const FlipButton = React.forwardRef<HTMLButtonElement, FlipButtonProps>(
  function FlipButton(
    {
      children,
      front,
      reveal = "Continue",
      from = "top",
      palette = "light",
      tapScale = 0.96,
      perspective = 900,
      flipTransition,
      classNames,
      className,
      style,
      disabled,
      type = "button",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const reducedMotion = useReducedMotion();
    const { moveProp, rotateProp, sign } = directionState(from);
    const transition = reducedMotion
      ? { duration: 0 }
      : (flipTransition ?? DEFAULT_TRANSITION);
    const content = front ?? children;
    const paletteClass = PALETTE_CLASS[palette] ?? PALETTE_CLASS.light;
    const resolvedAriaLabel =
      ariaLabel ?? (typeof content === "string" ? content : undefined);
    const hideFaceText = resolvedAriaLabel !== undefined;

    const frontVariants = React.useMemo(
      () => ({
        rest: faceVariant({
          opacity: 1,
          rotateProp,
          rotate: 0,
          moveProp,
          move: 0,
        }),
        hover: faceVariant({
          opacity: 0,
          rotateProp,
          rotate: 90,
          moveProp,
          move: sign * 50,
        }),
      }),
      [moveProp, rotateProp, sign],
    );

    const backVariants = React.useMemo(
      () => ({
        rest: faceVariant({
          opacity: 0,
          rotateProp,
          rotate: 90,
          moveProp,
          move: -sign * 50,
        }),
        hover: faceVariant({
          opacity: 1,
          rotateProp,
          rotate: 0,
          moveProp,
          move: 0,
        }),
      }),
      [moveProp, rotateProp, sign],
    );

    return (
      <motion.button
        ref={ref}
        type={type}
        data-flip-from={from}
        data-flip-palette={palette}
        className={cx(
          "group relative isolate inline-grid h-10 min-w-32 place-items-stretch rounded-md p-0 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/70 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        style={{
          perspective,
          transformStyle: "preserve-3d",
          ...style,
        }}
        initial="rest"
        animate="rest"
        whileHover={disabled ? undefined : "hover"}
        whileFocus={disabled ? undefined : "hover"}
        whileTap={disabled || reducedMotion ? undefined : { scale: tapScale }}
        disabled={disabled}
        aria-label={resolvedAriaLabel}
        {...props}
      >
        <motion.span
          aria-hidden={hideFaceText ? "true" : undefined}
          className={cx(
            FACE_CLASS,
            paletteClass.front,
            classNames?.front,
          )}
          style={{
            backfaceVisibility: "hidden",
            transformOrigin: "50% 50%",
          }}
          variants={frontVariants}
          transition={transition}
        >
          <span className={classNames?.content}>{content}</span>
        </motion.span>
        <motion.span
          aria-hidden={hideFaceText ? "true" : undefined}
          className={cx(
            FACE_CLASS,
            paletteClass.back,
            classNames?.back,
          )}
          style={{
            backfaceVisibility: "hidden",
            transformOrigin: "50% 50%",
          }}
          variants={backVariants}
          transition={transition}
        >
          <span className={classNames?.content}>{reveal}</span>
        </motion.span>
      </motion.button>
    );
  },
);

FlipButton.displayName = "FlipButton";
