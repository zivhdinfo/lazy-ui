"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import * as React from "react";

export type IntroPreloaderExit = "zoom" | "wipe" | "fade";

export type IntroPreloaderProps = Omit<
  HTMLMotionProps<"div">,
  | "children"
  | "initial"
  | "animate"
  | "transition"
  | "exit"
  | "onAnimationComplete"
> & {
  /** Image URLs to preload. They also feed the center photo pile. */
  images: string[];
  /**
   * Asset names ticked through the bottom-left line as progress advances —
   * pass your app's real manifest (chunk names, fonts, API warmups). Falls
   * back to a generated list of plausible file names.
   */
  items?: string[];
  /** Oversized status word at the top-left. Empty string hides it. @default "Loading" */
  label?: string;
  /** Photos stacked up in the center pile. @default 6 */
  stackCount?: number;
  /**
   * Floor on how fast the counter may finish, in ms, so cached loads still
   * play the intro. Real image progress can only slow it down, never skip it.
   * @default 3000
   */
  minDuration?: number;
  /** Pause at 100 before the exit animation starts, in ms. @default 450 */
  holdDuration?: number;
  /** Multiplier on the pop and exit animations. 2 is twice as fast. @default 1 */
  speed?: number;
  /** Max tilt of a pile photo, in degrees. 0 stacks them perfectly straight. @default 10 */
  spread?: number;
  /**
   * How the overlay leaves. `zoom` scales into the photo pile and fades,
   * `wipe` slides the panel up, `fade` is a plain dissolve. @default "zoom"
   */
  exit?: IntroPreloaderExit;
  /** Show the percent counter at the bottom-right. @default true */
  counter?: boolean;
  /** Show the progress bar along the bottom edge. @default true */
  progressBar?: boolean;
  /** Show the asset-name ticker at the bottom-left. @default true */
  meta?: boolean;
  /**
   * Cover the viewport with `position: fixed`. Set false to fill the nearest
   * positioned ancestor instead (demos, embedded frames). @default true
   */
  fullscreen?: boolean;
  /** Lock document scrolling while covering the viewport. Fullscreen only. @default true */
  lockScroll?: boolean;
  /** Stacking order of the fullscreen overlay. @default 50 */
  zIndex?: number;
  /** Fires once, after the exit animation has finished and the overlay unmounts. */
  onComplete?: () => void;
};

type Phase = "loading" | "exit" | "done";

const WIPE_EASE = [0.87, 0, 0.13, 1] as const;
const ZOOM_EASE = [0.65, 0, 0.35, 1] as const;
const POP_EASE = [0.22, 1, 0.36, 1] as const;

const FAKE_EXTENSIONS = [".js", ".css", ".webp", ".svg", ".woff2", ".json"];
const FAKE_CHARS = "abcdefghijklmnopqrstuvwxyz";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function randomFromSeed(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

// Seeded, not Math.random — the ticker must render identically on server and
// client or hydration flags a mismatch.
function fakeManifest(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const length = 6 + Math.floor(randomFromSeed(i * 31 + 3) * 9);
    let name = "";
    for (let c = 0; c < length; c += 1) {
      name += FAKE_CHARS[Math.floor(randomFromSeed(i * 97 + c * 13 + 7) * 26)];
    }
    const ext =
      FAKE_EXTENSIONS[
        Math.floor(randomFromSeed(i * 53 + 11) * FAKE_EXTENSIONS.length)
      ];
    return name + ext;
  });
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function IntroPreloader({
  images,
  items,
  label = "Loading",
  stackCount = 6,
  minDuration = 3000,
  holdDuration = 450,
  speed = 1,
  spread = 10,
  exit = "zoom",
  counter = true,
  progressBar = true,
  meta = true,
  fullscreen = true,
  lockScroll = true,
  zIndex = 50,
  onComplete,
  className,
  style,
  ...props
}: IntroPreloaderProps) {
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [progress, setProgress] = React.useState(0);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const displayRef = React.useRef(0);
  const loadedRef = React.useRef(0);
  const totalRef = React.useRef(0);
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Keyed on content, not array identity — consumers naturally pass inline
  // literals, and a fresh reference each parent render must not restart the
  // preload or reset progress.
  const imagesKey = images.join("\n");
  const srcList = React.useMemo(
    () => (imagesKey ? imagesKey.split("\n") : []),
    [imagesKey],
  );
  const uniqueSrcs = React.useMemo(
    () => Array.from(new Set(srcList)),
    [srcList],
  );

  const [prevSrcs, setPrevSrcs] = React.useState(uniqueSrcs);
  if (prevSrcs !== uniqueSrcs) {
    setPrevSrcs(uniqueSrcs);
    // Also clears a pending hold-timer via its `progress` dep, so a swap
    // during the hold can't complete against images that never loaded.
    setProgress(0);
  }

  React.useEffect(() => {
    totalRef.current = uniqueSrcs.length;
    loadedRef.current = 0;
    displayRef.current = 0;
    if (uniqueSrcs.length === 0) return;
    let cancelled = false;
    const imgs = uniqueSrcs.map((src) => {
      const img = new window.Image();
      const settle = () => {
        if (!cancelled) loadedRef.current += 1;
      };
      img.onload = settle;
      img.onerror = settle;
      img.src = src;
      return img;
    });
    return () => {
      cancelled = true;
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [uniqueSrcs]);

  // The counter chases min(time floor, real load fraction): cached loads still
  // sweep over minDuration, slow networks stall it honestly at the real value.
  // `uniqueSrcs` is a dep so an images swap restarts the parked loop with a
  // fresh time floor.
  React.useEffect(() => {
    if (phase !== "loading") return;
    let raf = 0;
    const start = performance.now();
    let last = start;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const t = Math.min(1, (now - start) / Math.max(1, minDuration));
      const loadF =
        totalRef.current === 0 ? 1 : loadedRef.current / totalRef.current;
      const target = Math.min(easeInOutCubic(t), loadF) * 100;
      const d = displayRef.current;
      const next = reduced
        ? target
        : target >= 99.9 && d > 99
          ? 100
          : d + (target - d) * (1 - Math.exp(-dt / 110));
      displayRef.current = next;
      const rounded = Math.min(100, Math.floor(next));
      setProgress((p) => (p === rounded ? p : rounded));
      if (next >= 100) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, minDuration, reduced, uniqueSrcs]);

  React.useEffect(() => {
    if (phase !== "loading" || progress < 100) return;
    const id = window.setTimeout(() => setPhase("exit"), holdDuration);
    return () => window.clearTimeout(id);
  }, [phase, progress, holdDuration]);

  const covering = fullscreen && lockScroll && phase !== "done";
  React.useEffect(() => {
    if (!covering) return;
    const el = document.documentElement;
    const previous = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = previous;
    };
  }, [covering]);

  // While the opaque overlay covers the page, its siblings must be inert —
  // otherwise Tab moves focus behind the overlay where the ring is invisible.
  const obscuring = fullscreen && phase !== "done";
  React.useEffect(() => {
    if (!obscuring) return;
    const root = rootRef.current;
    const parent = root?.parentElement;
    if (!root || !parent) return;
    const touched: Element[] = [];
    Array.from(parent.children).forEach((child) => {
      if (child === root || child.hasAttribute("inert")) return;
      child.setAttribute("inert", "");
      touched.push(child);
    });
    return () => touched.forEach((child) => child.removeAttribute("inert"));
  }, [obscuring]);

  const tiles = React.useMemo(() => {
    const count = Math.max(1, Math.round(stackCount));
    return Array.from({ length: count }, (_, i) => {
      const settled = i === count - 1;
      return {
        src: srcList[i % Math.max(1, srcList.length)] ?? "",
        // The last photo lands perfectly straight — the pile reads "finished".
        tilt: settled ? 0 : (randomFromSeed(i * 7 + 1) * 2 - 1) * spread,
        enterTilt: (randomFromSeed(i * 13 + 5) * 2 - 1) * spread * 2.2,
        dx: (randomFromSeed(i * 29 + 9) * 2 - 1) * 8,
        threshold: Math.min(99, Math.round(((i + 1) * 100) / count)),
      };
    });
  }, [srcList, stackCount, spread]);

  const manifest = React.useMemo(
    () => (items && items.length > 0 ? items : fakeManifest(24)),
    [items],
  );

  const paceMul = 1 / Math.max(0.1, speed);
  const softExit = reduced || exit === "fade";
  const exitMs = softExit ? 450 : (exit === "zoom" ? 800 : 850) * paceMul;

  // Completion runs on a timer, not Motion's onAnimationComplete — that
  // callback can fire for a no-op target settled right as the phase flips,
  // unmounting the overlay before the exit animation ever renders.
  React.useEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => {
      setPhase("done");
      onCompleteRef.current?.();
    }, exitMs + 80);
    return () => window.clearTimeout(id);
  }, [phase, exitMs]);

  if (phase === "done") return null;

  const exiting = phase === "exit";
  const tickerIndex = Math.min(
    manifest.length - 1,
    Math.floor((progress / 100) * manifest.length),
  );
  // Coarse milestones only — a polite live region must not announce every 1%.
  const announced =
    progress >= 100
      ? `${label || "Loading"} complete`
      : `${label || "Loading"} ${Math.floor(progress / 25) * 25}%`;

  const exitAnimate = softExit
    ? { opacity: 0 }
    : exit === "zoom"
      ? { opacity: 0, scale: 1.45 }
      : {
          y: "-100%",
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
        };
  const exitTransition = {
    duration: exitMs / 1000,
    ease: softExit
      ? ("easeOut" as const)
      : exit === "zoom"
        ? ZOOM_EASE
        : WIPE_EASE,
  };

  return (
    <motion.div
      ref={rootRef}
      role="status"
      aria-label={label || "Loading"}
      aria-busy={!exiting}
      initial={false}
      animate={exiting ? exitAnimate : { y: 0, scale: 1, opacity: 1 }}
      transition={exitTransition}
      className={cx(
        "inset-0 overflow-hidden bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50",
        fullscreen ? "fixed" : "absolute",
        className,
      )}
      style={{
        containerType: "inline-size",
        ...(fullscreen ? { zIndex } : null),
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">{announced}</span>

      {/* Content counter-moves during the wipe so the panel appears to peel away. */}
      <motion.div
        aria-hidden
        initial={false}
        animate={
          exiting && !softExit && exit === "wipe" ? { y: "30%" } : { y: "0%" }
        }
        transition={exitTransition}
        className="relative h-full w-full"
      >
        {label ? (
          <p className="absolute left-[clamp(18px,4cqw,48px)] top-[clamp(12px,3cqw,36px)] text-[clamp(24px,6.5cqw,80px)] font-medium leading-none tracking-tighter">
            {label}
            {reduced ? (
              <span>...</span>
            ) : (
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ opacity: [0.15, 1] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 0.9,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                >
                  .
                </motion.span>
              ))
            )}
          </p>
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative aspect-[3/4]"
            style={{ width: "clamp(110px,17cqw,200px)" }}
          >
            {tiles.map((tile, i) => {
              const shown = progress >= tile.threshold;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={
                    shown
                      ? { opacity: 1, scale: 1, rotate: tile.tilt, y: 0 }
                      : {
                          opacity: 0,
                          scale: 1.16,
                          rotate: tile.enterTilt,
                          y: 28,
                        }
                  }
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.55 * paceMul, ease: POP_EASE }
                  }
                  className="absolute inset-0 overflow-hidden rounded-2xl border border-zinc-950/10 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.4)] dark:border-white/10"
                  style={{ x: tile.dx, zIndex: i }}
                >
                  {tile.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tile.src}
                      alt=""
                      draggable={false}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-100 dark:bg-zinc-900" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {meta ? (
          <p className="absolute bottom-[calc(clamp(16px,3cqw,36px)+14px)] left-[clamp(18px,4cqw,48px)] font-mono text-[10.5px] font-medium tracking-tight text-zinc-500 dark:text-zinc-400">
            {manifest[tickerIndex]}
          </p>
        ) : null}

        {counter ? (
          <p className="absolute bottom-[calc(clamp(16px,3cqw,36px)+14px)] right-[clamp(18px,4cqw,48px)] text-[clamp(24px,6.5cqw,80px)] font-medium leading-none tracking-tighter tabular-nums">
            {progress}
            <span className="ml-[0.08em] align-top text-[0.32em] font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">
              %
            </span>
          </p>
        ) : null}

        {progressBar ? (
          <div className="absolute inset-x-[clamp(18px,4cqw,48px)] bottom-[clamp(16px,3cqw,36px)] h-[3px] overflow-hidden rounded-full bg-zinc-950/[0.08] dark:bg-white/10">
            <div
              className={cx(
                "h-full rounded-full bg-gradient-to-r from-zinc-600 to-zinc-950 dark:from-zinc-300 dark:to-white",
                !reduced && "transition-[width] duration-300 ease-out",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

IntroPreloader.displayName = "IntroPreloader";
