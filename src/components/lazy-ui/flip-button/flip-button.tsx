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
export type FlipButtonPalette =
  | "sky"
  | "silver"
  | "graphite"
  | "mint"
  | "violet";

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

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.65,
};

const FACE_CLASS =
  "col-start-1 row-start-1 inline-flex h-full w-full items-center justify-center rounded-[inherit] border px-4 backdrop-blur-[.5px] will-change-transform";

const PALETTE_CLASS: Record<
  FlipButtonPalette,
  { front: string; back: string }
> = {
  sky: {
    front:
      "border-[#83bfff]/70 bg-[radial-gradient(114.65%_114.65%_at_9.73%_17.27%,rgba(119,198,255,.82)_15.38%,#6f7fdc_100%)] text-white shadow-[inset_-1px_-1px_4px_rgba(0,15,154,.45),5px_7px_14px_rgba(119,133,164,.28),1px_1px_3px_rgba(0,0,0,.12),inset_.5px_.5px_1px_rgba(255,255,255,.42)]",
    back:
      "border-[#6da8f7]/70 bg-[radial-gradient(114.65%_114.65%_at_9.73%_17.27%,rgba(103,183,242,.9)_12%,#556fd4_100%)] text-white shadow-[inset_4px_4px_4px_rgba(19,26,228,.1),inset_-3px_-3px_4px_rgba(191,229,251,.35),12px_12px_24px_rgba(94,122,205,.24)]",
  },
  silver: {
    front:
      "border-white/70 bg-[radial-gradient(115%_115%_at_10%_16%,rgba(255,255,255,.92)_0%,#d7e1ef_46%,#aab7ca_100%)] text-neutral-900 shadow-[inset_-1px_-1px_3px_rgba(75,85,99,.34),5px_7px_14px_rgba(97,113,133,.2),inset_.5px_.5px_1px_rgba(255,255,255,.8)]",
    back:
      "border-white/50 bg-[radial-gradient(115%_115%_at_10%_16%,#eaf0f8_0%,#c5d1e0_55%,#8f9cad_100%)] text-neutral-950 shadow-[inset_3px_3px_4px_rgba(51,65,85,.1),inset_-3px_-3px_4px_rgba(255,255,255,.45),12px_12px_24px_rgba(84,99,120,.18)]",
  },
  graphite: {
    front:
      "border-white/10 bg-[radial-gradient(115%_115%_at_10%_16%,#3a3d42_0%,#202226_50%,#0c0d0f_100%)] text-neutral-100 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,.5),5px_7px_14px_rgba(0,0,0,.26),inset_.5px_.5px_1px_rgba(255,255,255,.18)]",
    back:
      "border-white/10 bg-[radial-gradient(115%_115%_at_10%_16%,#2f3338_0%,#17191c_54%,#060708_100%)] text-white shadow-[inset_4px_4px_4px_rgba(255,255,255,.04),inset_-3px_-3px_4px_rgba(0,0,0,.42),12px_12px_24px_rgba(0,0,0,.24)]",
  },
  mint: {
    front:
      "border-[#a9d9c9]/70 bg-[radial-gradient(115%_115%_at_10%_16%,#d6fff1_0%,#8fd4bc_48%,#5d9387_100%)] text-[#10231f] shadow-[inset_-1px_-1px_4px_rgba(15,118,110,.25),5px_7px_14px_rgba(78,115,105,.2),inset_.5px_.5px_1px_rgba(255,255,255,.55)]",
    back:
      "border-[#8fc8b7]/70 bg-[radial-gradient(115%_115%_at_10%_16%,#c4f4e5_0%,#79bea9_54%,#447c72_100%)] text-[#071b17] shadow-[inset_4px_4px_4px_rgba(20,83,75,.1),inset_-3px_-3px_4px_rgba(219,255,246,.35),12px_12px_24px_rgba(68,124,114,.18)]",
  },
  violet: {
    front:
      "border-[#bbb0ea]/70 bg-[radial-gradient(115%_115%_at_10%_16%,#ddd8ff_0%,#9e92dc_48%,#6a5ea8_100%)] text-white shadow-[inset_-1px_-1px_4px_rgba(49,46,129,.34),5px_7px_14px_rgba(96,82,145,.22),inset_.5px_.5px_1px_rgba(255,255,255,.45)]",
    back:
      "border-[#a89ee2]/70 bg-[radial-gradient(115%_115%_at_10%_16%,#cbc5f8_0%,#8b7dcc_54%,#53468f_100%)] text-white shadow-[inset_4px_4px_4px_rgba(49,46,129,.12),inset_-3px_-3px_4px_rgba(231,229,255,.28),12px_12px_24px_rgba(83,70,143,.2)]",
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
      palette = "sky",
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
    const paletteClass = PALETTE_CLASS[palette] ?? PALETTE_CLASS.sky;
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
