"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export type OrbitCipherEffect = "ripple" | "spiral" | "vortex" | "pulse";

export interface OrbitCipherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Glyph charset — each cell picks one. @default "0123456789ABCDEF" */
  characters?: string;
  /** Cells across the canvas. @default 36 */
  columns?: number;
  /** Cells down the canvas. @default 22 */
  rows?: number;
  /** Effect mode controlling the radial pattern. @default "spiral" */
  effect?: OrbitCipherEffect;
  /** Overall animation speed multiplier. @default 1 */
  speed?: number;
  /** Spatial frequency of the wave pattern. @default 1 */
  waveFrequency?: number;
  /** Wave peak sharpness — higher = thinner ridges. @default 4 */
  wavePower?: number;
  /** Number of arms in `spiral` / `vortex` / `pulse`. @default 3 */
  spiralArms?: number;
  /** Radial darkening exponent — higher = brighter center, darker edges. @default 1.5 */
  falloff?: number;
  /** Baseline alpha so the grid is faintly visible everywhere. @default 0.05 */
  baseAlpha?: number;
  /** Speed of the two-tone color cycle. @default 1 */
  colorSpeed?: number;
  /** How fast each cell cycles its glyph. @default 0.5 */
  glyphChurn?: number;
  /** Primary color (hex). @default "#7c3aed" */
  color1?: string;
  /** Secondary color (hex). @default "#22d3ee" */
  color2?: string;
  /** Background fill (hex). @default "#000000" */
  background?: string;
  /** Master alpha multiplier. @default 1 */
  opacity?: number;
  /** Font size as a fraction of cell width. @default 0.9 */
  fontScale?: number;
}

const DEFAULT_CHARS = "0123456789ABCDEF";
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

export function OrbitCipher({
  characters = DEFAULT_CHARS,
  columns = 36,
  rows = 22,
  effect = "spiral",
  speed = 1,
  waveFrequency = 1,
  wavePower = 4,
  spiralArms = 3,
  falloff = 1.5,
  baseAlpha = 0.05,
  colorSpeed = 1,
  glyphChurn = 0.5,
  color1 = "#7c3aed",
  color2 = "#22d3ee",
  background = "#000000",
  opacity = 1,
  fontScale = 0.9,
  className,
  style,
  ...rest
}: OrbitCipherProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    characters,
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
    glyphChurn,
    color1,
    color2,
    background,
    opacity,
    fontScale,
  });
  useEffect(() => {
    paramsRef.current = {
      characters,
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
      glyphChurn,
      color1,
      color2,
      background,
      opacity,
      fontScale,
    };
  }, [
    characters,
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
    glyphChurn,
    color1,
    color2,
    background,
    opacity,
    fontScale,
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

    // Deterministic per-cell hash → glyph pick.
    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return h - Math.floor(h);
    };

    // Cached palette + the two parsed colors used to detect cache invalidation.
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
      const chars = p.characters || "0";
      const charCount = chars.length;

      const cols = Math.max(2, Math.round(p.columns));
      const rws = Math.max(2, Math.round(p.rows));
      const cellW = width / cols;
      const cellH = height / rws;
      const fScale = Math.max(0.1, Math.min(2, p.fontScale));
      const fontPx = Math.max(4, Math.floor(Math.min(cellW, cellH) * fScale));

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

      // Palette cache — rebuild only when the two colors change.
      const colorKey = `${p.color1}|${p.color2}`;
      if (colorKey !== cachedKey) {
        cachedPalette = buildPalette(
          parseHex(p.color1, { r: 124, g: 58, b: 237 }),
          parseHex(p.color2, { r: 34, g: 211, b: 238 }),
        );
        cachedKey = colorKey;
      }
      const palette = cachedPalette;

      const bg = parseHex(p.background, { r: 0, g: 0, b: 0 });
      ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontPx}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const churnStep = Math.floor(t * p.glyphChurn);

      for (let r = 0; r < rws; r++) {
        const py = (r + 0.5) * cellH;
        const dy = py - cy;
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * cellW;
          const dx = px - cx;
          const dist = Math.hypot(dx, dy);
          const radius = dist / maxR; // ~0..1
          const theta = Math.atan2(dy, dx); // -π..π

          // Effect-specific phase function. Each mode is structurally distinct
          // so the visual silhouettes don't collapse onto one another.
          let phase: number;
          switch (p.effect) {
            case "ripple":
              // Pure concentric rings — no theta term.
              phase = radius * waveFreq * 6 - t * 3;
              break;
            case "vortex":
              // log(radius) winds the arms tightly at the center and counter-
              // rotates relative to spiral, so the two read as opposite motions.
              phase =
                -theta * arms +
                Math.log(Math.max(0.02, radius)) * waveFreq * 6 +
                t * 2.5;
              break;
            case "pulse":
              // Radial pulses modulated by angular petals.
              phase =
                radius * waveFreq * 6 -
                t * 4 +
                Math.cos(theta * Math.max(1, arms)) * 0.6;
              break;
            case "spiral":
            default:
              // Linear spiral — arms uncoil outward at a steady pitch.
              phase = theta * arms + radius * waveFreq * 5 - t * 2;
              break;
          }

          const sineVal = Math.max(0, Math.sin(phase));
          const ridge = Math.pow(sineVal, wavePow);

          // Radial falloff — darken edges so the focus stays on the center.
          const edge = Math.pow(Math.max(0, 1 - radius), fall);

          const intensity = (baseA + ridge * (1 - baseA)) * edge;
          const alpha = Math.min(1, intensity * p.opacity);
          if (alpha < 0.03) continue;

          // Color cycle — uses radius + theta + time so the tint sweeps.
          const mixT =
            0.5 +
            0.5 * Math.sin(radius * 4 + theta * 0.5 - t * p.colorSpeed * 0.8);
          const bucket = Math.max(
            0,
            Math.min(MIX_BUCKETS - 1, Math.floor(mixT * MIX_BUCKETS)),
          );

          const charIdx =
            Math.floor((hash(c, r) * charCount + churnStep) % charCount);

          ctx.fillStyle = palette[bucket];
          ctx.globalAlpha = alpha;
          ctx.fillText(chars[charIdx], px, py);
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

OrbitCipher.displayName = "OrbitCipher";
