"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { useReducedMotion } from "motion/react";

export type PixelDitherShape = "square" | "circle";
export type PixelDitherColorMode = "original" | "mono";
export type PixelDitherIntroFrom =
  | "random"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center";
export type PixelDitherObjectFit = "cover" | "contain";

export interface PixelDitherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Image URL rendered as a grid of dithered pixels. */
  src: string;
  /** Accessible label applied to the container. @default "" */
  alt?: string;
  /** Side length of each pixel cell, in px. @default 6 */
  pixelSize?: number;
  /** Empty gap trailing each cell, in px. @default 1 */
  gap?: number;
  /** Cell shape. @default "square" */
  shape?: PixelDitherShape;
  /** Sample the image's real colors, or reduce it to two flat tones with
   *  ordered (Bayer) dithering. @default "original" */
  colorMode?: PixelDitherColorMode;
  /** Dark tone used in "mono" mode. @default "#09090b" */
  darkColor?: string;
  /** Light tone used in "mono" mode. @default "#f4f4f5" */
  lightColor?: string;
  /** Fraction (0..1) of cells that render — lower thins the image into a
   *  sparser dither speckle. @default 1 */
  density?: number;
  /** Enable the pointer displacement field. @default true */
  interactive?: boolean;
  /** Pointer influence radius, in px. @default 110 */
  interactionRadius?: number;
  /** Peak pixel displacement at the pointer center, in px. @default 26 */
  strength?: number;
  /** Play a one-time assemble-in animation once the image is ready.
   *  @default true */
  intro?: boolean;
  /** Where scattered pixels originate from before assembling into place.
   *  @default "random" */
  introFrom?: PixelDitherIntroFrom;
  /** Intro duration, in seconds. @default 1.4 */
  introDuration?: number;
  /** How the image is fit into the container. @default "cover" */
  objectFit?: PixelDitherObjectFit;
}

const TAU = Math.PI * 2;
const DISPLACEMENT_EASE = 0.18;
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutCubic = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

// Stable per-cell pseudo-random hash (0..1) — drives the density mask, the
// intro's per-cell stagger, and the "random" scatter direction/distance.
function hash(x: number, y: number): number {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

export function PixelDither({
  src,
  alt = "",
  pixelSize = 6,
  gap = 1,
  shape = "square",
  colorMode = "original",
  darkColor = "#09090b",
  lightColor = "#f4f4f5",
  density = 1,
  interactive = true,
  interactionRadius = 110,
  strength = 26,
  intro = true,
  introFrom = "random",
  introDuration = 1.4,
  objectFit = "cover",
  className,
  style,
  ...rest
}: PixelDitherProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    src,
    pixelSize,
    gap,
    shape,
    colorMode,
    darkColor,
    lightColor,
    density,
    interactive,
    interactionRadius,
    strength,
    intro,
    introFrom,
    introDuration,
    objectFit,
  });
  useEffect(() => {
    paramsRef.current = {
      src,
      pixelSize,
      gap,
      shape,
      colorMode,
      darkColor,
      lightColor,
      density,
      interactive,
      interactionRadius,
      strength,
      intro,
      introFrom,
      introDuration,
      objectFit,
    };
  }, [
    src,
    pixelSize,
    gap,
    shape,
    colorMode,
    darkColor,
    lightColor,
    density,
    interactive,
    interactionRadius,
    strength,
    intro,
    introFrom,
    introDuration,
    objectFit,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let isCancelled = false;
    let raf = 0;
    let visible = true;
    let width = 0;
    let height = 0;

    let img: HTMLImageElement | null = null;
    let imageReady = false;
    let loadedSrc = "";
    let gridKey = "";

    // Cell buffers. `count` cells occupy indices [0, count) of every array —
    // rebuilt (and possibly resized) whenever the grid regenerates.
    let count = 0;
    let targetX = new Float32Array(0);
    let targetY = new Float32Array(0);
    let scatterX = new Float32Array(0);
    let scatterY = new Float32Array(0);
    let delayFrac = new Float32Array(0);
    let colorA = new Float32Array(0);
    let dispX = new Float32Array(0);
    let dispY = new Float32Array(0);
    let colorStr: string[] = [];

    let hasPlayedIntro = false;
    let introActive = false;
    let introStart = 0;

    const mouse = { x: -1e6, y: -1e6 };

    // The loop parks itself (raf = 0) once nothing is animating, so an idle,
    // fully-settled image isn't burning a 60fps frame. Any event that could
    // start motion again (pointer move, resize, re-entering view, a fresh
    // image) wakes it back up.
    const ensureRunning = () => {
      if (raf === 0 && visible) raf = requestAnimationFrame(tick);
    };

    const ensureImage = () => {
      const p = paramsRef.current;
      if (p.src === loadedSrc) return;
      loadedSrc = p.src;
      imageReady = false;
      hasPlayedIntro = false;
      const requested = p.src;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (isCancelled || loadedSrc !== requested) return;
        img = image;
        imageReady = true;
        gridKey = "";
        ensureRunning();
      };
      image.onerror = () => {
        if (isCancelled) return;
        console.error("PixelDither: failed to load image:", requested);
      };
      image.src = requested;
    };

    const buildGrid = () => {
      const p = paramsRef.current;
      if (!img || width <= 0 || height <= 0) return;

      const cell = Math.max(1, p.pixelSize);
      const step = cell + Math.max(0, p.gap);
      const cols = Math.max(1, Math.floor(width / step));
      const rows = Math.max(1, Math.floor(height / step));

      offscreen.width = Math.max(1, Math.round(width));
      offscreen.height = Math.max(1, Math.round(height));
      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

      const iw = img.naturalWidth || width;
      const ih = img.naturalHeight || height;
      const fitScale =
        p.objectFit === "contain"
          ? Math.min(width / iw, height / ih)
          : Math.max(width / iw, height / ih);
      const dw = iw * fitScale;
      const dh = ih * fitScale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      offCtx.drawImage(img, dx, dy, dw, dh);

      let data: Uint8ClampedArray;
      try {
        data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
      } catch {
        console.error("PixelDither: could not read image data (CORS?)");
        return;
      }

      const total = cols * rows;
      const nTargetX = new Float32Array(total);
      const nTargetY = new Float32Array(total);
      const nScatterX = new Float32Array(total);
      const nScatterY = new Float32Array(total);
      const nDelay = new Float32Array(total);
      const nAlpha = new Float32Array(total);
      const nColorStr: string[] = [];

      const cx = width / 2;
      const cy = height / 2;
      const scatterRadius = Math.max(width, height) * 0.7;
      const mono = p.colorMode === "mono";
      const dataWidth = offscreen.width;
      const dataHeight = offscreen.height;

      let n = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (hash(col, row) > p.density) continue;

          const px = Math.min(dataWidth - 1, Math.floor(col * step + cell / 2));
          const py = Math.min(dataHeight - 1, Math.floor(row * step + cell / 2));
          const idx = (py * dataWidth + px) * 4;
          const a = data[idx + 3];
          if (a < 10) continue;

          if (mono) {
            const lum =
              (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) /
              255;
            const th = (BAYER_4X4[row % 4][col % 4] + 0.5) / 16;
            nColorStr.push(lum < th ? p.darkColor : p.lightColor);
          } else {
            nColorStr.push(`rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`);
          }

          const tX = col * step + cell / 2;
          const tY = row * step + cell / 2;

          let sX = tX;
          let sY = tY;
          switch (p.introFrom) {
            case "top":
              sY = tY - scatterRadius;
              break;
            case "bottom":
              sY = tY + scatterRadius;
              break;
            case "left":
              sX = tX - scatterRadius;
              break;
            case "right":
              sX = tX + scatterRadius;
              break;
            case "center":
              sX = cx;
              sY = cy;
              break;
            default: {
              const angle = hash(col + 91, row + 17) * TAU;
              const dist = scatterRadius * (0.4 + hash(col - 31, row + 53) * 0.6);
              sX = tX + Math.cos(angle) * dist;
              sY = tY + Math.sin(angle) * dist;
            }
          }

          nTargetX[n] = tX;
          nTargetY[n] = tY;
          nScatterX[n] = sX;
          nScatterY[n] = sY;
          nDelay[n] = hash(col + 5, row - 5) * 0.5;
          nAlpha[n] = a / 255;
          n++;
        }
      }

      count = n;
      targetX = nTargetX.subarray(0, n);
      targetY = nTargetY.subarray(0, n);
      scatterX = nScatterX.subarray(0, n);
      scatterY = nScatterY.subarray(0, n);
      delayFrac = nDelay.subarray(0, n);
      colorA = nAlpha.subarray(0, n);
      colorStr = nColorStr;
      dispX = new Float32Array(n);
      dispY = new Float32Array(n);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;

      ensureImage();

      const p = paramsRef.current;
      const key = `${width}x${height}|${p.pixelSize}|${p.gap}|${p.colorMode}|${p.darkColor}|${p.lightColor}|${p.density}|${p.objectFit}|${p.introFrom}`;
      if (imageReady && key !== gridKey) {
        gridKey = key;
        buildGrid();
      }

      if (!imageReady || count === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!hasPlayedIntro && p.intro && !reduced) {
        hasPlayedIntro = true;
        introActive = true;
        introStart = now;
      }

      const introDur = Math.max(0.05, p.introDuration);
      const elapsed = introActive ? (now - introStart) / 1000 : 0;
      if (introActive && elapsed > introDur * 1.5) introActive = false;

      const rect = container.getBoundingClientRect();
      const localX = mouse.x - rect.left;
      const localY = mouse.y - rect.top;
      const radius = Math.max(1, p.interactionRadius);
      const pointerNear =
        p.interactive &&
        !reduced &&
        localX > -radius &&
        localX < width + radius &&
        localY > -radius &&
        localY < height + radius;

      ctx.clearRect(0, 0, width, height);
      const half = p.pixelSize / 2;
      const strengthVal = p.strength;
      let maxDisp = 0;

      for (let i = 0; i < count; i++) {
        let x: number;
        let y: number;
        let introAlpha = 1;

        if (introActive) {
          const delaySec = delayFrac[i] * introDur;
          const t = clamp01((elapsed - delaySec) / introDur);
          const eased = easeOutCubic(t);
          x = scatterX[i] + (targetX[i] - scatterX[i]) * eased;
          y = scatterY[i] + (targetY[i] - scatterY[i]) * eased;
          introAlpha = clamp01(t * 1.6);
        } else {
          x = targetX[i];
          y = targetY[i];
        }

        let desiredX = 0;
        let desiredY = 0;
        let falloff = 0;
        if (pointerNear) {
          const dx = x - localX;
          const dy = y - localY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const t = 1 - dist / radius;
            falloff = t * t * (3 - 2 * t);
            const inv = dist > 0.001 ? (falloff * strengthVal) / dist : 0;
            desiredX = dx * inv;
            desiredY = dy * inv;
          }
        }

        dispX[i] += (desiredX - dispX[i]) * DISPLACEMENT_EASE;
        dispY[i] += (desiredY - dispY[i]) * DISPLACEMENT_EASE;
        const ax = Math.abs(dispX[i]);
        const ay = Math.abs(dispY[i]);
        if (ax > maxDisp) maxDisp = ax;
        if (ay > maxDisp) maxDisp = ay;

        const drawX = x + dispX[i];
        const drawY = y + dispY[i];

        const alpha = colorA[i] * introAlpha;
        if (alpha < 0.02) continue;

        // Gentle per-cell breathing while the pointer lingers nearby — each
        // cell's phase is offset by its own stagger hash so the pulse ripples
        // across the field instead of blinking in lockstep.
        let cellHalf = half;
        if (falloff > 0.001) {
          const pulse = Math.sin(now / 220 + delayFrac[i] * TAU * 4) * 0.5 + 0.5;
          cellHalf = half * (1 + falloff * pulse * 0.35);
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = colorStr[i];
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(drawX, drawY, cellHalf, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillRect(drawX - cellHalf, drawY - cellHalf, cellHalf * 2, cellHalf * 2);
        }
      }
      ctx.globalAlpha = 1;

      if (reduced) return;
      if (introActive || pointerNear || maxDisp > 0.05) {
        raf = requestAnimationFrame(tick);
      }
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
      gridKey = "";
      ensureRunning();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const wasVisible = visible;
          visible = entry.isIntersecting;
          if (visible && !wasVisible) ensureRunning();
        }
      },
      { threshold: 0.01, rootMargin: "100px" },
    );
    io.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      ensureRunning();
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    ensureRunning();

    return () => {
      isCancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [reduced]);

  const rootClass = `overflow-hidden ${className ?? ""}`;

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={style}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      {...rest}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

PixelDither.displayName = "PixelDither";
