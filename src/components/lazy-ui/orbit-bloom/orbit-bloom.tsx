"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export type OrbitBloomEffect = "ripple" | "spiral" | "vortex" | "pulse";

export interface OrbitBloomProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Cells across the canvas. @default 28 */
  columns?: number;
  /** Cells down the canvas. @default 18 */
  rows?: number;
  /** Effect mode controlling the radial pattern. @default "spiral" */
  effect?: OrbitBloomEffect;
  /** Overall animation speed multiplier. @default 1 */
  speed?: number;
  /** Spatial frequency of the wave pattern. @default 1 */
  waveFrequency?: number;
  /** Wave peak sharpness — higher = thinner ridges. @default 3 */
  wavePower?: number;
  /** Number of arms in `spiral` / `vortex` / `pulse`. @default 3 */
  spiralArms?: number;
  /** Radial darkening exponent — higher concentrates brightness at the center. @default 1.5 */
  falloff?: number;
  /** Baseline alpha so the grid is faintly visible everywhere. @default 0.06 */
  baseAlpha?: number;
  /** Speed of the two-tone color cycle. @default 1 */
  colorSpeed?: number;
  /** Base shape: 0 = circle, 1 = square, 0.5 = squircle. @default 0.4 */
  shape?: number;
  /** Speed at which the shape oscillates between circle and square. 0 disables shifting. @default 0.3 */
  shapeShift?: number;
  /** Cell fill ratio at full intensity — shape side as a fraction of cell width. @default 0.8 */
  fillRatio?: number;
  /** Primary color (hex). @default "#7c3aed" */
  color1?: string;
  /** Secondary color (hex). @default "#f0abfc" */
  color2?: string;
  /** Background fill (hex). @default "#000000" */
  background?: string;
  /** Master alpha multiplier. @default 1 */
  opacity?: number;
}

const MIX_BUCKETS = 32;

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string, fallback: Rgb): Rgb {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return fallback;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function buildPalette(c1: Rgb, c2: Rgb): string[] {
  const palette = new Array<string>(MIX_BUCKETS);
  for (let i = 0; i < MIX_BUCKETS; i++) {
    const t = i / (MIX_BUCKETS - 1);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    palette[i] = `rgb(${r},${g},${b})`;
  }
  return palette;
}

// Manual rounded-square path so we don't depend on roundRect availability.
function tracedSquircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  cornerRadius: number,
) {
  const r = Math.min(cornerRadius, size / 2);
  const right = x + size;
  const bottom = y + size;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(right - r, y);
  ctx.quadraticCurveTo(right, y, right, y + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(x + r, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function OrbitBloom({
  columns = 28,
  rows = 18,
  effect = "spiral",
  speed = 1,
  waveFrequency = 1,
  wavePower = 3,
  spiralArms = 3,
  falloff = 1.5,
  baseAlpha = 0.06,
  colorSpeed = 1,
  shape = 0.4,
  shapeShift = 0.3,
  fillRatio = 0.8,
  color1 = "#7c3aed",
  color2 = "#f0abfc",
  background = "#000000",
  opacity = 1,
  className,
  style,
  ...rest
}: OrbitBloomProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    columns,
    rows,
    effect,
    speed,
    waveFrequency,
    wavePower,
    spiralArms,
    falloff,
    baseAlpha,
    colorSpeed,
    shape,
    shapeShift,
    fillRatio,
    color1,
    color2,
    background,
    opacity,
  });
  useEffect(() => {
    paramsRef.current = {
      columns,
      rows,
      effect,
      speed,
      waveFrequency,
      wavePower,
      spiralArms,
      falloff,
      baseAlpha,
      colorSpeed,
      shape,
      shapeShift,
      fillRatio,
      color1,
      color2,
      background,
      opacity,
    };
  }, [
    columns,
    rows,
    effect,
    speed,
    waveFrequency,
    wavePower,
    spiralArms,
    falloff,
    baseAlpha,
    colorSpeed,
    shape,
    shapeShift,
    fillRatio,
    color1,
    color2,
    background,
    opacity,
  ]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const startTime = performance.now();

    let cachedPalette: string[] = [];
    let cachedKey = "";

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const tick = () => {
      const p = paramsRef.current;
      const t = ((performance.now() - startTime) / 1000) * p.speed;

      const cols = Math.max(2, Math.round(p.columns));
      const rws = Math.max(2, Math.round(p.rows));
      const cellW = width / cols;
      const cellH = height / rws;
      const cellMin = Math.min(cellW, cellH);
      const fill = Math.max(0.05, Math.min(1, p.fillRatio));

      // Center is fixed at the canvas middle to keep the animation balanced
      // across the family.
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.hypot(cx, cy);

      const wavePow = Math.max(0.2, p.wavePower);
      const waveFreq = Math.max(0.1, p.waveFrequency);
      const arms = Math.max(0, p.spiralArms);
      const fall = Math.max(0.2, p.falloff);
      const baseA = Math.max(0, Math.min(0.5, p.baseAlpha));

      // Palette cache.
      const colorKey = `${p.color1}|${p.color2}`;
      if (colorKey !== cachedKey) {
        cachedPalette = buildPalette(
          parseHex(p.color1, { r: 124, g: 58, b: 237 }),
          parseHex(p.color2, { r: 240, g: 171, b: 252 }),
        );
        cachedKey = colorKey;
      }
      const palette = cachedPalette;

      // Background fill.
      const bg = parseHex(p.background, { r: 0, g: 0, b: 0 });
      ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
      ctx.fillRect(0, 0, width, height);

      // Base shape value, with an optional time oscillation. The wave that
      // travels through the grid also nudges the shape outward, so cells
      // riding a crest tend to morph together.
      const shapeBase = Math.max(0, Math.min(1, p.shape));
      const shapeOsc =
        p.shapeShift > 0
          ? 0.5 * Math.sin(t * p.shapeShift * Math.PI * 2)
          : 0;

      for (let r = 0; r < rws; r++) {
        const py = (r + 0.5) * cellH;
        const dy = py - cy;
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * cellW;
          const dx = px - cx;
          const dist = Math.hypot(dx, dy);
          const radius = dist / maxR;
          const theta = Math.atan2(dy, dx);

          // Effect phase — same vocabulary as OrbitCipher so the silhouettes
          // map across the family.
          let phase: number;
          switch (p.effect) {
            case "ripple":
              phase = radius * waveFreq * 6 - t * 3;
              break;
            case "vortex":
              phase =
                -theta * arms +
                Math.log(Math.max(0.02, radius)) * waveFreq * 6 +
                t * 2.5;
              break;
            case "pulse":
              phase =
                radius * waveFreq * 6 -
                t * 4 +
                Math.cos(theta * Math.max(1, arms)) * 0.6;
              break;
            case "spiral":
            default:
              phase = theta * arms + radius * waveFreq * 5 - t * 2;
              break;
          }

          const sineVal = Math.max(0, Math.sin(phase));
          const ridge = Math.pow(sineVal, wavePow);
          const edge = Math.pow(Math.max(0, 1 - radius), fall);
          const intensity = (baseA + ridge * (1 - baseA)) * edge;
          const alpha = Math.min(1, intensity * p.opacity);
          if (alpha < 0.03) continue;

          // Color cycle — radius + theta + time.
          const mixT =
            0.5 +
            0.5 *
              Math.sin(radius * 4 + theta * 0.5 - t * p.colorSpeed * 0.8);
          const bucket = Math.max(
            0,
            Math.min(MIX_BUCKETS - 1, Math.floor(mixT * MIX_BUCKETS)),
          );

          // Cells on a crest bloom larger; off-crest cells stay as small dots.
          const sizeScale = 0.45 + 0.55 * intensity;
          const drawSize = cellMin * fill * sizeScale;
          const halfSize = drawSize / 2;

          // Per-cell shape mixes base, time oscillation, and a small radial
          // bias so shapes morph outward from the center.
          const cellShape = Math.max(
            0,
            Math.min(1, shapeBase + shapeOsc + (radius - 0.5) * 0.4),
          );
          const cornerR = (1 - cellShape) * halfSize;

          ctx.fillStyle = palette[bucket];
          ctx.globalAlpha = alpha;
          tracedSquircle(
            ctx,
            px - halfSize,
            py - halfSize,
            drawSize,
            cornerR,
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  const rootStyle: CSSProperties = {
    pointerEvents: "none",
    background,
    ...style,
  };

  const rootClass = `absolute inset-0 overflow-hidden ${className ?? ""}`;

  if (reduced) {
    return <div ref={containerRef} className={rootClass} style={rootStyle} {...rest} />;
  }

  return (
    <div ref={containerRef} className={rootClass} style={rootStyle} {...rest}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

OrbitBloom.displayName = "OrbitBloom";
