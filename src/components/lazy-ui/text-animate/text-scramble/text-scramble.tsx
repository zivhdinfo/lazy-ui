"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

export type TextScrambleEasing =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";
export type TextScrambleTrigger = "hover" | "mount" | "view";

export interface TextScrambleProps
  extends Omit<ComponentProps<"span">, "children"> {
  /** Final, locked-in text. Also forwarded as `aria-label` for screen readers. */
  text: string;
  /** What kicks the animation off. @default "hover" */
  trigger?: TextScrambleTrigger;
  /** Easing curve applied to the per-letter reveal schedule. @default "linear" */
  easing?: TextScrambleEasing;
  /** Total animation duration in ms (min 50). @default 800 */
  duration?: number;
  /** Tick interval in ms — drives noise refresh and reveal granularity (min 8). @default 30 */
  tickMs?: number;
  /** Glyphs sampled during the scramble noise. @default "X$@aHzo0y#?*01+" */
  charset?: string;
  /** Change this value to replay imperatively. */
  replayKey?: string | number | boolean;
}

const DEFAULT_CHARSET = "X$@aHzo0y#?*01+";

const EASINGS: Record<TextScrambleEasing, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/** Inline reduced-motion check — avoids pulling in motion for one boolean. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function noisy(text: string, locked: number, charset: string): string {
  const len = charset.length;
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (i < locked || ch === " ") out += ch;
    else out += charset[(Math.random() * len) | 0];
  }
  return out;
}

export function TextScramble({
  text,
  trigger = "hover",
  easing = "linear",
  duration = 800,
  tickMs = 30,
  charset = DEFAULT_CHARSET,
  replayKey,
  onMouseEnter,
  style,
  className,
  ...rest
}: TextScrambleProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(text.length);
  // Setter only — incrementing forces a re-render so noisy() re-rolls each tick.
  const [, bumpTick] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);
  const mountedRef = useRef(true);
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  const safeCharset = charset.length > 0 ? charset : DEFAULT_CHARSET;

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playingRef.current = false;
  }, []);

  const play = useCallback(() => {
    if (!mountedRef.current || playingRef.current || !text) return;
    if (reducedMotion) {
      setRevealed(text.length);
      return;
    }
    playingRef.current = true;

    const ease = EASINGS[easing] ?? EASINGS.linear;
    const total = Math.max(50, duration);
    const tick = Math.max(8, tickMs);
    const N = text.length;
    const start = performance.now();

    const revealAt = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      revealAt[i] = ease((i + 1) / N) * total;
    }

    let count = 0;

    const step = () => {
      if (!mountedRef.current) {
        playingRef.current = false;
        timerRef.current = null;
        return;
      }
      const elapsed = performance.now() - start;
      while (count < N && elapsed >= revealAt[count]) count++;
      setRevealed(count);
      bumpTick((t) => t + 1);
      if (count < N) {
        timerRef.current = setTimeout(step, tick);
      } else {
        playingRef.current = false;
        timerRef.current = null;
      }
    };

    setRevealed(0);
    bumpTick((t) => t + 1);
    timerRef.current = setTimeout(step, tick);
  }, [text, easing, duration, tickMs, reducedMotion]);

  // Cancel any in-flight timer on unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  // Reset and conditionally replay when text/trigger/replayKey changes.
  useEffect(() => {
    stop();
    setRevealed(text.length);
    if (trigger === "mount" || replayKey !== undefined) play();
  }, [text, trigger, replayKey, stop, play]);

  // First-in-view trigger.
  useEffect(() => {
    if (trigger !== "view") return;
    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [trigger, play]);

  const handleMouseEnter = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (trigger === "hover") play();
    onMouseEnter?.(event);
  };

  const rootStyle: CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    ...style,
  };

  return (
    <span
      {...rest}
      ref={nodeRef}
      className={className}
      aria-label={text}
      onMouseEnter={handleMouseEnter}
      style={rootStyle}
    >
      <span aria-hidden="true">{noisy(text, revealed, safeCharset)}</span>
    </span>
  );
}
