"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export interface PixelCursorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Core color — fills the brightest pixels at the center of the trail. @default "#ffffff" */
  color?: string;
  /** Secondary color for the mid-strength ring of pixels. @default "#7c3aed" */
  edgeColor1?: string;
  /** Secondary color for the faintest outer ring of pixels. @default "#22d3ee" */
  edgeColor2?: string;
  /** Square pixel size in px — larger values light fewer, chunkier pixels. @default 8 */
  pixelSize?: number;
  /** Brush radius around the cursor, in px. @default 70 */
  spread?: number;
  /** Fraction (0..1) of cells eligible to light — lower thins the trail out. @default 0.6 */
  density?: number;
  /** Trail half-life — higher values make pixels linger longer. @default 1.5 */
  persistence?: number;
  /**
   * How far the pixels lag behind the cursor (0..1). 0 follows instantly;
   * higher values trail further behind with more delay. @default 0
   */
  lag?: number;
  /** Multiplier applied to draw alpha. @default 1 */
  opacity?: number;
}

export function PixelCursor({
  color = "#ffffff",
  edgeColor1 = "#7c3aed",
  edgeColor2 = "#22d3ee",
  pixelSize = 8,
  spread = 70,
  density = 0.6,
  persistence = 1.5,
  lag = 0,
  opacity = 1,
  className,
  style,
  ...rest
}: PixelCursorProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    color,
    edgeColor1,
    edgeColor2,
    pixelSize,
    spread,
    density,
    persistence,
    lag,
    opacity,
  });
  useEffect(() => {
    paramsRef.current = {
      color,
      edgeColor1,
      edgeColor2,
      pixelSize,
      spread,
      density,
      persistence,
      lag,
      opacity,
    };
  }, [
    color,
    edgeColor1,
    edgeColor2,
    pixelSize,
    spread,
    density,
    persistence,
    lag,
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
    let cells: Float32Array | null = null;
    // Stable per-cell hash (0..1). The dither mask compares it against
    // `density` so the lit subset is deterministic per grid — recomputed only
    // when the grid dimensions change, not every frame.
    let cellRand: Float32Array | null = null;
    let cols = 0;
    let rows = 0;
    let cellPx = Math.max(2, paramsRef.current.pixelSize);
    let width = 0;
    let height = 0;

    const active = new Set<number>();

    const mouseClient = { x: -1e6, y: -1e6 };
    // Lagged brush position — eases toward the cursor each frame. Painting at
    // this point (not the raw cursor) is what produces the delay.
    const smooth = { x: 0, y: 0 };
    const prev = { x: 0, y: 0 };
    let seeded = false;
    let speed = 0;
    let visible = true;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return h - Math.floor(h);
    };

    const rebuildGrid = () => {
      cellPx = Math.max(2, paramsRef.current.pixelSize);
      cols = Math.max(1, Math.ceil(width / cellPx));
      rows = Math.max(1, Math.ceil(height / cellPx));
      const total = cols * rows;
      cells = new Float32Array(total);
      cellRand = new Float32Array(total);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cellRand[i] = hash(c, r);
          i++;
        }
      }
      active.clear();
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
      rebuildGrid();
    };

    // Restart the loop only if it's currently parked. The loop parks itself
    // (raf = 0) whenever there's nothing to animate, so it isn't burning a
    // 60fps frame on an idle, motionless cursor.
    const ensureRunning = () => {
      if (raf === 0 && visible) raf = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseClient.x = e.clientX;
      mouseClient.y = e.clientY;
      ensureRunning();
    };

    const tick = () => {
      raf = 0;
      if (!visible) return;

      const params = paramsRef.current;
      if (cellPx !== Math.max(2, params.pixelSize)) rebuildGrid();

      const rect = container.getBoundingClientRect();
      const targetX = mouseClient.x - rect.left;
      const targetY = mouseClient.y - rect.top;

      if (!seeded) {
        // No cursor seen yet — stay parked (don't reschedule) until the first
        // mousemove wakes the loop and snaps the lagged point onto the cursor
        // (avoids a streak from the off-screen sentinel position).
        if (mouseClient.x < -1e5) return;
        smooth.x = targetX;
        smooth.y = targetY;
        prev.x = targetX;
        prev.y = targetY;
        seeded = true;
      }

      const follow = 1 - Math.min(0.98, Math.max(0, params.lag));
      smooth.x += (targetX - smooth.x) * follow;
      smooth.y += (targetY - smooth.y) * follow;

      const dx = smooth.x - prev.x;
      const dy = smooth.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      speed += (dist - speed) * 0.12;
      prev.x = smooth.x;
      prev.y = smooth.y;

      const speedFactor = Math.min(1, speed / 12);
      const radius = Math.max(1, params.spread);
      const decay = 0.02 / Math.max(0.1, params.persistence);

      if (cells && cellRand) {
        if (speedFactor > 0.001) {
          const cx = smooth.x;
          const cy = smooth.y;
          const minCol = Math.max(0, Math.floor((cx - radius) / cellPx));
          const maxCol = Math.min(cols - 1, Math.floor((cx + radius) / cellPx));
          const minRow = Math.max(0, Math.floor((cy - radius) / cellPx));
          const maxRow = Math.min(rows - 1, Math.floor((cy + radius) / cellPx));
          const radius2 = radius * radius;
          const invRadius = 1 / radius;
          const half = cellPx * 0.5;
          const density = params.density;
          for (let r = minRow; r <= maxRow; r++) {
            const py = r * cellPx + half;
            const rowStart = r * cols;
            const dyc = py - cy;
            const dy2 = dyc * dyc;
            for (let c = minCol; c <= maxCol; c++) {
              const i = rowStart + c;
              // Dither: cells above the density cut never light, leaving the
              // sparse pixel speckle.
              if (cellRand[i] > density) continue;
              const px = c * cellPx + half;
              const dxc = px - cx;
              const d2 = dxc * dxc + dy2;
              if (d2 > radius2) continue;
              const t = 1 - Math.sqrt(d2) * invRadius;
              const brush = t * t * (3 - 2 * t) * speedFactor;
              if (brush > cells[i]) {
                cells[i] = brush;
                active.add(i);
              }
            }
          }
        }

        ctx.clearRect(0, 0, width, height);
        const cw = Math.max(1, cellPx - 1);

        for (const i of active) {
          const v = cells[i] - decay;
          if (v <= 0) {
            cells[i] = 0;
            active.delete(i);
            continue;
          }
          cells[i] = v;
          if (v < 0.02) continue;
          // Intensity band: bright core = main color, weaker rings step out to
          // the two secondary colors.
          ctx.fillStyle =
            v >= 0.66
              ? params.color
              : v >= 0.33
                ? params.edgeColor1
                : params.edgeColor2;
          ctx.globalAlpha = Math.min(1, v * params.opacity);
          const c = i % cols;
          const r = (i / cols) | 0;
          ctx.fillRect(c * cellPx, r * cellPx, cw, cw);
        }
        ctx.globalAlpha = 1;
      }

      // Keep animating only while pixels are still decaying or the lagged
      // point is still catching up to the cursor. Otherwise park the loop —
      // the next mousemove (or re-entry into view) wakes it again.
      const settled =
        Math.abs(targetX - smooth.x) < 0.5 && Math.abs(targetY - smooth.y) < 0.5;
      if (active.size > 0 || !settled) {
        raf = requestAnimationFrame(tick);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const wasVisible = visible;
          visible = e.isIntersecting;
          if (visible && !wasVisible) ensureRunning();
        }
      },
      { threshold: 0.01, rootMargin: "100px" },
    );
    io.observe(container);

    ensureRunning();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [reduced]);

  const rootStyle: CSSProperties = {
    pointerEvents: "none",
    ...style,
  };

  const rootClass = `absolute inset-0 overflow-hidden ${className ?? ""}`;

  if (reduced) {
    return (
      <div ref={containerRef} className={rootClass} style={rootStyle} {...rest} />
    );
  }

  return (
    <div ref={containerRef} className={rootClass} style={rootStyle} {...rest}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

PixelCursor.displayName = "PixelCursor";
