"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

export type PrismPalette =
  | "ember"
  | "iris"
  | "ocean"
  | "candy"
  | "void"
  | "silver";

export type PrismLayout = "diagonal" | "anti-diagonal" | "corners";

export interface PrismDriftProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the canvas. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Color palette preset. @default "ember" */
  palette?: PrismPalette;
  /** Custom multi-stop palette (2–6 entries). Colors run from the corner outward: index 0 = bright center, last = far edge. Overrides `palette`. */
  colors?: string[];
  /** Background fill drawn behind the glows. @default palette's bg */
  backgroundColor?: string;
  /** Which corners are lit. `diagonal` = top-right + bottom-left, `anti-diagonal` = top-left + bottom-right, `corners` = all four. @default "diagonal" */
  layout?: PrismLayout;
  /** Glow falloff radius (0–1). Higher = blobs bleed further across the canvas. @default 0.72 */
  softness?: number;
  /** Color brightness multiplier (0–2). @default 1.1 */
  intensity?: number;
  /** Grain dither amount (0–0.5). The grain blends into the alpha, so edges look gritty like a film stock. @default 0.18 */
  grain?: number;
  /** Animation speed multiplier. `0` freezes the field. @default 0.6 */
  speed?: number;
  /** How far each anchor orbits its corner (0–0.2). @default 0.05 */
  drift?: number;
  /** Pointer subtly tugs the nearest anchor toward the cursor. @default true */
  mouseFollow?: boolean;
  /** Cursor pull strength (0–1). @default 0.4 */
  mouseInfluence?: number;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Each lit corner blooms with a multi-stop radial gradient — color stop 0
// sits at the corner, last stop at the falloff radius, with Gaussian alpha
// pulling everything to background past the radius. The grain modulates the
// fragment by the local color luminance so dark zones stay clean and the
// gradient edges acquire a gritty, film-stock dither.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define MAX_COLORS 6
#define MAX_ANCHORS 4

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_softness;
uniform float u_intensity;
uniform float u_grain;
uniform float u_drift;
uniform int u_mouseFollow;
uniform float u_mouseInfluence;
uniform vec3 u_colors[MAX_COLORS];
uniform int u_colorCount;
uniform vec2 u_anchors[MAX_ANCHORS];
uniform int u_anchorCount;
uniform vec3 u_bg;

in vec2 v_uv;
out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 paletteAt(float t) {
  int n = u_colorCount;
  if (n <= 1) return u_colors[0];
  t = clamp(t, 0.0, 1.0);
  float scaled = t * float(n - 1);
  int idx = int(floor(scaled));
  int next = idx + 1;
  if (next > n - 1) next = n - 1;
  float frac = scaled - float(idx);
  return mix(u_colors[idx], u_colors[next], frac);
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * u_speed;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  // Each anchor orbits its nominal corner with a unique phase so the lit
  // blobs breathe independently. Drift is small (≤0.2 of UV) so the blobs
  // never wander past their corner.
  float reach = mix(0.25, 1.35, clamp(u_softness, 0.0, 1.0));

  vec3 col = u_bg;
  // Tracks the sum of anchor contributions — grain is gated by this so the
  // dither only appears inside the lit corners, never on the dead background.
  float litMask = 0.0;

  for (int i = 0; i < MAX_ANCHORS; i++) {
    if (i >= u_anchorCount) break;
    float fi = float(i);
    vec2 anchor = u_anchors[i] +
      vec2(sin(t * (0.27 + fi * 0.03) + fi * 1.7), cos(t * (0.31 + fi * 0.04) + fi * 1.1)) *
      u_drift;

    if (u_mouseFollow == 1) {
      vec2 toMouse = u_mouse - anchor;
      anchor += toMouse * clamp(u_mouseInfluence, 0.0, 1.0) * 0.18;
    }

    vec2 d = uv - anchor;
    d.x *= aspect;
    float r = length(d) / max(reach, 0.001);

    // Gaussian alpha pulls the lobe back to background past the radius.
    float a = exp(-r * r * 1.4);
    // Multi-stop palette sampled by normalised distance.
    vec3 stop = paletteAt(r);
    col += stop * a * u_intensity;
    litMask += a;
  }

  // Grain restricted to the lit zones via the cumulative anchor mask.
  // Smoothstep gives a soft on-ramp so the boundary between grain/no-grain
  // never reads as a hard edge.
  if (u_grain > 0.0) {
    float gate = smoothstep(0.02, 0.18, clamp(litMask, 0.0, 1.0));
    float n = hash21(gl_FragCoord.xy + t * 60.0) - 0.5;
    col += n * u_grain * gate;
  }

  fragColor = vec4(col, 1.0);
}
`;

type Rgb = [number, number, number];

interface PaletteSpec {
  colors: Rgb[];
  bg: Rgb;
}

// Each palette runs from a bright inner stop to a deeper outer stop — the
// shader interpolates them along the radial distance from each lit corner.
const PALETTES: Record<PrismPalette, PaletteSpec> = {
  ember: {
    colors: [
      [1.0, 0.78, 0.18], // gold-yellow inner
      [1.0, 0.42, 0.12], // orange mid
      [0.95, 0.15, 0.42], // pink outer
    ],
    bg: [0.0, 0.0, 0.0],
  },
  iris: {
    colors: [
      [0.95, 0.85, 1.0], // pale lavender inner
      [0.65, 0.35, 1.0], // violet mid
      [0.25, 0.15, 0.85], // deep indigo outer
    ],
    bg: [0.02, 0.01, 0.05],
  },
  ocean: {
    colors: [
      [0.85, 0.98, 1.0], // ice cyan
      [0.25, 0.75, 0.95], // teal
      [0.05, 0.25, 0.7], // deep blue
    ],
    bg: [0.0, 0.02, 0.06],
  },
  candy: {
    colors: [
      [1.0, 0.92, 0.95], // pale blush
      [1.0, 0.55, 0.75], // pink
      [0.55, 0.4, 1.0], // lavender violet outer
    ],
    bg: [0.04, 0.02, 0.06],
  },
  void: {
    colors: [
      [0.3, 0.22, 0.55], // muted violet inner
      [0.12, 0.08, 0.28],
      [0.02, 0.02, 0.08], // near black outer
    ],
    bg: [0.0, 0.0, 0.0],
  },
  silver: {
    colors: [
      [0.96, 0.96, 0.98], // bright
      [0.55, 0.55, 0.58], // mid silver
      [0.18, 0.18, 0.2], // deep
    ],
    bg: [0.02, 0.02, 0.03],
  },
};

const MAX_COLORS = 6;
const MAX_ANCHORS = 4;

function parseColor(input: string, fallback: Rgb): Rgb {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "transparent" || trimmed === "none") return [0, 0, 0];
  const hex = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(trimmed);
  if (hex) {
    return [
      parseInt(hex[1], 16) / 255,
      parseInt(hex[2], 16) / 255,
      parseInt(hex[3], 16) / 255,
    ];
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(trimmed);
  if (rgb) {
    return [
      Math.min(255, parseInt(rgb[1], 10)) / 255,
      Math.min(255, parseInt(rgb[2], 10)) / 255,
      Math.min(255, parseInt(rgb[3], 10)) / 255,
    ];
  }
  const hsl = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i.exec(trimmed);
  if (hsl) {
    return hslToRgb(
      parseInt(hsl[1], 10),
      parseInt(hsl[2], 10) / 100,
      parseInt(hsl[3], 10) / 100,
    );
  }
  return fallback;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
}

function rgbToCss([r, g, b]: Rgb): string {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function getAnchors(layout: PrismLayout): Array<[number, number]> {
  switch (layout) {
    case "anti-diagonal":
      return [
        [0.0, 1.0], // top-left
        [1.0, 0.0], // bottom-right
      ];
    case "corners":
      return [
        [0.0, 1.0],
        [1.0, 1.0],
        [0.0, 0.0],
        [1.0, 0.0],
      ];
    case "diagonal":
    default:
      return [
        [1.0, 1.0], // top-right
        [0.0, 0.0], // bottom-left
      ];
  }
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("PrismDrift compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("PrismDrift link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function PrismDrift({
  children,
  palette = "ember",
  colors,
  backgroundColor,
  layout = "diagonal",
  softness = 0.72,
  intensity = 1.1,
  grain = 0.18,
  speed = 0.6,
  drift = 0.05,
  mouseFollow = true,
  mouseInfluence = 0.4,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: PrismDriftProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    palette,
    colors,
    backgroundColor,
    layout,
    softness,
    intensity,
    grain,
    speed,
    drift,
    mouseFollow,
    mouseInfluence,
  });
  useEffect(() => {
    paramsRef.current = {
      palette,
      colors,
      backgroundColor,
      layout,
      softness,
      intensity,
      grain,
      speed,
      drift,
      mouseFollow,
      mouseInfluence,
    };
  }, [
    palette,
    colors,
    backgroundColor,
    layout,
    softness,
    intensity,
    grain,
    speed,
    drift,
    mouseFollow,
    mouseInfluence,
  ]);

  const mouseTargetRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });
  const mouseSmoothedRef = useRef<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  });

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn("PrismDrift: WebGL2 unavailable — static fallback shown.");
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = linkProgram(gl, vs, fs);
    if (!program) return;
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      speed: gl.getUniformLocation(program, "u_speed"),
      softness: gl.getUniformLocation(program, "u_softness"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      grain: gl.getUniformLocation(program, "u_grain"),
      drift: gl.getUniformLocation(program, "u_drift"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
      colors: gl.getUniformLocation(program, "u_colors[0]"),
      colorCount: gl.getUniformLocation(program, "u_colorCount"),
      anchors: gl.getUniformLocation(program, "u_anchors[0]"),
      anchorCount: gl.getUniformLocation(program, "u_anchorCount"),
      bg: gl.getUniformLocation(program, "u_bg"),
    };

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const start = performance.now();
    let raf = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    });
    ro.observe(container);
    resize();

    let visible = true;
    let pageVisible =
      typeof document !== "undefined" ? !document.hidden : true;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible =
          !!entry && entry.isIntersecting && entry.intersectionRatio > 0;
      },
      { threshold: [0, 0.01] },
    );
    io.observe(container);
    const handleVisibility = () => {
      pageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const colorBuffer = new Float32Array(MAX_COLORS * 3);
    const anchorBuffer = new Float32Array(MAX_ANCHORS * 2);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || !pageVisible) return;

      const p = paramsRef.current;
      const spec = PALETTES[p.palette] ?? PALETTES.ember;

      // Resolve color stops — user override or palette preset.
      const rawColors = p.colors && p.colors.length > 0 ? p.colors : null;
      const stopCount = rawColors
        ? Math.min(MAX_COLORS, rawColors.length)
        : Math.min(MAX_COLORS, spec.colors.length);
      for (let i = 0; i < MAX_COLORS; i++) {
        const src =
          i < stopCount
            ? rawColors
              ? parseColor(rawColors[i], spec.colors[i] ?? spec.colors[0])
              : spec.colors[i]
            : spec.colors[Math.min(spec.colors.length - 1, i)];
        colorBuffer[i * 3] = src[0];
        colorBuffer[i * 3 + 1] = src[1];
        colorBuffer[i * 3 + 2] = src[2];
      }

      const anchors = getAnchors(p.layout);
      const anchorCount = Math.min(MAX_ANCHORS, anchors.length);
      for (let i = 0; i < MAX_ANCHORS; i++) {
        const a = i < anchorCount ? anchors[i] : anchors[0];
        anchorBuffer[i * 2] = a[0];
        anchorBuffer[i * 2 + 1] = a[1];
      }

      const bg = p.backgroundColor
        ? parseColor(p.backgroundColor, spec.bg)
        : spec.bg;

      const elapsed = (performance.now() - start) / 1000;
      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.14 : 0.04;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1f(loc.speed, p.speed);
      gl.uniform1f(loc.softness, Math.max(0, Math.min(1, p.softness)));
      gl.uniform1f(loc.intensity, Math.max(0, Math.min(2, p.intensity)));
      gl.uniform1f(loc.grain, Math.max(0, Math.min(0.5, p.grain)));
      gl.uniform1f(loc.drift, Math.max(0, Math.min(0.2, p.drift)));
      gl.uniform1i(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(loc.mouseInfluence, p.mouseInfluence);
      gl.uniform3fv(loc.colors, colorBuffer);
      gl.uniform1i(loc.colorCount, stopCount);
      gl.uniform2fv(loc.anchors, anchorBuffer);
      gl.uniform1i(loc.anchorCount, anchorCount);
      gl.uniform3f(loc.bg, bg[0], bg[1], bg[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
    };
  }, [reduced]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseTargetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
      active: true,
    };
    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    mouseTargetRef.current = { x: 0.5, y: 0.5, active: false };
    onPointerLeave?.(e);
  };

  // Reduced-motion fallback — static CSS radial-gradient stack at each lit
  // corner so the surface still picks up the palette.
  const fallbackSpec = PALETTES[palette] ?? PALETTES.ember;
  const stopCss = (fallbackSpec.colors[0] ?? [0, 0, 0]) as Rgb;
  const stopMid = (fallbackSpec.colors[Math.floor(fallbackSpec.colors.length / 2)] ?? stopCss) as Rgb;
  const bgCss = backgroundColor ?? rgbToCss(fallbackSpec.bg);
  const anchorPositions =
    layout === "anti-diagonal"
      ? ["0% 0%", "100% 100%"]
      : layout === "corners"
        ? ["0% 0%", "100% 0%", "0% 100%", "100% 100%"]
        : ["100% 0%", "0% 100%"];
  const radialStack = anchorPositions
    .map(
      (pos) =>
        `radial-gradient(circle at ${pos}, ${rgbToCss(stopCss)} 0%, ${rgbToCss(stopMid)} 18%, transparent 55%)`,
    )
    .join(", ");
  const fallbackBg = `${radialStack}, ${bgCss}`;

  const rootStyle: CSSProperties = {
    background: reduced ? fallbackBg : bgCss,
    ...style,
  };

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
        />
      )}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

PrismDrift.displayName = "PrismDrift";
