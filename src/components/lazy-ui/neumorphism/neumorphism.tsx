"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

export type NeumorphismPalette =
  | "pearl"
  | "bone"
  | "silver"
  | "graphite"
  | "obsidian"
  | "moonlight";

export type NeumorphismCorner =
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

export interface NeumorphismProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the cascade. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Color preset. @default "pearl" */
  palette?: NeumorphismPalette;
  /** Custom palette `[surface, highlight, shadow]`. Overrides `palette`. */
  colors?: [string, string, string];
  /** Override the orbital rim-glow color. Defaults to the palette's glow stop. */
  glowColor?: string;
  /** Number of stacked plates (1–16). @default 7 */
  layers?: number;
  /** Spacing between consecutive plates in px. @default 36 */
  spread?: number;
  /** Corner radius of each plate in px. @default 96 */
  radius?: number;
  /** Cascade direction in degrees. 0 = right, 90 = down, 135 = down-right. @default 135 */
  angle?: number;
  /** Shadow blur radius in px — softness of each ridge. @default 36 */
  softness?: number;
  /** Shadow offset multiplier. @default 1 */
  depth?: number;
  /** Rim glow intensity (0–2). `0` removes the moving light entirely. @default 0.8 */
  glow?: number;
  /** Orbital animation speed. `0` freezes the rim light. @default 0.5 */
  speed?: number;
  /** Corners whose border-radius is dropped (rendered as a sharp 0-radius corner). Pass e.g. `["top-left"]` to square a single corner. @default [] */
  sharpCorners?: NeumorphismCorner[];
}

type Palette = readonly [string, string, string, string];

// [surface, highlight, shadow, glow]
const PALETTES: Record<NeumorphismPalette, Palette> = {
  pearl: ["#eaedf3", "#ffffff", "#bfc5cf", "#a8c5ff"],
  bone: ["#f1ece2", "#fffaef", "#cfc7b3", "#ffb87a"],
  silver: ["#d8dce3", "#ffffff", "#9ea4ae", "#c6d5ff"],
  graphite: ["#1c1e23", "#2a2d33", "#08090b", "#88a6ff"],
  obsidian: ["#0c0d10", "#1a1c20", "#000000", "#7d8eff"],
  moonlight: ["#11121a", "#222538", "#02030a", "#b6a6ff"],
};

function isDarkPalette(palette: NeumorphismPalette): boolean {
  return (
    palette === "graphite" || palette === "obsidian" || palette === "moonlight"
  );
}

export function Neumorphism({
  children,
  palette = "pearl",
  colors,
  glowColor,
  layers = 7,
  spread = 36,
  radius = 96,
  angle = 135,
  softness = 36,
  depth = 1,
  glow = 0.8,
  speed = 0.5,
  sharpCorners,
  className,
  style,
  ...rest
}: NeumorphismProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // The orbital glow nodes — one per plate, except the topmost which we
  // deliberately skip so the front surface stays calm and uncluttered.
  const blobCoreRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blobHaloRefs = useRef<Array<HTMLDivElement | null>>([]);

  const paletteSpec = PALETTES[palette];
  const surface = colors?.[0] ?? paletteSpec[0];
  const highlightCol = colors?.[1] ?? paletteSpec[1];
  const shadowCol = colors?.[2] ?? paletteSpec[2];
  const rimGlowCol = glowColor ?? paletteSpec[3];

  const clampedLayers = Math.max(1, Math.min(16, Math.floor(layers)));

  const { dx, dy } = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    return { dx: Math.cos(rad), dy: Math.sin(rad) };
  }, [angle]);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let raf = 0;
    let disposed = false;

    // Smooth easing curve applied to the orbital angle so the glow never
    // races along the rim at constant speed. Subtle sinusoidal warp gives
    // the impression of a heavier light source.
    const easeAngle = (a: number) => a + Math.sin(a * 2) * 0.06;

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);

      const elapsed = (performance.now() - start) / 1000;
      const t = elapsed * speed;

      // Skip the last (topmost) plate — its blob refs are intentionally
      // missing, so the loop guard handles the cutoff cleanly.
      for (let i = 0; i < clampedLayers - 1; i++) {
        const core = blobCoreRefs.current[i];
        const halo = blobHaloRefs.current[i];
        if (!core || !halo) continue;

        const phase = (i / Math.max(1, clampedLayers - 1)) * Math.PI * 2;
        const rawAngle = t * 1.05 + phase;
        const orbitAngle = easeAngle(rawAngle);

        // Slight breathing of the orbit radius — the light isn't on a
        // perfect circle, it lulls slightly inward and outward.
        const baseR = 0.46;
        const r = baseR + Math.sin(rawAngle * 0.7) * 0.03;
        const xPct = 50 + Math.cos(orbitAngle) * r * 100;
        const yPct = 50 + Math.sin(orbitAngle) * r * 100;

        // A soft pulse on intensity keeps deeper plates breathing even
        // when the orbit itself is uniform.
        const pulse = Math.sin(t * 1.2 + phase * 0.5) * 0.18 + 0.82;
        // Back plates glow stronger so the wave reads as receding into
        // depth instead of pinned to the front.
        const depthFade = 1 - i / Math.max(1, clampedLayers - 1);
        const intensity = glow * pulse * (0.55 + depthFade * 0.55);

        core.style.left = `${xPct}%`;
        core.style.top = `${yPct}%`;
        core.style.opacity = String(Math.max(0, Math.min(1.5, intensity)));

        // Halo trails the core slightly so the highlight has a soft tail.
        halo.style.left = `${50 + Math.cos(orbitAngle - 0.25) * r * 100}%`;
        halo.style.top = `${50 + Math.sin(orbitAngle - 0.25) * r * 100}%`;
        halo.style.opacity = String(Math.max(0, Math.min(1.2, intensity * 0.7)));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [reduced, speed, clampedLayers, glow]);

  // Per-corner radius string. A "sharp" corner is rendered as 0; everything
  // else keeps the requested `radius`. CSS shorthand order is
  // top-left top-right bottom-right bottom-left.
  const borderRadius = useMemo(() => {
    const off = new Set(sharpCorners ?? []);
    const r = (corner: NeumorphismCorner) =>
      off.has(corner) ? "0px" : `${radius}px`;
    return `${r("top-left")} ${r("top-right")} ${r("bottom-right")} ${r("bottom-left")}`;
  }, [sharpCorners, radius]);

  const plates = useMemo(() => {
    const offset = 14 * depth;
    const dark = isDarkPalette(palette);

    // Inset shadow at the ridge interior + the standard outset pair.
    // The inset darkens the top-left edge inside each plate, which lands
    // RIGHT at the ridge crease for the next plate's highlight to sit on.
    const insetShadow =
      depth > 0
        ? `, inset ${offset * 0.6}px ${offset * 0.6}px ${softness * 0.5}px ${shadowCol}`
        : "";
    const boxShadow = `${-offset}px ${-offset}px ${softness}px ${highlightCol}, ${offset}px ${offset}px ${softness}px ${shadowCol}${insetShadow}`;

    return Array.from({ length: clampedLayers }).map((_, i) => {
      const offX = i * spread * dx;
      const offY = i * spread * dy;
      const fade = i / Math.max(1, clampedLayers - 1);
      const isTop = i === clampedLayers - 1;

      const plateStyle: CSSProperties = {
        position: "absolute",
        left: offX,
        top: offY,
        width: "100%",
        height: "100%",
        borderRadius,
        background: surface,
        boxShadow,
        zIndex: i,
        opacity: 0.94 + fade * 0.06,
        // border-radius + overflow:hidden round-clips the orbital glow blob
        // to the plate silhouette. Do NOT add mask-image here — a CSS mask
        // sized to the content box clips the outset box-shadow too, which
        // kills the entire neumorphism ridge effect.
        overflow: "hidden",
      };

      // Topmost plate: keep it clean — the front surface should read as a
      // calm, mirror-flat finish so content sits on a quiet stage.
      if (isTop) {
        return <div key={i} style={plateStyle} aria-hidden="true" />;
      }

      const coreSize = 240;
      const haloSize = 420;
      const blend = dark ? "screen" : "soft-light";

      const coreStyle: CSSProperties = {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: coreSize,
        height: coreSize,
        marginLeft: -coreSize / 2,
        marginTop: -coreSize / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${rimGlowCol} 0%, ${rimGlowCol}cc 18%, ${rimGlowCol}55 42%, transparent 72%)`,
        filter: "blur(28px)",
        mixBlendMode: blend,
        pointerEvents: "none",
        opacity: 0,
        willChange: "left, top, opacity",
      };

      const haloStyle: CSSProperties = {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: haloSize,
        height: haloSize,
        marginLeft: -haloSize / 2,
        marginTop: -haloSize / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${rimGlowCol}66 0%, ${rimGlowCol}22 35%, transparent 75%)`,
        filter: "blur(56px)",
        mixBlendMode: blend,
        pointerEvents: "none",
        opacity: 0,
        willChange: "left, top, opacity",
      };

      return (
        <div key={i} style={plateStyle} aria-hidden="true">
          <div
            ref={(node) => {
              blobHaloRefs.current[i] = node;
            }}
            style={haloStyle}
          />
          <div
            ref={(node) => {
              blobCoreRefs.current[i] = node;
            }}
            style={coreStyle}
          />
        </div>
      );
    });
  }, [
    clampedLayers,
    spread,
    dx,
    dy,
    softness,
    depth,
    borderRadius,
    surface,
    highlightCol,
    shadowCol,
    rimGlowCol,
    palette,
  ]);

  const rootStyle: CSSProperties = {
    background: surface,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={rootStyle}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-0">{plates}</div>
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

Neumorphism.displayName = "Neumorphism";
