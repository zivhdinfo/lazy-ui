"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export interface WaveCipherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Number of vertical column bands. @default 3 */
  columns?: number;
  /** Bright bands sit at column EDGES instead of centers. @default false */
  invertColumns?: boolean;
  /** Width of the bright band inside each column, in 0..1 of the column half-width. Wider = thicker glyph river. @default 0.6 */
  bandWidth?: number;
  /** Glyph charset — each cell picks one. @default "0123456789ABCDEF" */
  characters?: string;
  /** CSS color used for the glyphs. @default "#d4d4d4" */
  color?: string;
  /** Wave travel speed. @default 0.8 */
  speed?: number;
  /** Cell size in pixels — smaller = denser. @default 16 */
  size?: number;
  /** Exponent applied to wave peaks. Higher = darker valleys, sharper crests. @default 2 */
  noisePower?: number;
  /** How fast each cell cycles its glyph. @default 0.6 */
  glyphChurn?: number;
  /** Multiplier on draw alpha. @default 1 */
  opacity?: number;
}

const DEFAULT_CHARS = "0123456789ABCDEF";

export function WaveCipher({
  columns = 3,
  invertColumns = false,
  bandWidth = 0.6,
  characters = DEFAULT_CHARS,
  color = "#d4d4d4",
  speed = 0.8,
  size = 16,
  noisePower = 2,
  glyphChurn = 0.6,
  opacity = 1,
  className,
  style,
  ...rest
}: WaveCipherProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    columns,
    invertColumns,
    bandWidth,
    characters,
    color,
    speed,
    size,
    noisePower,
    glyphChurn,
    opacity,
  });
  useEffect(() => {
    paramsRef.current = {
      columns,
      invertColumns,
      bandWidth,
      characters,
      color,
      speed,
      size,
      noisePower,
      glyphChurn,
      opacity,
    };
  }, [
    columns,
    invertColumns,
    bandWidth,
    characters,
    color,
    speed,
    size,
    noisePower,
    glyphChurn,
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

    // Stable per-cell hash → glyph pick + dropout decision per coord.
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
      const cellPx = Math.max(4, p.size);
      const cols = Math.max(1, Math.round(p.columns));
      const colWidth = width / cols;
      const subCols = Math.max(1, Math.floor(colWidth / cellPx));
      const rows = Math.max(1, Math.ceil(height / cellPx));
      const t = ((performance.now() - startTime) / 1000) * p.speed;
      const chars = p.characters || "0";
      const charCount = chars.length;
      const churnStep = Math.floor(t * p.glyphChurn);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = p.color;
      ctx.font = `bold ${Math.floor(cellPx * 0.85)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let col = 0; col < cols; col++) {
        const colCenter = (col + 0.5) * colWidth;
        // Phase offset per column → waves don't sync between columns.
        const phase = col * 1.7;

        const bw = Math.max(0.05, Math.min(1, p.bandWidth));

        for (let sx = 0; sx < subCols; sx++) {
          const xPos = col * colWidth + (sx + 0.5) * (colWidth / subCols);
          // Distance from column center, normalized to 0..1.
          const distFromCenter = Math.abs(xPos - colCenter) / (colWidth / 2);
          // bandWidth controls how wide the bright zone is:
          //  - default:  bright when distFromCenter < bandWidth (centered river).
          //  - inverted: bright when distFromCenter > (1 - bandWidth) (edge rim).
          let edge: number;
          if (p.invertColumns) {
            const inner = 1 - bw;
            if (distFromCenter <= inner) {
              edge = 0;
            } else {
              const tIn = (distFromCenter - inner) / bw;
              edge = tIn * tIn * (3 - 2 * tIn);
            }
          } else {
            if (distFromCenter >= bw) {
              edge = 0;
            } else {
              const tIn = 1 - distFromCenter / bw;
              edge = tIn * tIn * (3 - 2 * tIn);
            }
          }
          if (edge < 0.04) continue;

          for (let row = 0; row < rows; row++) {
            const yPos = (row + 0.5) * cellPx;
            // Vertical traveling wave — crests slide down the column over time.
            const wave = 0.5 + 0.5 * Math.sin(row * 0.4 - t * 3 - phase);
            let intensity = wave * edge;
            intensity = Math.pow(intensity, Math.max(0.1, p.noisePower));
            if (intensity < 0.06) continue;
            // 30% dropout — speckled, not gridded.
            if (hash(col * 31 + sx, row + 7) > 0.7) continue;

            const charIdx =
              Math.floor(
                (hash(col * 11 + sx, row) * charCount + churnStep) %
                  charCount,
              );

            ctx.globalAlpha = Math.min(1, intensity * p.opacity);
            ctx.fillText(chars[charIdx], xPos, yPos);
          }
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

WaveCipher.displayName = "WaveCipher";
