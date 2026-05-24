"use client";

// Inspired by once-ui MatrixFx (https://github.com/once-ui-system/core).
// Single Canvas2D pass, paramsRef live updates, ResizeObserver +
// IntersectionObserver. Hot loop is allocation-free: ripple/diagonal/sparkle
// math is inlined, per-frame constants are precomputed, and near-invisible
// dots are culled before fillRect.

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

export type MatrixGridTrigger = "instant" | "mount" | "hover" | "click";
export type MatrixAnimateName = "ripple" | "diagonal" | "sparkle";

export interface MatrixAnimateConfig {
  /** Animation name. @default "ripple" */
  name?: MatrixAnimateName;
  /** Cycle length in seconds. For `sparkle`, this is the per-dot blink period.
   *  @default 3 */
  duration?: number;
  /** Peak dot displacement in CSS pixels. Ignored by `sparkle`. @default 10 */
  intensity?: number;
  /** Loop continuously vs. fire once. Ignored by `sparkle` (always continuous).
   *  @default true */
  loop?: boolean;
  /** Delay before the first cycle, in ms. @default 0 */
  delay?: number;
}

export interface MatrixGridProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Side length of each dot, in px. @default 3 */
  dotSize?: number;
  /** Empty gap between dots, in px. @default 3 */
  gap?: number;
  /** CSS colors sampled per dot. @default ["#d4d4d4"] */
  colors?: string[];
  /** Fraction (0..1) of the canvas covered by dots, measured along the reveal
   *  direction. `coverage=0.5` + `revealAngle=180` fills the lower half only.
   *  Edge softens automatically. @default 1 */
  coverage?: number;
  /** Reveal direction in degrees clockwise from the top. 0 = top, 90 = right,
   *  180 = bottom, 270 = left. @default 0 */
  revealAngle?: number;
  /** When the reveal runs. @default "instant" */
  trigger?: MatrixGridTrigger;
  /** Reveal speed multiplier. @default 1 */
  speed?: number;
  /** Per-dot opacity flicker. @default false */
  flicker?: boolean;
  /** Optional animate effect — displacement wave or sparkle. */
  animate?: MatrixAnimateConfig;
  /** Render FPS cap. @default 60 */
  fps?: number;
  children?: ReactNode;
}

type Dot = {
  x: number;
  y: number;
  color: string;
  alpha: number;
  /** 0..1 normalized position along the reveal direction. */
  normDist: number;
  twinklePhase: number;
  twinkleSpeed: number;
  /** Only ~18% of dots are sparkle-eligible — the rest stay still. */
  sparkles: boolean;
};

const TAU = Math.PI * 2;
const REVEAL_SECONDS = 1.1;
const REVEAL_FADE = 0.35;
const WAVE_RAMP = 0.18;
// Sparkle tuning — these knobs control "how many" and "how often". Calibrated
// for a calm starfield feel rather than a strobe.
const SPARKLE_RATIO = 0.18;
const SPARKLE_EXP = 10;
const ALPHA_CULL = 0.02;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutCubic = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);
const smoothstep = (a: number, b: number, x: number) => {
  if (b === a) return x < a ? 0 : 1;
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function MatrixGrid({
  dotSize = 3,
  gap = 3,
  colors = ["#d4d4d4"],
  coverage = 1,
  revealAngle = 0,
  trigger = "instant",
  speed = 1,
  flicker = false,
  animate,
  fps = 60,
  className,
  style,
  children,
  ...rest
}: MatrixGridProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    dotSize,
    gap,
    colors,
    coverage,
    revealAngle,
    trigger,
    speed,
    flicker,
    animate,
    fps,
  });
  paramsRef.current = {
    dotSize,
    gap,
    colors,
    coverage,
    revealAngle,
    trigger,
    speed,
    flicker,
    animate,
    fps,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let raf = 0;
    let widthCss = 0;
    let heightCss = 0;
    let dots: Dot[] = [];
    let diagonalLen = 1;

    let visible = true;
    let lastFrame = 0;

    let revealActive = trigger === "instant" || trigger === "mount";
    let revealStart = performance.now();
    let hideStart = 0;
    let hideFromOpacity = 0;
    let waveStart = performance.now();

    let gridKey = "";

    const buildGrid = () => {
      const p = paramsRef.current;
      const cell = Math.max(1, p.dotSize + p.gap);
      const pad = (p.animate?.intensity ?? 10) * 2;
      const cols = Math.ceil((widthCss + pad * 2) / cell);
      const rows = Math.ceil((heightCss + pad * 2) / cell);
      const palette = p.colors.length ? p.colors : ["#d4d4d4"];

      diagonalLen = Math.hypot(widthCss, heightCss) || 1;

      // Direction unit vector for the reveal sweep. 0° = (0, 1) downward, so
      // dots at the top have normDist = 0.
      const rad = ((p.revealAngle % 360) + 360) * (Math.PI / 180);
      const dirX = -Math.sin(rad);
      const dirY = Math.cos(rad);
      const wx = widthCss * dirX;
      const hy = heightCss * dirY;
      const minP = Math.min(0, wx, hy, wx + hy);
      const maxP = Math.max(0, wx, hy, wx + hy);
      const invSpan = 1 / (maxP - minP || 1);

      const offset = p.dotSize / 2 - pad;
      const total = cols * rows;
      const next: Dot[] = new Array(total);

      let i = 0;
      for (let row = 0; row < rows; row++) {
        const y = row * cell + offset;
        const yDir = y * dirY;
        for (let col = 0; col < cols; col++) {
          const x = col * cell + offset;
          next[i++] = {
            x,
            y,
            color: palette[(Math.random() * palette.length) | 0],
            alpha: 0.55 + Math.random() * 0.45,
            normDist: clamp01((x * dirX + yDir - minP) * invSpan),
            twinklePhase: Math.random() * TAU,
            twinkleSpeed: 0.4 + Math.random() * 0.4,
            sparkles: Math.random() < SPARKLE_RATIO,
          };
        }
      }
      dots = next;
    };

    const ensureGrid = () => {
      const p = paramsRef.current;
      const key = `${widthCss}x${heightCss}|${p.dotSize}|${p.gap}|${p.revealAngle}|${p.colors.join(",")}|${p.animate?.intensity ?? 10}`;
      if (key !== gridKey) {
        gridKey = key;
        buildGrid();
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      widthCss = rect.width;
      heightCss = rect.height;
      canvas.width = Math.max(1, Math.floor(widthCss * dpr));
      canvas.height = Math.max(1, Math.floor(heightCss * dpr));
      canvas.style.width = `${widthCss}px`;
      canvas.style.height = `${heightCss}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gridKey = "";
      ensureGrid();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
      },
      { threshold: 0.05, rootMargin: "50px" },
    );
    io.observe(container);

    const sweepProgress = (now: number): number => {
      const p = paramsRef.current;
      if (p.trigger === "instant") return 1;
      const dur = Math.max(0.05, REVEAL_SECONDS / Math.max(0.05, p.speed));
      if (revealActive) {
        return easeOutCubic(clamp01((now - revealStart) / 1000 / dur));
      }
      const t = clamp01((now - hideStart) / 1000 / dur);
      return hideFromOpacity * (1 - easeOutCubic(t));
    };

    const waveSample = (now: number): { p: number; amp: number } => {
      const w = paramsRef.current.animate;
      if (!w) return { p: -1, amp: 0 };
      // Sparkle bypasses the cycle envelope — it runs continuously.
      if (w.name === "sparkle") return { p: 0, amp: 1 };

      const duration = Math.max(0.1, w.duration ?? 3);
      const delaySec = Math.max(0, w.delay ?? 0) / 1000;
      const elapsed = (now - waveStart) / 1000 - delaySec;
      if (elapsed < 0) return { p: -1, amp: 0 };

      const loop = w.loop !== false;
      let p: number;
      if (loop) {
        const cycle = elapsed % (duration + delaySec);
        if (cycle >= duration) return { p: -1, amp: 0 };
        p = cycle / duration;
      } else {
        if (elapsed > duration) return { p: -1, amp: 0 };
        p = elapsed / duration;
      }
      const inFade = smoothstep(0, WAVE_RAMP, p);
      const outFade = 1 - smoothstep(1 - WAVE_RAMP, 1, p);
      return { p, amp: inFade < outFade ? inFade : outFade };
    };

    const setActive = (active: boolean) => {
      const now = performance.now();
      if (active && !revealActive) {
        revealStart = now;
        if (paramsRef.current.animate?.loop === false) waveStart = now;
        hideFromOpacity = 0;
        revealActive = true;
      } else if (!active && revealActive) {
        hideStart = now;
        hideFromOpacity = sweepProgress(now);
        revealActive = false;
      }
    };

    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);
    const onClick = () => setActive(!revealActive);

    if (trigger === "hover") {
      container.addEventListener("pointerenter", onEnter);
      container.addEventListener("pointerleave", onLeave);
    } else if (trigger === "click") {
      container.addEventListener("click", onClick);
    }

    // Hot loop. Everything per-frame is hoisted out of the for body; ripple,
    // diagonal, and sparkle are inlined to avoid object allocations.
    const render = (now: number) => {
      const p = paramsRef.current;
      const time = now / 1000;

      const sweep = sweepProgress(now);
      const { p: waveProg, amp: waveAmp } = waveSample(now);

      const cov = clamp01(p.coverage);
      const covEdge = Math.max(0, cov - 0.04);
      const covRange = cov - covEdge || 1;

      const size = p.dotSize;
      const useFlicker = p.flicker;
      const useInstant = p.trigger === "instant";

      const cfg = p.animate;
      const animName = cfg?.name ?? (cfg ? "ripple" : undefined);
      const isSparkle = animName === "sparkle";
      const isDiagonal = animName === "diagonal";
      const isRipple = animName === "ripple";
      const intensity = cfg?.intensity ?? 10;
      const waveActive = (isRipple || isDiagonal) && waveAmp > 0 && waveProg >= 0;

      // Ripple per-frame constants.
      const cx = widthCss / 2;
      const cy = heightCss / 2;
      const maxR = Math.hypot(cx, cy) || 1;
      const rippleRadius = waveProg * maxR * 1.25;
      const invRippleBand = 1 / (maxR * 0.18);

      // Diagonal per-frame constants.
      const diag = Math.max(1, diagonalLen);
      const inv2Diag = 1 / (2 * diag);
      const diagFront = waveProg * 1.2 - 0.1;

      // Sparkle per-frame angular velocity. Each dot adds its own phase + speed.
      const sparkleOmega = TAU / Math.max(0.5, cfg?.duration ?? 3);

      ctx.clearRect(0, 0, widthCss, heightCss);

      const len = dots.length;
      for (let i = 0; i < len; i++) {
        const dot = dots[i];
        const nd = dot.normDist;
        if (nd > cov) continue;

        // Coverage soft edge — inline smoothstep.
        let covMask = 1;
        if (nd > covEdge) {
          const t = (cov - nd) / covRange;
          covMask = t * t * (3 - 2 * t);
        }

        // Reveal opacity — inline ease-out cubic on a per-dot fade window.
        let revealOpacity = sweep;
        if (!useInstant) {
          const local = (sweep - nd * (1 - REVEAL_FADE)) / REVEAL_FADE;
          const tl = local < 0 ? 0 : local > 1 ? 1 : local;
          const m = 1 - tl;
          revealOpacity = 1 - m * m * m;
        }
        if (revealOpacity <= 0) continue;

        let alpha = revealOpacity * dot.alpha * covMask;

        if (useFlicker) {
          alpha *=
            0.85 +
            0.15 * Math.sin(time * dot.twinkleSpeed * 2 + dot.twinklePhase);
        }

        let dx = 0;
        let dy = 0;
        let scale = 1;
        let alphaMul = 1;

        if (isSparkle) {
          // Non-sparkling dots stay at their base alpha — produces a calm
          // field with occasional bright twinkles from the eligible 18%.
          if (dot.sparkles) {
            const lift = Math.sin(
              time * sparkleOmega * dot.twinkleSpeed + dot.twinklePhase,
            );
            if (lift > 0) {
              // x ** 10 collapses everything except the top of the sine, so
              // each dot is dim most of the time and bright for a brief
              // window per cycle.
              const sharp = lift ** SPARKLE_EXP;
              scale = 1 + sharp * 0.45;
              alphaMul = 0.25 + sharp * 0.95;
            } else {
              alphaMul = 0.25;
            }
          }
        } else if (waveActive) {
          if (isDiagonal) {
            const dotDiag = (dot.x - dot.y + diag) * inv2Diag;
            const distN = (dotDiag - diagFront) * 6;
            const env = Math.exp(-distN * distN);
            const wobble = Math.sin(time * 1.4 + dotDiag * 4) * 0.4;
            const ang = Math.PI / 4 + wobble;
            const push = env * intensity * waveAmp;
            dx = Math.cos(ang) * push;
            dy = -Math.sin(ang) * push;
            scale = 1 + env * 0.45 * waveAmp;
            alphaMul = 1 - (1 - (0.55 + env * 0.45)) * waveAmp;
          } else {
            // ripple
            const ddx = dot.x - cx;
            const ddy = dot.y - cy;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);
            const distN = (d - rippleRadius) * invRippleBand;
            const front = Math.exp(-distN * distN * 3);
            const push = front * intensity * waveAmp;
            if (d > 0) {
              const invD = 1 / d;
              dx = ddx * invD * push;
              dy = ddy * invD * push;
            }
            scale = 1 + front * 0.55 * waveAmp;
            alphaMul = 1 - (1 - (0.45 + front * 0.55)) * waveAmp;
          }
        }

        const finalAlpha = alpha * alphaMul;
        if (finalAlpha < ALPHA_CULL) continue;

        const drawSize = size * scale;
        const off = (drawSize - size) * 0.5;
        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = dot.color;
        ctx.fillRect(dot.x + dx - off, dot.y + dy - off, drawSize, drawSize);
      }

      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const interval = 1000 / Math.max(15, paramsRef.current.fps);
      if (now - lastFrame < interval) return;
      lastFrame = now;

      if (reduced) {
        const p = paramsRef.current;
        const cov = clamp01(p.coverage);
        const covEdge = Math.max(0, cov - 0.04);
        const covRange = cov - covEdge || 1;
        ctx.clearRect(0, 0, widthCss, heightCss);
        const len = dots.length;
        for (let i = 0; i < len; i++) {
          const d = dots[i];
          if (d.normDist > cov) continue;
          let m = 1;
          if (d.normDist > covEdge) {
            const t = (cov - d.normDist) / covRange;
            m = t * t * (3 - 2 * t);
          }
          ctx.globalAlpha = d.alpha * m;
          ctx.fillStyle = d.color;
          ctx.fillRect(d.x, d.y, p.dotSize, p.dotSize);
        }
        ctx.globalAlpha = 1;
        cancelAnimationFrame(raf);
        return;
      }

      ensureGrid();
      render(now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("click", onClick);
    };
  }, [reduced, trigger]);

  const rootClass = `overflow-hidden ${className ?? ""}`;
  const rootStyle: CSSProperties = { ...style };

  return (
    <div ref={containerRef} className={rootClass} style={rootStyle} {...rest}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

MatrixGrid.displayName = "MatrixGrid";
