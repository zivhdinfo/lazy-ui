"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from "react";

const HAS_SEGMENTER = typeof Intl !== "undefined" && "Segmenter" in Intl;

function splitGraphemes(input: string): string[] {
  if (HAS_SEGMENTER) {
    const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(seg.segment(input), (s) => s.segment);
  }
  return Array.from(input);
}

export type TextFlipDirection = "top" | "right" | "bottom" | "left";
export type TextFlipStaggerFrom = "first" | "last" | "center" | number;
export type TextFlipTrigger = "hover" | "mount" | "view";
export type TextFlipAs = "p" | "span" | "div" | "h1" | "h2" | "h3";

export interface TextFlipProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Text to animate. */
  text: string;
  /** Root element tag. @default "p" */
  as?: TextFlipAs;
  /** Axis the flip pivots around. @default "right" */
  direction?: TextFlipDirection;
  /** Seconds between character starts. @default 0.04 */
  stagger?: number;
  /** Where the stagger originates. @default "first" */
  staggerFrom?: TextFlipStaggerFrom;
  /** Per-character flip duration in seconds. @default 0.6 */
  duration?: number;
  /** What kicks the animation off. @default "hover" */
  trigger?: TextFlipTrigger;
  /** Custom transition; when set, overrides duration/easing per character. */
  transition?: Transition;
  /** Perspective applied to the root in pixels. @default 800 */
  perspective?: number;
  /** Class merged onto each character span. */
  charClassName?: string;
}

const ENTRY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Each direction maps to:
 *  - `axis`: which rotation to animate on the wrapper.
 *  - `sign`: forward (+) or backward (-) — flips the rolling direction.
 *  - `back`: transform that places the back face 90° "behind" the front so
 *    the wrapper's first 90° of rotation rolls the front away and the back
 *    around into view (cube-edge tumble instead of an in-place card flip).
 */
const DIRECTION_MAP: Record<
  TextFlipDirection,
  { axis: "rotateX" | "rotateY"; sign: 1 | -1; back: string }
> = {
  top: { axis: "rotateX", sign: 1, back: "rotateX(-90deg) translateZ(0.5em)" },
  bottom: { axis: "rotateX", sign: -1, back: "rotateX(90deg) translateZ(0.5em)" },
  left: { axis: "rotateY", sign: -1, back: "rotateY(90deg) translateZ(0.5em)" },
  right: { axis: "rotateY", sign: 1, back: "rotateY(-90deg) translateZ(0.5em)" },
};

const CHAR_STYLE: CSSProperties = {
  display: "inline-block",
  position: "relative",
  transformStyle: "preserve-3d",
  willChange: "transform",
};

const FACE_FRONT_STYLE: CSSProperties = {
  display: "inline-block",
  backfaceVisibility: "hidden",
  transform: "translateZ(0.5em)",
};

const WORD_STYLE: CSSProperties = {
  display: "inline-flex",
  whiteSpace: "nowrap",
};

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export function TextFlip({
  text,
  as: Tag = "p",
  direction = "right",
  stagger = 0.04,
  staggerFrom = "first",
  duration = 0.6,
  trigger = "hover",
  transition,
  perspective = 800,
  className,
  charClassName,
  style,
  onMouseEnter,
  ...rest
}: TextFlipProps) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const isAnimatingRef = useRef(false);
  const isMountedRef = useRef(false);
  const wrapperRef = useRef<HTMLElement | null>(null);

  // Split once per text change. Words first (for natural wrapping), then graphemes.
  const words = useMemo(
    () => text.split(" ").map((word) => splitGraphemes(word)),
    [text],
  );

  // Running offsets so each character has a stable global index for stagger math.
  const { charBaseIndex, totalChars } = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (const w of words) {
      offsets.push(acc);
      acc += w.length;
    }
    return { charBaseIndex: offsets, totalChars: acc };
  }, [words]);

  const { axis, sign, back } = DIRECTION_MAP[direction];

  const getDelay = useCallback(
    (i: number) => {
      if (totalChars <= 1) return 0;
      if (staggerFrom === "first") return i * stagger;
      if (staggerFrom === "last") return (totalChars - 1 - i) * stagger;
      if (staggerFrom === "center") {
        return Math.abs((totalChars - 1) / 2 - i) * stagger;
      }
      return Math.abs((staggerFrom as number) - i) * stagger;
    },
    [stagger, staggerFrom, totalChars],
  );

  // Wrapper rotates the cube: front face rolls 90° away while the back face
  // (already parked 90° around the cube) rotates into view at the end.
  const variants = useMemo<Variants>(() => {
    const rest = { [axis]: 0 } as TargetAndTransition;
    const flip = (i: number) => {
      const target: TargetAndTransition = { [axis]: sign * 90 };
      target.transition = transition ?? {
        delay: getDelay(i),
        duration,
        ease: ENTRY_EASE,
      };
      return target;
    };
    return { rest, flip };
  }, [axis, sign, duration, getDelay, transition]);

  const fire = useCallback(async () => {
    if (reduced || !isMountedRef.current || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    try {
      await controls.start("flip");
      // Snap back so the next trigger starts from zero — both faces show the
      // same character, so the jump is visually a no-op.
      if (isMountedRef.current) controls.set("rest");
    } catch {
      /* stopped — drop quietly */
    } finally {
      isAnimatingRef.current = false;
    }
  }, [controls, reduced]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isAnimatingRef.current = false;
      controls.stop();
    };
  }, [controls]);

  useEffect(() => {
    if (reduced) return;
    if (trigger === "mount") {
      fire();
      return;
    }
    if (trigger === "view") {
      const el = wrapperRef.current;
      if (!el || typeof IntersectionObserver === "undefined") {
        fire();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            fire();
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [trigger, fire, reduced]);

  const handleMouseEnter = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (trigger === "hover") fire();
      onMouseEnter?.(e);
    },
    [trigger, fire, onMouseEnter],
  );
  const setWrapperRef = useCallback((node: HTMLElement | null) => {
    wrapperRef.current = node;
  }, []);

  if (reduced) {
    return (
      <Tag className={className} style={style} {...rest}>
        {text}
      </Tag>
    );
  }

  const rootStyle: CSSProperties = {
    display: "inline-flex",
    flexWrap: "wrap",
    perspective: `${perspective}px`,
    ...style,
  };

  const backFaceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "inline-block",
    backfaceVisibility: "hidden",
    transform: back,
  };

  return (
    <Tag
      ref={setWrapperRef}
      className={className}
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      <span style={SR_ONLY_STYLE}>{text}</span>
      {words.map((chars, wi) => (
        <span
          key={wi}
          aria-hidden="true"
          style={{
            ...WORD_STYLE,
            marginRight: wi < words.length - 1 ? "0.25em" : 0,
          }}
        >
          {chars.map((ch, ci) => (
            <motion.span
              key={ci}
              custom={charBaseIndex[wi] + ci}
              variants={variants}
              initial="rest"
              animate={controls}
              className={charClassName}
              style={CHAR_STYLE}
            >
              <span style={FACE_FRONT_STYLE}>{ch}</span>
              <span style={backFaceStyle}>{ch}</span>
            </motion.span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

TextFlip.displayName = "TextFlip";
