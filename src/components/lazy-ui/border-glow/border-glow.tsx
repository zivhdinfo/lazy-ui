"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

export type BorderGlowMode = "auto" | "cursor" | "hover";

export interface BorderGlowProps extends HTMLAttributes<HTMLDivElement> {
  /** Content rendered on the inner surface. */
  children?: ReactNode;
  /**
   * `"auto"` sweeps a soft gradient arc around the border on its own.
   * `"cursor"` points the arc toward the pointer and fades it in by proximity —
   * even from outside the card, so a grid lights up at once. `"hover"` does the
   * same but only while the pointer is over this card.
   * @default "auto"
   */
  mode?: BorderGlowMode;
  /** Colors blended around the border ring. @default ["#a78bfa","#f0abfc","#67e8f9"] */
  colors?: string[];
  /** Border thickness in CSS px. @default 1.5 */
  thickness?: number;
  /** Corner radius in CSS px. @default 20 */
  radius?: number;
  /** Half-width of the lit arc, in degrees. Smaller = a tighter comet. @default 58 */
  coneSpread?: number;
  /** Outer glow blur radius in CSS px — the soft halo around the lit arc (0 disables it). @default 22 */
  glowSize?: number;
  /** Overall brightness multiplier. @default 1 */
  intensity?: number;
  /** Sweep speed multiplier (`auto` mode only). @default 1 */
  speed?: number;
  /** Cursor mode: activation distance in CSS px, measured from the card's edges. @default 200 */
  cursorRadius?: number;
  /** Toggle the bling — twinkles that appear on hover, clustered at the lit border. @default true */
  bling?: boolean;
  /** Number of bling twinkles. @default 8 */
  sparkleCount?: number;
  /** Seed for the bling scatter — same seed renders the same offsets. @default 1 */
  seed?: number;
  /** Inner surface fill behind the content. @default "#0b0b0f" */
  background?: string;
}

// Deterministic PRNG so the bling offsets are hydration-stable.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A four-point twinkle with concave sides.
const SPARKLE_PATH =
  "M12 0c.9 6.6 4.4 10.1 11 11-6.6.9-10.1 4.4-11 11-.9-6.6-4.4-10.1-11-11 6.6-.9 10.1-4.4 11-11Z";

// Knock the rounded interior out, leaving only the `t`-wide perimeter band.
function band(t: number): CSSProperties {
  return {
    padding: t,
    boxSizing: "border-box",
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    maskComposite: "exclude",
  } as CSSProperties;
}

// A wedge centred on `--angle` that fades out along a smoothstep-shaped feather
// on each flank, so the lit arc dissolves into the dark rim with no hard seam.
// A single linear stop reads as a coarse edge; the multi-stop ramp below
// approximates a smooth curve. `half` is the bright-core half-width. Returns a
// conic-gradient usable as a mask image.
function cone(half: number): string {
  const core = Math.max(4, Math.min(150, half));
  const feather = Math.min(155, core * 0.9 + 14);
  const a = Math.min(179, core + feather);
  const N = 7;
  const fwd: string[] = ["#fff 0deg", `#fff ${core.toFixed(1)}deg`];
  const back: string[] = [];
  for (let i = 1; i <= N; i++) {
    const f = i / N;
    const deg = Math.min(a, core + feather * f);
    const alpha = (1 - f * f * (3 - 2 * f)).toFixed(3); // smoothstep 1 → 0
    fwd.push(`rgba(255,255,255,${alpha}) ${deg.toFixed(1)}deg`);
    back.unshift(`rgba(255,255,255,${alpha}) ${(360 - deg).toFixed(1)}deg`);
  }
  back.push(`#fff ${(360 - core).toFixed(1)}deg`, "#fff 360deg");
  return `conic-gradient(from var(--angle) at 50% 50%, ${[...fwd, ...back].join(", ")})`;
}

const smoothstep = (k: number) => k * k * (3 - 2 * k);

// Cursor angle in the same frame conic-gradient uses: 0° at top, clockwise.
function angleTo(px: number, py: number, cx: number, cy: number): number {
  const a = Math.atan2(py - cy, px - cx) * (180 / Math.PI) + 90;
  return a < 0 ? a + 360 : a;
}

// Nearest point on the card's rectangular border, in % — where the bling sits.
function nearestBorder(lx: number, ly: number, w: number, h: number) {
  const dl = lx;
  const dr = w - lx;
  const dt = ly;
  const db = h - ly;
  const m = Math.min(dl, dr, dt, db);
  let bx = lx;
  let by = ly;
  if (m === dl) bx = 0;
  else if (m === dr) bx = w;
  else if (m === dt) by = 0;
  else by = h;
  return { x: (bx / w) * 100, y: (by / h) * 100 };
}

export function BorderGlow({
  children,
  className,
  mode = "auto",
  colors = ["#a78bfa", "#f0abfc", "#67e8f9"],
  thickness = 1.5,
  radius = 20,
  coneSpread = 58,
  glowSize = 22,
  intensity = 1,
  speed = 1,
  cursorRadius = 200,
  bling = true,
  sparkleCount = 8,
  seed = 1,
  background = "#0b0b0f",
  style,
  ...props
}: BorderGlowProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const blingRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(90);
  // Kept in sync each render so the window listener reads live values without
  // re-binding on every knob change.
  const params = useRef({ cursorRadius, intensity });
  useEffect(() => {
    params.current.cursorRadius = cursorRadius;
    params.current.intensity = intensity;
  });

  // Static colored ring; the cone mask reveals only the lit arc of it.
  const ring = useMemo(
    () =>
      `conic-gradient(from 90deg at 50% 50%, ${[...colors, colors[0]].join(", ")})`,
    [colors],
  );

  const sparkles = useMemo(() => {
    if (reduced || !bling || sparkleCount <= 0) return [];
    const rand = mulberry32(seed * 2654435761);
    return Array.from({ length: sparkleCount }, () => ({
      dx: (rand() - 0.5) * 64,
      dy: (rand() - 0.5) * 64,
      color: colors[Math.floor(rand() * colors.length)],
      size: 4 + rand() * 5,
      delay: rand() * 1.6,
      dur: 1 + rand() * 1.1,
      gap: 0.4 + rand() * 1.4,
      peak: 0.55 + rand() * 0.4,
    }));
  }, [reduced, bling, sparkleCount, seed, colors]);

  // The lit arc and its drop-shadow glow share one element, so a single opacity
  // write fades both together.
  const setGlow = useCallback((it: number) => {
    if (ringRef.current) ringRef.current.style.opacity = `${it}`;
  }, []);

  // Auto mode: ease the arc around the rim by advancing `--angle` each frame.
  useEffect(() => {
    if (mode !== "auto" || reduced) return;
    let raf = 0;
    let prev = 0;
    const step = (t: number) => {
      if (!prev) prev = t;
      angleRef.current = (angleRef.current + ((t - prev) / 1000) * 60 * speed) % 360;
      prev = t;
      rootRef.current?.style.setProperty("--angle", `${angleRef.current}deg`);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mode, reduced, speed]);

  // Cursor mode: a window listener so the card reacts to the pointer even from
  // outside its bounds — every instance does this, so a grid lights up at once.
  // A standing rAF loop eases the arc's angle and brightness toward their
  // targets every frame, so the lit arc glides between positions and fades in
  // and out instead of snapping to the cursor.
  useEffect(() => {
    if (mode !== "cursor" || reduced) return;
    const el = rootRef.current;
    if (!el) return;

    let rect = el.getBoundingClientRect();
    const refresh = () => {
      rect = el.getBoundingClientRect();
    };

    let lx = 0;
    let ly = 0;
    let curAngle = angleRef.current;
    let curGlow = 0;
    let prev = 0;
    let raf = 0;

    const tick = (t: number) => {
      // Cap dt so a backgrounded tab resuming doesn't snap in one giant step.
      const dt = prev ? Math.min(0.05, (t - prev) / 1000) : 0.016;
      prev = t;

      const { cursorRadius: cr, intensity: it } = params.current;
      // True distance from the cursor to the card's rectangle: 0 while inside,
      // the perpendicular gap to the nearest edge/corner once outside. This is
      // what `cursorRadius` measures — the arc is full at the edge and fades to
      // nothing exactly `cr` px away, so the knob maps 1:1 to what's on screen.
      const dx = Math.max(rect.left - lx, 0, lx - rect.right);
      const dy = Math.max(rect.top - ly, 0, ly - rect.bottom);
      const dist = Math.hypot(dx, dy);
      const k = dist >= cr ? 0 : 1 - dist / cr;
      const targetGlow = smoothstep(k) * it;
      const cxC = rect.left + rect.width / 2;
      const cyC = rect.top + rect.height / 2;
      const targetAngle = angleTo(lx, ly, cxC, cyC);

      // Frame-rate-independent exponential smoothing; tau is the time constant.
      const ease = (tau: number) => 1 - Math.exp(-dt / tau);
      // Take the shortest path around the 360° rim so it never spins the long
      // way when the cursor crosses the top of the card.
      const diff = ((targetAngle - curAngle + 540) % 360) - 180;
      curAngle = (curAngle + diff * ease(0.08) + 360) % 360;
      curGlow += (targetGlow - curGlow) * ease(0.13);

      angleRef.current = curAngle;
      el.style.setProperty("--angle", `${curAngle}deg`);
      setGlow(curGlow);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: globalThis.PointerEvent) => {
      lx = e.clientX;
      ly = e.clientY;
    };

    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", refresh, { passive: true, capture: true });
    window.addEventListener("resize", refresh);

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", refresh, { capture: true });
      window.removeEventListener("resize", refresh);
      cancelAnimationFrame(raf);
    };
  }, [mode, reduced, setGlow]);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const lx = e.clientX - r.left;
      const ly = e.clientY - r.top;
      // Bling clusters at the nearest border point, any mode.
      if (bling) {
        const b = nearestBorder(lx, ly, r.width, r.height);
        el.style.setProperty("--bling-x", `${b.x}%`);
        el.style.setProperty("--bling-y", `${b.y}%`);
      }
      if (mode === "hover") {
        el.style.setProperty("--angle", `${angleTo(lx, ly, r.width / 2, r.height / 2)}deg`);
        setGlow(params.current.intensity);
      }
    },
    [reduced, bling, mode, setGlow],
  );

  const onPointerEnter = useCallback(() => {
    if (reduced) return;
    if (bling && blingRef.current) blingRef.current.style.opacity = "1";
  }, [reduced, bling]);

  const onPointerLeave = useCallback(() => {
    if (blingRef.current) blingRef.current.style.opacity = "0";
    if (mode === "hover") setGlow(0);
  }, [mode, setGlow]);

  // Resting glow: auto lights gently always; cursor/hover start dark and light
  // on pointer; reduced motion shows a faint static ring.
  const ringRest = reduced
    ? 0.26 * intensity
    : mode === "auto"
      ? 0.9 * intensity
      : 0;

  const coneRing = reduced ? undefined : cone(coneSpread);

  // The glow is a stack of drop-shadows cast off the lit arc itself, so it
  // hugs the arc's exact shape and bleeds softly outward and inward like a
  // neon glow — no separate blurred layer to go coarse at its mask edge. Three
  // shadows of growing blur, tinted across the palette, layer into a soft halo;
  // the innermost is tight and saturated, the outer ones wide and faint.
  const glowColors = [
    colors[0],
    colors[Math.floor(colors.length / 2)] ?? colors[0],
    colors[colors.length - 1],
  ];
  const dropGlow =
    reduced || glowSize <= 0
      ? undefined
      : `drop-shadow(0 0 ${(glowSize * 0.4).toFixed(1)}px ${glowColors[0]}) ` +
        `drop-shadow(0 0 ${(glowSize * 1).toFixed(1)}px ${glowColors[1]}) ` +
        `drop-shadow(0 0 ${(glowSize * 1.9).toFixed(1)}px ${glowColors[2]})`;

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={className}
      style={
        {
          position: "relative",
          isolation: "isolate",
          borderRadius: radius,
          transform: "translateZ(0)",
          "--angle": "90deg",
          "--bling-x": "50%",
          "--bling-y": "50%",
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {/* Inner surface — opaque; defines the box size and sits under the arc so
          the glow reads cleanly against it. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          borderRadius: "inherit",
          background,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* The lit border arc, on top — the drop-shadow glow is cast off this
          element, so masking the arc on a child means the shadow is generated
          from the final arc shape and bleeds out around it. */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          opacity: ringRest,
          zIndex: 2,
          pointerEvents: "none",
          filter: dropGlow,
          // Cursor mode eases opacity per-frame in JS; a CSS transition on top
          // would double-damp it and lag. Hover relies on the CSS fade.
          transition: mode === "cursor" ? "none" : "opacity 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            ...(coneRing
              ? { WebkitMaskImage: coneRing, maskImage: coneRing }
              : {}),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              overflow: "hidden",
              ...band(thickness),
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: ring }} />
          </div>
        </div>
      </div>

      {/* Bling — twinkles clustered at the lit border point, only while hovered. */}
      {sparkles.length > 0 && (
        <div
          ref={blingRef}
          aria-hidden
          style={{
            position: "absolute",
            left: "var(--bling-x)",
            top: "var(--bling-y)",
            width: 0,
            height: 0,
            opacity: 0,
            transition: "opacity 0.25s ease",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          {sparkles.map((s, i) => (
            <motion.span
              key={i}
              style={{
                position: "absolute",
                left: s.dx,
                top: s.dy,
                width: s.size,
                height: s.size,
                translate: "-50% -50%",
                color: s.color,
                filter: `drop-shadow(0 0 3px ${s.color})`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, s.peak, 0], rotate: [0, 45] }}
              transition={{
                duration: s.dur,
                delay: s.delay,
                repeat: Infinity,
                repeatDelay: s.gap,
                ease: "easeInOut",
              }}
            >
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                <path d={SPARKLE_PATH} />
              </svg>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

BorderGlow.displayName = "BorderGlow";

export default BorderGlow;
