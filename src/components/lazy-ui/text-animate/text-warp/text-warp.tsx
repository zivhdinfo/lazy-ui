"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionStyle,
  type Variants,
} from "motion/react";
import { useMemo } from "react";

export interface TextWarpProps
  extends Omit<HTMLMotionProps<"span">, "children" | "variants" | "initial" | "animate"> {
  /** Text to animate — split by space; each letter animates individually. */
  text: string;
  /** True plays the entry, false plays the exit. @default true */
  trigger?: boolean;
  /** Seconds between word starts. @default 0.2 */
  wordStagger?: number;
  /** Seconds between letter starts inside a word. @default 0.04 */
  letterStagger?: number;
  /** Entry duration in seconds. @default 1.2 */
  entryDuration?: number;
  /** Exit duration in seconds. @default 1.6 */
  exitDuration?: number;
}

const ENTRY_EASE = [0.16, 1, 0.3, 1] as const;
const EXIT_EASE = [0.65, 0, 0.35, 1] as const;

const ROOT_STYLE: MotionStyle = {
  display: "inline-flex",
  flexWrap: "wrap",
};
const WORD_STYLE: MotionStyle = {
  display: "inline-flex",
  marginRight: "0.35em",
  whiteSpace: "nowrap",
};
const LETTER_STYLE: MotionStyle = {
  display: "inline-block",
  willChange: "transform, filter, opacity",
};

export function TextWarp({
  text,
  trigger = true,
  wordStagger = 0.2,
  letterStagger = 0.04,
  entryDuration = 1.2,
  exitDuration = 1.6,
  className,
  style,
  ...rest
}: TextWarpProps) {
  const reduced = useReducedMotion();

  const { root, word, letter } = useMemo<{
    root: Variants;
    word: Variants;
    letter: Variants;
  }>(
    () => ({
      root: {
        hidden: {},
        visible: { transition: { staggerChildren: wordStagger } },
        gone: {
          transition: {
            staggerChildren: wordStagger * 0.5,
            staggerDirection: -1,
          },
        },
      },
      word: {
        hidden: {},
        visible: { transition: { staggerChildren: letterStagger } },
        gone: {
          transition: { staggerChildren: letterStagger, staggerDirection: -1 },
        },
      },
      letter: {
        hidden: { opacity: 0, scale: 0.1, filter: "blur(25px)" },
        visible: {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: entryDuration, ease: ENTRY_EASE },
        },
        gone: {
          opacity: 0,
          scale: 4,
          filter: "blur(20px)",
          transition: { duration: exitDuration, ease: EXIT_EASE },
        },
      },
    }),
    [wordStagger, letterStagger, entryDuration, exitDuration],
  );

  if (reduced) {
    return (
      <motion.span {...rest} className={className} style={style}>
        {text}
      </motion.span>
    );
  }

  return (
    <motion.span
      {...rest}
      className={className}
      style={{ ...ROOT_STYLE, ...style }}
      variants={root}
      initial="hidden"
      animate={trigger ? "visible" : "gone"}
    >
      {text.split(" ").map((w, wi) => (
        <motion.span key={wi} style={WORD_STYLE} variants={word}>
          {Array.from(w).map((ch, ci) => (
            <motion.span key={ci} style={LETTER_STYLE} variants={letter}>
              {ch}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.span>
  );
}
