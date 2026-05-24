"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export interface HorizonCipherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Glyph charset — each cell picks one. @default "0123456789ABCDEF" */
  characters?: string;
  /** Number of columns across the canvas at the near row. Cell width auto-derives from `width / columns`. @default 32 */
  columns?: number;
  /** Number of depth rows from near to horizon. @default 22 */
  depthRows?: number;
  /** Vanishing-point Y, in 0..1 (0 = top, 1 = bottom). @default 0.35 */
  vanishY?: number;
  /** Perspective curvature exponent. Higher = stronger horizon compression. @default 2 */
  curve?: number;
  /** Cell scale at the horizon, relative to the near row. @default 0.25 */
  farScale?: number;
  /** Font size as a fraction of the cell width. @default 0.9 */
  fontScale?: number;
  /** Vertical scroll speed — rows advance toward the camera. @default 1 */
  scrollSpeed?: number;
  /** Wave traveling speed across columns. @default 1 */
  waveSpeed?: number;
  /** Wave peak sharpness; higher = thinner, brighter ridges. @default 6 */
  wavePower?: number;
  /** How many ridge crests fit across the grid. @default 3 */
  waveFrequency?: number;
  /** Lateral wobble amplitude — how much each ridge curves with depth. @default 1.4 */
  waveAmplitude?: number;
  /** Baseline alpha applied to every glyph so the grid is faintly visible. @default 0.07 */
  baseAlpha?: number;
  /** Color cycle rate between the two tones. @default 1 */
  colorSpeed?: number;
  /** Primary color (hex). @default "#290596" */
  color1?: string;
  /** Secondary color (hex). @default "#93229D" */
  color2?: string;
  /** Background fill (hex). @default "#000000" */
  background?: string;
  /** Master alpha multiplier. @default 1 */
  opacity?: number;
}

const DEFAULT_CHARS = "0123456789ABCDEF";

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string, fallback: Rgb = { r: 0, g: 0, b: 0 }): Rgb {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return fallback;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export function HorizonCipher({
  characters = DEFAULT_CHARS,
  columns = 32,
  depthRows = 22,
  vanishY = 0.35,
  curve = 2,
  farScale = 0.25,
  fontScale = 0.9,
  scrollSpeed = 1,
  waveSpeed = 1,
  wavePower = 6,
  waveFrequency = 3,
  waveAmplitude = 1.4,
  baseAlpha = 0.07,
  colorSpeed = 1,
  color1 = "#290596",
  color2 = "#93229D",
  background = "#000000",
  opacity = 1,
  className,
  style,
  ...rest
}: HorizonCipherProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    characters,
    columns,
    depthRows,
    vanishY,
    curve,
    farScale,
    fontScale,
    scrollSpeed,
    waveSpeed,
    wavePower,
    waveFrequency,
    waveAmplitude,
    baseAlpha,
    colorSpeed,
    color1,
    color2,
    background,
    opacity,
  });
  useEffect(() => {
    paramsRef.current = {
      characters,
      columns,
      depthRows,
      vanishY,
      curve,
      farScale,
      fontScale,
      scrollSpeed,
      waveSpeed,
      wavePower,
      waveFrequency,
      waveAmplitude,
      baseAlpha,
      colorSpeed,
      color1,
      color2,
      background,
      opacity,
    };
  }, [
    characters,
    columns,
    depthRows,
    vanishY,
    curve,
    farScale,
    fontScale,
    scrollSpeed,
    waveSpeed,
    wavePower,
    waveFrequency,
    waveAmplitude,
    baseAlpha,
    colorSpeed,
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

    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return h - Math.floor(h);
    };

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
      const t = (performance.now() - startTime) / 1000;
      const chars = p.characters || "0";
      const charCount = chars.length;

      const cols = Math.max(2, Math.round(p.columns));
      const rows = Math.max(2, Math.round(p.depthRows));
      const vp = Math.max(0, Math.min(0.95, p.vanishY)) * height;
      const bottomY = height;
      const curveExp = Math.max(0.2, p.curve);
      const farS = Math.max(0.02, Math.min(1, p.farScale));
      // Cell width at the near row fills the canvas — adding columns increases
      // density rather than stretching the grid past the canvas edges.
      const baseCellW = width / cols;
      const fScale = Math.max(0.1, Math.min(2, p.fontScale));

      const scrollPhase = (t * p.scrollSpeed) % 1;
      const scrollInt = Math.floor(t * p.scrollSpeed);

      const c1 = parseHex(p.color1, { r: 80, g: 0, b: 200 });
      const c2 = parseHex(p.color2, { r: 200, g: 50, b: 200 });
      const bg = parseHex(p.background, { r: 0, g: 0, b: 0 });

      // Solid background each frame — replaces ctx.clearRect.
      ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wave parameters.
      const waveFreq = Math.max(0.1, p.waveFrequency);
      const waveAmp = p.waveAmplitude;
      const wavePow = Math.max(0.2, p.wavePower);
      const baseA = Math.max(0, Math.min(0.5, p.baseAlpha));
      // Map column index → ridge-x in [0, 2π * waveFreq] so `sin(wcX)` repeats `waveFreq` times.
      const colToWaveX = (Math.PI * 2 * waveFreq) / cols;

      // Draw back-to-front so closer rows occlude further ones. We iterate a
      // wider range than the visible rows so new lines flow in from the horizon
      // and old ones drift past the bottom without snapping.
      for (let r = rows + 1; r >= -2; r--) {
        // Apply fractional scroll so the grid drifts smoothly between integer steps.
        const depth = r - scrollPhase;
        const dt = depth / rows; // 0 = closest, 1 = horizon, can dip < 0 or > 1
        if (dt < -0.6 || dt > 1.3) continue;
        // Safe perspective curve for negative `dt` (rows that already passed the camera).
        const tCurve =
          dt < 0
            ? -Math.pow(-dt, 1 / curveExp)
            : Math.pow(dt, 1 / curveExp);
        const screenY = bottomY + (vp - bottomY) * tCurve;
        if (screenY < -baseCellW || screenY > height + baseCellW) continue;
        const rowScale = Math.max(0.05, 1 - tCurve * (1 - farS));
        const cellW = baseCellW * rowScale;
        const fontPx = Math.max(4, Math.floor(cellW * fScale));
        ctx.font = `bold ${fontPx}px monospace`;

        // Depth-based dimming — far rows feather into the background; near rows
        // (past the camera) stay solid. Clamp so the alpha multiplier is finite.
        const depthAlpha = Math.max(
          0,
          Math.min(1, 1 - Math.max(0, tCurve) * 0.6),
        );
        const centerX = width / 2;

        // World row used for glyph picks — stable identity across the integer
        // scroll boundary, so glyphs travel with the row instead of reshuffling.
        const worldR = scrollInt + r;
        // Per-row wobble: distorts the ridge x as a function of depth, giving
        // the wave its characteristic vertical curve.
        const wobble = waveAmp * Math.sin(r * 0.32 - t * p.waveSpeed);

        for (let c = 0; c < cols; c++) {
          const colOffset = c - (cols - 1) / 2;
          const screenX = centerX + colOffset * cellW;
          if (screenX < -cellW || screenX > width + cellW) continue;

          // Vertical ridge that wobbles with depth — `pow(sin, wavePower)` keeps it thin.
          const wcX = c * colToWaveX + wobble;
          const sineVal = Math.max(0, Math.sin(wcX));
          const ridge = Math.pow(sineVal, wavePow);

          // Base layer + ridge highlight. Every cell shows a faint glyph so the
          // perspective grid is always visible; the ridge layers brighter color on top.
          const intensity = baseA + ridge * (1 - baseA);
          const alpha = Math.min(1, intensity * depthAlpha * p.opacity);
          if (alpha < 0.03) continue;

          // Two-tone color cycle — uses the wobbled coords so the band drifts with the wave.
          const mixPhase =
            Math.sin(-wcX + r * 0.25 - t * p.colorSpeed * 0.8) * 0.5 + 0.5;
          const rr = Math.round(c1.r + (c2.r - c1.r) * mixPhase);
          const gg = Math.round(c1.g + (c2.g - c1.g) * mixPhase);
          const bb = Math.round(c1.b + (c2.b - c1.b) * mixPhase);

          const charIdx = Math.floor(hash(c, worldR) * charCount) % charCount;

          ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, ${alpha.toFixed(3)})`;
          ctx.fillText(chars[charIdx], screenX, screenY);
        }
      }

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

HorizonCipher.displayName = "HorizonCipher";
