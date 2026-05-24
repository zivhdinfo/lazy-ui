"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export interface CircleCipherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Glyph charset — each lit cell picks one at random. @default "✶✤↣⌧✷*.;:" */
  characters?: string;
  /** Cell size in px — smaller = denser grid. @default 24 */
  size?: number;
  /** CSS color used to draw the glyphs. @default "#00ff00" */
  color?: string;
  /** Brush radius around the cursor, in px. @default 80 */
  spread?: number;
  /** Trail half-life — higher values make glyphs linger. @default 2 */
  persistence?: number;
  /** Fade each glyph by its current trail strength. @default true */
  enableFade?: boolean;
  /** Multiplier applied to draw alpha. @default 1 */
  opacity?: number;
}

const DEFAULT_CHARS = "✶✤↣⌧✷*.;:";

export function CircleCipher({
  characters = DEFAULT_CHARS,
  size = 24,
  color = "#00ff00",
  spread = 80,
  persistence = 2,
  enableFade = true,
  opacity = 1,
  className,
  style,
  ...rest
}: CircleCipherProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    characters,
    size,
    color,
    spread,
    persistence,
    enableFade,
    opacity,
  });
  useEffect(() => {
    paramsRef.current = {
      characters,
      size,
      color,
      spread,
      persistence,
      enableFade,
      opacity,
    };
  }, [characters, size, color, spread, persistence, enableFade, opacity]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cells: Float32Array | null = null;
    // Per-cell precomputed data — only depends on grid dimensions, not props.
    // Computing once instead of per-frame eliminates ~2 Math.sin calls × every
    // cell × 60fps (the original bottleneck on large grids).
    let cellHash: Float32Array | null = null;
    let skipMask: Uint8Array | null = null;
    let cols = 0;
    let rows = 0;
    let cellPx = paramsRef.current.size;
    let width = 0;
    let height = 0;

    // Active cell indices. Only iterate these — typically tens to hundreds vs.
    // the full grid (thousands+). Cells enter on brush, exit on decay-to-zero.
    const active = new Set<number>();

    // Mouse coords stored in viewport (clientX/Y) space; converted to canvas
    // space once per frame so we only force one layout read per frame instead
    // of one per mousemove event.
    const mouseClient = { x: -1e6, y: -1e6 };
    const mouse = { x: -1e6, y: -1e6 };
    const prev = { x: -1e6, y: -1e6 };
    let speed = 0;
    let visible = true;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return h - Math.floor(h);
    };

    const rebuildGrid = () => {
      cellPx = Math.max(4, paramsRef.current.size);
      cols = Math.max(1, Math.ceil(width / cellPx));
      rows = Math.max(1, Math.ceil(height / cellPx));
      const total = cols * rows;
      cells = new Float32Array(total);
      cellHash = new Float32Array(total);
      skipMask = new Uint8Array(total);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cellHash[i] = hash(c, r);
          // 28% of cells stay dark for the speckled look.
          skipMask[i] = hash(c + 10, r + 10) > 0.72 ? 1 : 0;
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

    const onMouseMove = (e: MouseEvent) => {
      mouseClient.x = e.clientX;
      mouseClient.y = e.clientY;
    };

    const tick = () => {
      raf = 0;
      if (!visible) return;

      // Single layout read per frame — much cheaper than reading on every
      // mousemove event (which can fire >100Hz on high-refresh setups).
      const rect = container.getBoundingClientRect();
      mouse.x = mouseClient.x - rect.left;
      mouse.y = mouseClient.y - rect.top;

      const params = paramsRef.current;
      if (cellPx !== params.size) rebuildGrid();

      const dx = mouse.x - prev.x;
      const dy = mouse.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      speed += (dist - speed) * 0.12;
      prev.x = mouse.x;
      prev.y = mouse.y;

      const speedFactor = Math.min(1, speed / 12);
      const radius = Math.max(1, params.spread);
      const decay = 0.02 / Math.max(0.1, params.persistence);

      if (cells && cellHash && skipMask) {
        // Brush — skip entirely when the cursor is essentially still. Saves
        // the bounding-box scan when nothing is changing.
        if (speedFactor > 0.001) {
          const minCol = Math.max(0, Math.floor((mouse.x - radius) / cellPx));
          const maxCol = Math.min(cols - 1, Math.floor((mouse.x + radius) / cellPx));
          const minRow = Math.max(0, Math.floor((mouse.y - radius) / cellPx));
          const maxRow = Math.min(rows - 1, Math.floor((mouse.y + radius) / cellPx));
          const radius2 = radius * radius;
          const invRadius = 1 / radius;
          const half = cellPx * 0.5;
          for (let r = minRow; r <= maxRow; r++) {
            const py = r * cellPx + half;
            const rowStart = r * cols;
            const dyc = py - mouse.y;
            const dy2 = dyc * dyc;
            for (let c = minCol; c <= maxCol; c++) {
              const px = c * cellPx + half;
              const dxc = px - mouse.x;
              const d2 = dxc * dxc + dy2;
              if (d2 > radius2) continue;
              const t = 1 - Math.sqrt(d2) * invRadius;
              const brush = t * t * (3 - 2 * t) * speedFactor;
              const i = rowStart + c;
              if (brush > cells[i]) {
                cells[i] = brush;
                active.add(i);
              }
            }
          }
        }

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = params.color;
        ctx.font = `bold ${Math.floor(cellPx * 0.8)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalCompositeOperation = "lighter";

        const chars = params.characters;
        const charCount = chars.length || 1;
        const half = cellPx * 0.5;

        // Iterate only active cells. Set.delete during iteration is well-defined
        // (the iterator skips removed entries).
        for (const i of active) {
          const v = cells[i] - decay;
          if (v <= 0) {
            cells[i] = 0;
            active.delete(i);
            continue;
          }
          cells[i] = v;
          if (v < 0.02 || skipMask[i]) continue;
          const charIdx = (cellHash[i] * charCount) | 0;
          const fade = params.enableFade ? v : 1;
          ctx.globalAlpha = Math.min(1, fade * params.opacity);
          const c = i % cols;
          const r = (i / cols) | 0;
          ctx.fillText(chars[charIdx], c * cellPx + half, r * cellPx + half);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Pause the RAF loop when the container is offscreen — biggest single
    // saving when the cipher zone spans a long page.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const wasVisible = visible;
          visible = e.isIntersecting;
          if (visible && !wasVisible && raf === 0) {
            raf = requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.01, rootMargin: "100px" },
    );
    io.observe(container);

    raf = requestAnimationFrame(tick);

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
    return <div ref={containerRef} className={rootClass} style={rootStyle} {...rest} />;
  }

  return (
    <div ref={containerRef} className={rootClass} style={rootStyle} {...rest}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

CircleCipher.displayName = "CircleCipher";
