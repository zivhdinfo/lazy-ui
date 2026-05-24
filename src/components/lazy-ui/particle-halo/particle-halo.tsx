"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";

export type ParticleHaloShape = "circle" | "square" | "line" | "spark";
export type ParticleHaloMode = "wave" | "pulse" | "spiral" | "chaos";

export interface ParticleHaloProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Particle count along the ring. Auto-halved on viewports under 600 px. @default 1800 */
  particleCount?: number;
  /** Per-particle palette — each particle picks one entry deterministically. @default ["#a3a3a3","#f8f8f8"] */
  colors?: string[];
  /** Ring radius as a fraction of the canvas's smaller dimension. @default 0.7 */
  radius?: number;
  /** Breathing amplitude multiplier. @default 1 */
  intensity?: number;
  /** One full breathe cycle (shrink + grow) duration in seconds. @default 16 */
  duration?: number;
  /** Background fill drawn beneath the particles. @default "#050505" */
  background?: string;
  /** CSS drop-shadow glow around each particle. @default true */
  glow?: boolean;
  /** Glow color (CSS). @default the brightest entry in `colors` */
  glowColor?: string;
  /** Min / max particle diameter in pixels. @default [2, 8] */
  particleSize?: [number, number];
  /** Particle render shape. Lines + sparks read as flowing streaks; circles + squares read as dots. @default "circle" */
  shape?: ParticleHaloShape;
  /** Animation pattern: `wave` rolls around the ring, `pulse` breathes in unison, `spiral` runs three overlapping waves, `chaos` randomizes each particle's phase. @default "wave" */
  mode?: ParticleHaloMode;
  /** Trail fade per frame (0–0.95). `0` clears fully each frame; higher values smear the previous frame, giving a fluid / dye-trail feel. @default 0 */
  trail?: number;
}

const DEFAULT_COLORS = ["#a3a3a3", "#f8f8f8"];

// Elastic-in approximation — closed-form from easings.net.
const ELASTIC_C = (2 * Math.PI) / 3;
function easeInElastic(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ELASTIC_C);
}

const BACK_S = 2.5;
function easeInBack(t: number): number {
  return (BACK_S + 1) * t * t * t - BACK_S * t * t;
}

function breathe(t: number): number {
  if (t < 0.5) return easeInElastic(t * 2);
  return 1 - easeInBack((t - 0.5) * 2);
}

// Circular lerp on [0, 1) — takes the shortest arc between `a` and `b`. This
// is how cursor-driven progress catches up smoothly even when the angle
// jumps across the 0/1 seam (e.g. 0.95 → 0.05 should travel forward across
// the wrap, not backward 0.9).
function lerpCircular(a: number, b: number, rate: number): number {
  let delta = (((b - a) % 1) + 1) % 1;
  if (delta > 0.5) delta -= 1;
  let next = a + delta * rate;
  next = ((next % 1) + 1) % 1;
  return next;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert "#rrggbb" + alpha into an "rgba()" string. We use this each frame
// to draw the background with a controllable alpha, which is how the trail
// effect works — partial clear leaves the last frame visible underneath.
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

type Particle = {
  i: number; // angular position 0..1
  cos: number;
  sin: number;
  size: number;
  offset: number; // signed radial offset
  colorIndex: number;
  phase: number; // random 0..1 — drives `chaos` mode
};

export function ParticleHalo({
  particleCount,
  colors = DEFAULT_COLORS,
  radius = 0.7,
  intensity = 1,
  duration = 16,
  background = "#050505",
  glow = true,
  glowColor,
  particleSize = [2, 8],
  shape = "circle",
  mode = "wave",
  trail = 0,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: ParticleHaloProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    colors,
    radius,
    intensity,
    duration,
    background,
    shape,
    mode,
    trail,
  });
  useEffect(() => {
    paramsRef.current = {
      colors,
      radius,
      intensity,
      duration,
      background,
      shape,
      mode,
      trail,
    };
  }, [colors, radius, intensity, duration, background, shape, mode, trail]);

  const mouseProgressRef = useRef<number | null>(null);
  const mouseLastMoveRef = useRef(0);
  const autoProgressRef = useRef(0);
  // Displayed progress lags the target through a circular lerp. Fast cursor
  // moves turn into a smooth "catch up" arc instead of a teleport — the wave
  // visibly accelerates without stuttering.
  const displayProgressRef = useRef(0);

  const [sizeMin, sizeMax] = particleSize;

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const rebuild = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const small = width < 600 || height < 600;
      const count = particleCount ?? (small ? 1000 : 1800);
      const paletteLen = Math.max(1, paramsRef.current.colors.length);
      const rand = mulberry32(0xc0ffee);

      particles = new Array(count);
      for (let k = 0; k < count; k++) {
        const t = k / count;
        const angle = t * Math.PI * 2;
        const offset =
          Math.pow(1 + rand(), 2.5) * (rand() * 0.03 - 0.015);
        particles[k] = {
          i: t,
          cos: Math.cos(angle),
          sin: Math.sin(angle),
          size: sizeMin + Math.floor(rand() * (sizeMax - sizeMin + 1)),
          offset,
          colorIndex: Math.floor(rand() * paletteLen),
          phase: rand(),
        };
      }

      // After resize, paint the background once so the trail effect starts
      // from a clean slate (otherwise the first frames look smeared with the
      // old, wrongly-sized canvas content).
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = paramsRef.current.background;
      ctx.fillRect(0, 0, width, height);
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(container);
    rebuild();

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      const p = paramsRef.current;

      autoProgressRef.current =
        (autoProgressRef.current - dt / p.duration + 1) % 1;

      const mouseAge = (now - mouseLastMoveRef.current) / 1000;
      const cursorActive =
        mouseProgressRef.current !== null && mouseAge < 1;

      // Pick a target and the rate the display chases it. Mouse-driven gets
      // a quick rate so fast pointer moves feel responsive; auto gets a
      // gentler rate so the handoff back to auto from where the cursor left
      // it is smooth.
      const target = cursorActive
        ? (mouseProgressRef.current as number)
        : autoProgressRef.current;
      const rate = cursorActive ? 0.22 : 0.08;
      displayProgressRef.current = lerpCircular(
        displayProgressRef.current,
        target,
        rate,
      );
      // Park the auto cycle on the displayed value while the cursor drives
      // so the auto cycle picks up from "wherever the cursor left it" when
      // the user lifts off — no jump back to the auto position at lift.
      if (cursorActive) {
        autoProgressRef.current = displayProgressRef.current;
      }
      const progress = displayProgressRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Trail pass — alpha < 1 leaves the last frame visible underneath, so
      // particles smear into one another. Cap the minimum at 0.05 so the
      // canvas can't go fully saturated.
      const clearAlpha = Math.max(0.05, 1 - Math.min(0.95, p.trail));
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hexToRgba(p.background, clearAlpha);
      ctx.fillRect(0, 0, width, height);

      // Screen blend on the particle pass so overlapping dots add light.
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";

      const cx = width / 2;
      const cy = height / 2;
      const fullSize = Math.min(width, height);
      const baseR = fullSize * 0.5 * p.radius;
      const paletteLen = p.colors.length;

      for (let k = 0; k < particles.length; k++) {
        const part = particles[k];
        // Mode controls how each particle samples the global progress.
        let local: number;
        switch (p.mode) {
          case "pulse":
            local = progress;
            break;
          case "spiral":
            // Three overlapping waves around the ring.
            local = (progress + part.i * 3) % 1;
            break;
          case "chaos":
            // Each particle owns a fixed random phase — no spatial coherence,
            // reads as flickering noise around the ring.
            local = (progress + part.phase) % 1;
            break;
          case "wave":
          default:
            local = (progress + part.i) % 1;
            break;
        }
        const val = breathe(local);
        const r = baseR + val * part.offset * fullSize * p.intensity;
        const x = part.cos * r + cx;
        const y = part.sin * r + cy;
        const color = p.colors[part.colorIndex % paletteLen];

        switch (p.shape) {
          case "square": {
            const s = part.size;
            ctx.fillStyle = color;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
            break;
          }
          case "line": {
            // Radial streak — much longer than a circle's diameter so the
            // shape change reads clearly. Length scales with breathe peak
            // too, so lines visibly elongate at wave crests.
            const len = part.size * 1.5 + val * part.size * 3.5;
            const tx = part.cos;
            const ty = part.sin;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, part.size * 0.5);
            ctx.beginPath();
            ctx.moveTo(x - tx * len, y - ty * len);
            ctx.lineTo(x + tx * len, y + ty * len);
            ctx.stroke();
            break;
          }
          case "spark": {
            // Cross — perpendicular short lines.
            const h = part.size;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - h, y);
            ctx.lineTo(x + h, y);
            ctx.moveTo(x, y - h);
            ctx.lineTo(x, y + h);
            ctx.stroke();
            break;
          }
          case "circle":
          default: {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, part.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, particleCount, sizeMin, sizeMax]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    let angle = Math.atan2(
      e.clientY - rect.top - cy,
      e.clientX - rect.left - cx,
    );
    if (angle < 0) angle += Math.PI * 2;
    mouseProgressRef.current = 1 - angle / (Math.PI * 2);
    mouseLastMoveRef.current = performance.now();
    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    mouseProgressRef.current = null;
    onPointerLeave?.(e);
  };

  const rootStyle: CSSProperties = {
    background,
    ...style,
  };

  // Two stacked drop-shadows — a tight inner glow plus a wider outer halo.
  // CSS filter on canvas IS supported; the previous 3 px single-shadow was
  // just too subtle against a black background to read as glow.
  const glowFill = glowColor ?? colors[colors.length - 1] ?? "#ffffff";
  const dropShadow = glow
    ? `drop-shadow(0 0 4px ${glowFill}) drop-shadow(0 0 14px ${glowFill})`
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={rootStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {!reduced && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ filter: dropShadow }}
        />
      )}
    </div>
  );
}

ParticleHalo.displayName = "ParticleHalo";
