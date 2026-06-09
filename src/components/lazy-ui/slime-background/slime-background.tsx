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

export type SlimePalette =
  | "toxic"
  | "magma"
  | "azure"
  | "amber"
  | "silver";

export interface SlimeBackgroundProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the canvas. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Color preset for the marbled liquid surface. @default "toxic" */
  palette?: SlimePalette;
  /** Custom palette (3 entries: deep, mid, peak). Plus an optional 4th for the specular highlight color. Overrides `palette`. */
  colors?: string[];
  /** Solid fill drawn behind the slime — fallback for reduced-motion and below the lowest height. @default palette's bg */
  backgroundColor?: string;
  /** Animation speed multiplier. `0` freezes the surface. @default 0.35 */
  speed?: number;
  /** Domain-warp depth — how much the surface curls back on itself. Higher = thicker, ropier swirls. @default 0.85 */
  viscosity?: number;
  /** Specular highlight intensity (0–2). The "wet" look. @default 1 */
  shine?: number;
  /** Surface roughness (0–1). 0 = mirror-like pinpoint highlights, 1 = soft satin. @default 0.35 */
  roughness?: number;
  /** Height amplitude of the marbling — drives the contrast of the embossing. @default 1 */
  detail?: number;
  /** Sharpness of the color bands between the three stops (0–1). 0 = smooth gradient, 1 = hard veins. @default 0.5 */
  contrast?: number;
  /** Film-grain intensity (0–0.2). Sells the "thick" plastic look on bright displays. @default 0.04 */
  grain?: number;
  /** Cursor pushes a bulge into the height field, like a finger pressing into the slime. @default true */
  mouseFollow?: boolean;
  /** Bulge strength (0–1). @default 0.6 */
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

// Marble synthesis: an fbm height field is twice domain-warped (Inigo Quilez's
// recursive warp trick) to produce ropy, recurring swirls. Finite-difference
// gradients of that field become a pseudo surface normal; a Blinn-Phong term
// against a fixed key light paints the "wet" specular highlights. The three
// palette stops are mixed by smoothstep'd height so peaks read as one color
// and troughs as another, with `u_contrast` narrowing the transition bands.
// A soft cursor bulge added to the height (not the color) is what makes the
// surface dimple under the pointer — much more "slime" than tinting it.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_viscosity;
uniform float u_detail;
uniform float u_contrast;
uniform float u_shine;
uniform float u_roughness;
uniform float u_grain;
uniform vec2 u_mouse;
uniform int u_mouseFollow;
uniform float u_mouseInfluence;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform vec3 u_highlight;
uniform vec3 u_background;

in vec2 v_uv;
out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 4 octaves — the 5th was barely visible after the double-warp blurred it
// out. Dropping it cuts ~20% off the per-pixel fbm cost.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 4.7;
    a *= 0.5;
  }
  return v;
}

// Inigo Quilez double-warp — first fbm sample displaces the lookup, second
// sample displaces it again, then a final fbm reads the doubly-warped point.
// Cheaper than true curl noise and reads as marbled liquid. The warped
// coordinate is hoisted into a local so we don't recompute it across the
// two r-component fbm calls.
float marble(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + t * 0.10),
    fbm(p + vec2(5.2, 1.3) - t * 0.08)
  );
  vec2 pq = p + u_viscosity * 4.0 * q;
  vec2 r = vec2(
    fbm(pq + vec2(1.7, 9.2) + t * 0.15),
    fbm(pq + vec2(8.3, 2.8) - t * 0.12)
  );
  return fbm(p + u_viscosity * 4.0 * r);
}

float heightAt(vec2 uv, float t) {
  float val = marble(uv * 3.0, t) * u_detail;
  // Finger-press bulge — Gaussian falloff so the dimple is local, not global.
  if (u_mouseFollow == 1) {
    vec2 d = uv - u_mouse;
    val += exp(-dot(d, d) * 25.0) * u_mouseInfluence * 0.35;
  }
  return val;
}

void main() {
  float t = u_time * u_speed;
  vec2 uv = v_uv;

  // Finite-difference normal — small UV step in each axis, central
  // height as the third sample. A z-bias of 1.0 keeps the surface
  // mostly forward-facing so the specular doesn't pinwheel.
  float eps = 0.0025;
  float h0 = heightAt(uv, t);
  float hx = heightAt(uv + vec2(eps, 0.0), t);
  float hy = heightAt(uv + vec2(0.0, eps), t);
  vec3 N = normalize(vec3((h0 - hx) / eps, (h0 - hy) / eps, 1.0));

  // Color from height. Narrow smoothstep edges when contrast is high — that's
  // what turns the smooth marble into hard ropes of color.
  float c = clamp(u_contrast, 0.0, 1.0);
  float lo = mix(0.10, 0.40, c);
  float mid = mix(0.85, 0.55, c);
  vec3 col = mix(u_colorA, u_colorB, smoothstep(lo, 0.55, h0));
  col = mix(col, u_colorC, smoothstep(0.55, mid, h0));

  // Blinn-Phong specular. Light + view are both upper-right-ish so the
  // highlights sit on the crests, matching real liquid under a key light.
  vec3 L = normalize(vec3(-0.35, 0.6, 0.9));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float shininess = mix(72.0, 8.0, clamp(u_roughness, 0.0, 1.0));
  float spec = pow(max(dot(N, H), 0.0), shininess);
  col += u_highlight * spec * u_shine;

  // Soft rim — N.x contributes a glancing sheen on the "wet" side of curls.
  float rim = clamp(N.x * 0.5 + 0.5, 0.0, 1.0);
  col += u_highlight * 0.06 * smoothstep(0.72, 1.0, rim) * u_shine;

  // Below the lowest band, fade to the user's background fill so the slime
  // sits on a chosen surface instead of bleeding into the deepest stop.
  col = mix(u_background, col, smoothstep(-0.05, 0.35, h0));

  if (u_grain > 0.0) {
    float n = hash21(gl_FragCoord.xy + t * 60.0) - 0.5;
    col += n * u_grain;
  }

  fragColor = vec4(col, 1.0);
}
`;

type Rgb = [number, number, number];

interface PaletteSpec {
  colorA: Rgb;
  colorB: Rgb;
  colorC: Rgb;
  highlight: Rgb;
  bg: Rgb;
}

const PALETTES: Record<SlimePalette, PaletteSpec> = {
  // Reference image — dark purple field with green veins, pearlescent highlights.
  toxic: {
    colorA: [0.06, 0.02, 0.09],
    colorB: [0.28, 0.08, 0.5],
    colorC: [0.12, 0.55, 0.22],
    highlight: [0.95, 0.95, 1.0],
    bg: [0.02, 0.01, 0.04],
  },
  magma: {
    colorA: [0.08, 0.02, 0.03],
    colorB: [0.55, 0.08, 0.1],
    colorC: [1.0, 0.45, 0.12],
    highlight: [1.0, 0.92, 0.78],
    bg: [0.04, 0.01, 0.01],
  },
  azure: {
    colorA: [0.02, 0.04, 0.09],
    colorB: [0.08, 0.28, 0.55],
    colorC: [0.25, 0.85, 0.95],
    highlight: [0.92, 0.98, 1.0],
    bg: [0.01, 0.02, 0.05],
  },
  amber: {
    colorA: [0.07, 0.04, 0.02],
    colorB: [0.5, 0.28, 0.05],
    colorC: [1.0, 0.78, 0.2],
    highlight: [1.0, 0.96, 0.82],
    bg: [0.03, 0.02, 0.01],
  },
  silver: {
    colorA: [0.04, 0.04, 0.05],
    colorB: [0.32, 0.32, 0.34],
    colorC: [0.85, 0.85, 0.88],
    highlight: [1.0, 1.0, 1.0],
    bg: [0.02, 0.02, 0.02],
  },
};

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
  return fallback;
}

function rgbToCss([r, g, b]: Rgb): string {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
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
    console.error("SlimeBackground compile error:", gl.getShaderInfoLog(shader));
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
    console.error("SlimeBackground link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function SlimeBackground({
  children,
  palette = "toxic",
  colors,
  backgroundColor,
  speed = 0.35,
  viscosity = 0.85,
  shine = 1,
  roughness = 0.35,
  detail = 1,
  contrast = 0.5,
  grain = 0.04,
  mouseFollow = true,
  mouseInfluence = 0.6,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: SlimeBackgroundProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    palette,
    colors,
    backgroundColor,
    speed,
    viscosity,
    shine,
    roughness,
    detail,
    contrast,
    grain,
    mouseFollow,
    mouseInfluence,
  });
  useEffect(() => {
    paramsRef.current = {
      palette,
      colors,
      backgroundColor,
      speed,
      viscosity,
      shine,
      roughness,
      detail,
      contrast,
      grain,
      mouseFollow,
      mouseInfluence,
    };
  }, [
    palette,
    colors,
    backgroundColor,
    speed,
    viscosity,
    shine,
    roughness,
    detail,
    contrast,
    grain,
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
  const pointerActiveRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      // Hint for laptops with discrete + integrated GPUs: don't wake the
      // discrete card for a background animation.
      powerPreference: "low-power",
    } as WebGLContextAttributes) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn(
        "SlimeBackground: WebGL2 unavailable — static fallback shown.",
      );
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
      speed: gl.getUniformLocation(program, "u_speed"),
      viscosity: gl.getUniformLocation(program, "u_viscosity"),
      detail: gl.getUniformLocation(program, "u_detail"),
      contrast: gl.getUniformLocation(program, "u_contrast"),
      shine: gl.getUniformLocation(program, "u_shine"),
      roughness: gl.getUniformLocation(program, "u_roughness"),
      grain: gl.getUniformLocation(program, "u_grain"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
      colorA: gl.getUniformLocation(program, "u_colorA"),
      colorB: gl.getUniformLocation(program, "u_colorB"),
      colorC: gl.getUniformLocation(program, "u_colorC"),
      highlight: gl.getUniformLocation(program, "u_highlight"),
      background: gl.getUniformLocation(program, "u_background"),
    };

    // Cap DPR at 1 — the marble field is soft, no hard edges to sharpen,
    // and the per-pixel fbm cost is the dominant load. On retina this is
    // a 4x speedup with no perceptible quality loss.
    const dpr = Math.min(1, window.devicePixelRatio || 1);
    const start = performance.now();
    let raf = 0;
    let disposed = false;

    const resize = () => {
      if (disposed) return;
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

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!visible || !pageVisible) return;

      const p = paramsRef.current;
      const spec = PALETTES[p.palette] ?? PALETTES.toxic;

      const custom = p.colors && p.colors.length >= 3 ? p.colors : null;
      const colorA = custom
        ? parseColor(custom[0], spec.colorA)
        : spec.colorA;
      const colorB = custom
        ? parseColor(custom[1], spec.colorB)
        : spec.colorB;
      const colorC = custom
        ? parseColor(custom[2], spec.colorC)
        : spec.colorC;
      const highlight =
        custom && custom[3]
          ? parseColor(custom[3], spec.highlight)
          : spec.highlight;
      const bg = p.backgroundColor
        ? parseColor(p.backgroundColor, spec.bg)
        : spec.bg;

      const elapsed = (performance.now() - start) / 1000;

      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.14 : 0.05;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;
      const activeTarget = target.active ? 1 : 0;
      pointerActiveRef.current +=
        (activeTarget - pointerActiveRef.current) *
        (target.active ? 0.18 : 0.06);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.speed, p.speed);
      gl.uniform1f(loc.viscosity, Math.max(0, Math.min(2, p.viscosity)));
      gl.uniform1f(loc.detail, Math.max(0, Math.min(2, p.detail)));
      gl.uniform1f(loc.contrast, Math.max(0, Math.min(1, p.contrast)));
      gl.uniform1f(loc.shine, Math.max(0, Math.min(2, p.shine)));
      gl.uniform1f(loc.roughness, Math.max(0, Math.min(1, p.roughness)));
      gl.uniform1f(loc.grain, Math.max(0, Math.min(0.2, p.grain)));
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1i(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(
        loc.mouseInfluence,
        p.mouseInfluence * pointerActiveRef.current,
      );
      gl.uniform3f(loc.colorA, colorA[0], colorA[1], colorA[2]);
      gl.uniform3f(loc.colorB, colorB[0], colorB[1], colorB[2]);
      gl.uniform3f(loc.colorC, colorC[0], colorC[1], colorC[2]);
      gl.uniform3f(loc.highlight, highlight[0], highlight[1], highlight[2]);
      gl.uniform3f(loc.background, bg[0], bg[1], bg[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      // Detach buffers from VAO before deleting — some drivers leak VRAM if
      // the VAO is freed while its attribute buffer is still bound.
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      // Free the context itself, not just its buffers — a detached canvas
      // keeps its live WebGL context, and browsers cap live contexts (~16)
      // then evict the oldest, so leaking one per navigation eventually janks
      // the whole app. Deferred + isConnected-guarded so a StrictMode/HMR
      // remount that reuses this same <canvas> keeps its context — a lost
      // context can't be re-acquired on the same element, which is the compile
      // error this guard previously sidestepped by never releasing at all.
      setTimeout(() => {
        if (!canvas.isConnected)
          gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
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

  const fallbackSpec = PALETTES[palette] ?? PALETTES.toxic;
  const customStops = colors && colors.length >= 3 ? colors : null;
  const stopA = customStops ? customStops[0] : rgbToCss(fallbackSpec.colorA);
  const stopB = customStops ? customStops[1] : rgbToCss(fallbackSpec.colorB);
  const stopC = customStops ? customStops[2] : rgbToCss(fallbackSpec.colorC);
  const bgCss = backgroundColor ?? rgbToCss(fallbackSpec.bg);
  const fallbackBg = `radial-gradient(ellipse at 30% 30%, ${stopC} 0%, ${stopB} 35%, ${stopA} 65%, ${bgCss} 100%)`;

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

SlimeBackground.displayName = "SlimeBackground";
