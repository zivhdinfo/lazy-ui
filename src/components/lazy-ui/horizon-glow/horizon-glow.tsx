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

export type HorizonGlowPalette =
  | "aurora"
  | "dawn"
  | "ice"
  | "ember"
  | "violet"
  | "silver";

export type HorizonGlowMode = "dark" | "light";

export interface HorizonGlowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the canvas. Wrapped in `relative z-10 h-full w-full`. */
  children?: ReactNode;
  /** Color preset for the bottom horizon glow. @default "aurora" */
  palette?: HorizonGlowPalette;
  /** Surface mode. `light` renders the sample-style transparent glow on white. @default "dark" */
  mode?: HorizonGlowMode;
  /** Custom multi-stop palette (2-6 entries). Colors drift left to right across the arc. Overrides `palette`. */
  colors?: string[];
  /** Solid fill behind the transparent glow and reduced-motion fallback. @default mode background */
  backgroundColor?: string;
  /** Animation speed multiplier. `0` freezes the glow. @default 0.35 */
  speed?: number;
  /** Overall brightness multiplier (0-2). @default 1.15 */
  intensity?: number;
  /** Vertical height of the horizon arc (0-1). Higher lifts the arc into the frame. @default 0.48 */
  rise?: number;
  /** Strength of the upward light rays (0-1.5). @default 0.85 */
  rays?: number;
  /** Halo spread around the arc (0-1). Higher makes the glow wider and softer. @default 0.58 */
  softness?: number;
  /** Cursor hover brightens and pulls the horizon glow toward the pointer. @default true */
  mouseFollow?: boolean;
  /** Cursor hover strength (0-1). @default 0.55 */
  mouseInfluence?: number;
  /** Click emits a temporary radial burst through the horizon. @default true */
  clickRipple?: boolean;
  /** Click ripple strength (0-1). @default 0.65 */
  rippleStrength?: number;
  /** Render `children` above the glow. Useful for previewing the surface without overlay copy. @default true */
  showContent?: boolean;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define MAX_STOPS 6
#define MAX_RIPPLES 6

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform float u_rise;
uniform float u_rays;
uniform float u_softness;
uniform float u_lightMode;
uniform vec2 u_mouse;
uniform float u_pointer;
uniform float u_mouseFollow;
uniform float u_mouseInfluence;
uniform vec4 u_ripples[MAX_RIPPLES];
uniform int u_rippleCount;
uniform vec3 u_stops[MAX_STOPS];
uniform int u_stopCount;

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

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.04 + 5.2;
    a *= 0.5;
  }
  return v;
}

vec3 sampleStops(float t) {
  int n = clamp(u_stopCount, 2, MAX_STOPS);
  t = clamp(t, 0.0, 1.0);
  float scaled = t * float(n - 1);
  int idx = int(floor(scaled));
  int next = min(idx + 1, n - 1);
  float frac = scaled - float(idx);
  return mix(u_stops[idx], u_stops[next], frac);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  float t = u_time * u_speed;
  float softness = clamp(u_softness, 0.0, 1.0);
  float lightMode = clamp(u_lightMode, 0.0, 1.0);

  // A large circle sits below the frame. Its top edge becomes the bright
  // horizon line; the interior becomes a soft filled dome.
  float top = mix(0.25, 0.68, clamp(u_rise, 0.0, 1.0));
  float radius = mix(1.25, 1.95, softness);
  float centerY = top - radius;

  vec2 d = vec2((uv.x - 0.5) * aspect, uv.y - centerY);
  float dist = length(d);
  float rim = dist - radius;
  float sideMix = smoothstep(0.0, 0.62, abs(uv.x - 0.5));

  float flowNoise = fbm(vec2(uv.x * 3.2 + t * 0.12, uv.y * 2.0 - t * 0.08));
  float rayBands = pow(
    0.5 + 0.5 * sin((uv.x + flowNoise * 0.14) * 28.0 + t * 1.15),
    2.35
  );
  float rayNoise = mix(
    fbm(vec2(uv.x * 5.2 - t * 0.08, uv.y * 1.35 + t * 0.16)),
    rayBands,
    0.36
  );

  float dome = (1.0 - smoothstep(-0.42, 0.06 + softness * 0.03, rim))
    * smoothstep(0.0, 0.24, uv.y);
  float rayDecay = exp(-mix(4.6, 2.75, softness) * max(rim, 0.0));
  float rays = rayDecay
    * (0.44 + rayNoise * 0.78)
    * (1.0 - 0.42 * sideMix)
    * clamp(u_rays, 0.0, 1.5);
  float rimGlow = exp(-mix(7.2, 4.2, softness) * abs(rim));

  float strength = clamp(dome * 0.82 + rays * 0.78 + rimGlow * 0.95, 0.0, 1.0);
  strength = pow(strength, mix(1.34, 1.02, softness));

  float drift = 0.15 * sin(u_time * 0.33 + uv.y * 3.0)
    + 0.1 * sin(u_time * 0.21 - uv.x * 4.5 + 1.5);
  vec3 tint = sampleStops(clamp(uv.x + drift, 0.0, 1.0));
  vec3 color = tint + rimGlow * mix(0.82, 0.85, lightMode) * (vec3(1.0) - tint);

  float mx1 = 0.5 + 0.34 * sin(u_time * 0.35);
  float mx2 = 0.5 + 0.26 * sin(u_time * 0.23 + 2.0);
  float sweep = exp(-7.0 * (uv.x - mx1) * (uv.x - mx1))
    + 0.6 * exp(-10.0 * (uv.x - mx2) * (uv.x - mx2));
  float highlight = sweep * (rimGlow * 1.1 + dome * 0.32);
  strength = clamp(strength + highlight * 0.48, 0.0, 1.0);
  color = mix(
    color,
    vec3(1.0),
    clamp(highlight * 0.55, 0.0, 1.0)
  );

  float interactionGate = smoothstep(0.08, 0.42, strength);

  if (u_mouseFollow > 0.5) {
    vec2 mdv = (uv - u_mouse) * vec2(aspect, 1.0);
    float md = length(mdv);
    float hover = exp(-md * md * 20.0)
      * clamp(u_pointer, 0.0, 1.0)
      * clamp(u_mouseInfluence, 0.0, 1.0)
      * interactionGate;
    float horizonHover = hover * (0.35 + rimGlow * 0.8 + rayDecay * 0.25);
    vec3 hoverTint = sampleStops(clamp(u_mouse.x + drift * 0.5, 0.0, 1.0));
    strength = clamp(strength + horizonHover * 0.55, 0.0, 1.0);
    color = mix(color, hoverTint, clamp(hover * 0.42, 0.0, 1.0));
    color = mix(
      color,
      vec3(1.0),
      clamp(horizonHover * 0.34, 0.0, 1.0)
    );
  }

  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= u_rippleCount) break;
    vec4 ripple = u_ripples[i];
    if (ripple.w > 0.0) {
      float age = ripple.z;
      if (age >= 0.0 && age <= 1.25) {
        vec2 rdv = (uv - ripple.xy) * vec2(aspect, 1.0);
        float rd = length(rdv);
        float wave = 0.04 + age * 0.68;
        float band = exp(-pow((rd - wave) * 10.5, 2.0));
        float decay = 1.0 - smoothstep(0.0, 1.25, age);
        float burst = band * decay * clamp(ripple.w, 0.0, 1.0) * interactionGate;
        float horizonBurst = burst * (0.45 + rimGlow * 0.8 + rayDecay * 0.2);
        strength = clamp(strength + horizonBurst * 0.72, 0.0, 1.0);
        color = mix(
          color,
          vec3(1.0),
          clamp(horizonBurst * 0.72, 0.0, 1.0)
        );
      }
    }
  }

  float topFade = 1.0 - smoothstep(0.86, 1.0, uv.y);
  color = clamp(color * clamp(u_intensity, 0.0, 2.0), 0.0, 1.0);
  float alpha = pow(clamp(strength, 0.0, 1.0), mix(1.0, 1.08, lightMode));
  fragColor = vec4(color, clamp(alpha * topFade, 0.0, 1.0));
}
`;

type Rgb = [number, number, number];

type PaletteSpec = {
  stops: Rgb[];
  bg: Rgb;
  lightBg: Rgb;
};

const PALETTES: Record<HorizonGlowPalette, PaletteSpec> = {
  aurora: {
    stops: [
      [0.55, 0.36, 0.96],
      [0.39, 0.4, 0.95],
      [0.23, 0.51, 0.96],
      [0.05, 0.65, 0.91],
      [0.22, 0.74, 0.97],
    ],
    bg: [0.01, 0.012, 0.035],
    lightBg: [1.0, 1.0, 1.0],
  },
  dawn: {
    stops: [
      [0.92, 0.35, 0.05],
      [0.98, 0.45, 0.09],
      [0.96, 0.62, 0.04],
      [0.98, 0.75, 0.14],
      [0.99, 0.88, 0.28],
    ],
    bg: [0.04, 0.015, 0.0],
    lightBg: [1.0, 1.0, 1.0],
  },
  ice: {
    stops: [
      [0.62, 0.9, 1.0],
      [0.42, 0.8, 1.0],
      [0.22, 0.62, 1.0],
      [0.74, 0.95, 1.0],
      [0.96, 0.99, 1.0],
    ],
    bg: [0.0, 0.018, 0.05],
    lightBg: [1.0, 1.0, 1.0],
  },
  ember: {
    stops: [
      [0.55, 0.05, 0.04],
      [0.88, 0.16, 0.08],
      [1.0, 0.42, 0.12],
      [1.0, 0.66, 0.2],
      [1.0, 0.9, 0.55],
    ],
    bg: [0.035, 0.006, 0.004],
    lightBg: [1.0, 1.0, 1.0],
  },
  violet: {
    stops: [
      [0.3, 0.12, 0.72],
      [0.49, 0.22, 0.94],
      [0.68, 0.43, 1.0],
      [0.85, 0.72, 1.0],
      [1.0, 0.95, 1.0],
    ],
    bg: [0.02, 0.01, 0.05],
    lightBg: [1.0, 1.0, 1.0],
  },
  silver: {
    stops: [
      [0.25, 0.25, 0.28],
      [0.45, 0.45, 0.5],
      [0.72, 0.72, 0.76],
      [0.9, 0.9, 0.94],
      [1.0, 1.0, 1.0],
    ],
    bg: [0.015, 0.015, 0.018],
    lightBg: [1.0, 1.0, 1.0],
  },
};

const MAX_STOPS = 6;
const MAX_RIPPLES = 6;
const INTERACTION_STRENGTH_THRESHOLD = 0.16;
const RIPPLE_DURATION_SECONDS = 1.25;

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

function resolveStops(spec: PaletteSpec): Rgb[] {
  return spec.stops;
}

function resolveBackground(spec: PaletteSpec, mode: HorizonGlowMode): Rgb {
  return mode === "light" ? spec.lightBg : spec.bg;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function smoothStep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / Math.max(edge1 - edge0, 0.0001));
  return t * t * (3 - 2 * t);
}

function horizonInteractionStrength(
  x: number,
  y: number,
  rise: number,
  rays: number,
  softness: number,
  aspect: number,
): number {
  const s = clamp01(softness);
  const top = lerp(0.25, 0.68, clamp01(rise));
  const radius = lerp(1.25, 1.95, s);
  const centerY = top - radius;
  const dx = (x - 0.5) * aspect;
  const dy = y - centerY;
  const dist = Math.hypot(dx, dy);
  const rim = dist - radius;
  const sideMix = smoothStep(0, 0.62, Math.abs(x - 0.5));
  const dome =
    (1 - smoothStep(-0.42, 0.06 + s * 0.03, rim)) *
    smoothStep(0, 0.24, y);
  const rayDecay = Math.exp(-lerp(4.6, 2.75, s) * Math.max(rim, 0));
  const rayMask =
    rayDecay *
    (1 - 0.42 * sideMix) *
    Math.max(0, Math.min(1.5, rays)) *
    0.78;
  const rimGlow = Math.exp(-lerp(7.2, 4.2, s) * Math.abs(rim));
  const strength = clamp01(dome * 0.82 + rayMask + rimGlow * 0.95);
  const shaped = Math.pow(strength, lerp(1.34, 1.02, s));
  return clamp01(shaped * (1 - smoothStep(0.86, 1, y)));
}

function pointerPosition(e: ReactPointerEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = clamp01((e.clientX - rect.left) / Math.max(rect.width, 1));
  const y = clamp01(1 - (e.clientY - rect.top) / Math.max(rect.height, 1));
  const aspect = rect.width / Math.max(rect.height, 1);
  return { x, y, aspect };
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
    console.error("HorizonGlow compile error:", gl.getShaderInfoLog(shader));
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
    console.error("HorizonGlow link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function HorizonGlow({
  children,
  palette = "aurora",
  mode = "dark",
  colors,
  backgroundColor,
  speed = 0.35,
  intensity = 1.15,
  rise = 0.48,
  rays = 0.85,
  softness = 0.58,
  mouseFollow = true,
  mouseInfluence = 0.55,
  clickRipple = true,
  rippleStrength = 0.65,
  showContent = true,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...rest
}: HorizonGlowProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    palette,
    mode,
    colors,
    backgroundColor,
    speed,
    intensity,
    rise,
    rays,
    softness,
    mouseFollow,
    mouseInfluence,
    clickRipple,
    rippleStrength,
  });
  useEffect(() => {
    paramsRef.current = {
      palette,
      mode,
      colors,
      backgroundColor,
      speed,
      intensity,
      rise,
      rays,
      softness,
      mouseFollow,
      mouseInfluence,
      clickRipple,
      rippleStrength,
    };
  }, [
    palette,
    mode,
    colors,
    backgroundColor,
    speed,
    intensity,
    rise,
    rays,
    softness,
    mouseFollow,
    mouseInfluence,
    clickRipple,
    rippleStrength,
  ]);

  const smoothedRef = useRef({
    speed,
    intensity,
    rise,
    rays,
    softness,
    mouseInfluence,
  });
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
  const ripplesRef = useRef<
    Array<{
      x: number;
      y: number;
      start: number;
      strength: number;
    }>
  >([]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    } as WebGLContextAttributes) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn("HorizonGlow: WebGL2 unavailable - static fallback shown.");
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
      intensity: gl.getUniformLocation(program, "u_intensity"),
      rise: gl.getUniformLocation(program, "u_rise"),
      rays: gl.getUniformLocation(program, "u_rays"),
      softness: gl.getUniformLocation(program, "u_softness"),
      lightMode: gl.getUniformLocation(program, "u_lightMode"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
      ripples: gl.getUniformLocation(program, "u_ripples[0]"),
      rippleCount: gl.getUniformLocation(program, "u_rippleCount"),
      stops: gl.getUniformLocation(program, "u_stops[0]"),
      stopCount: gl.getUniformLocation(program, "u_stopCount"),
    };

    gl.clearColor(0, 0, 0, 0);
    gl.disable(gl.DEPTH_TEST);

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
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

    const targetStops = new Float32Array(MAX_STOPS * 3);
    const currentStops = new Float32Array(MAX_STOPS * 3);
    const rippleUniforms = new Float32Array(MAX_RIPPLES * 4);
    let colorsInitialized = false;

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!visible || !pageVisible) return;

      const now = performance.now();
      const p = paramsRef.current;
      const spec = PALETTES[p.palette] ?? PALETTES.aurora;
      const modeStops = resolveStops(spec);
      const rawStops = p.colors && p.colors.length > 0 ? p.colors : null;
      const stopCount = rawStops
        ? Math.min(MAX_STOPS, Math.max(2, rawStops.length))
        : Math.min(MAX_STOPS, modeStops.length);

      for (let i = 0; i < MAX_STOPS; i++) {
        const fallback = modeStops[Math.min(i, modeStops.length - 1)];
        const stop =
          rawStops && i < rawStops.length
            ? parseColor(rawStops[i], fallback)
            : modeStops[Math.min(i, modeStops.length - 1)];
        targetStops[i * 3] = stop[0];
        targetStops[i * 3 + 1] = stop[1];
        targetStops[i * 3 + 2] = stop[2];
      }

      if (!colorsInitialized) {
        currentStops.set(targetStops);
        colorsInitialized = true;
      } else {
        for (let i = 0; i < currentStops.length; i++) {
          currentStops[i] += (targetStops[i] - currentStops[i]) * 0.08;
        }
      }

      const s = smoothedRef.current;
      const sLerp = 0.12;
      s.speed += (p.speed - s.speed) * sLerp;
      s.intensity += (p.intensity - s.intensity) * sLerp;
      s.rise += (p.rise - s.rise) * sLerp;
      s.rays += (p.rays - s.rays) * sLerp;
      s.softness += (p.softness - s.softness) * sLerp;
      s.mouseInfluence += (p.mouseInfluence - s.mouseInfluence) * sLerp;

      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.14 : 0.04;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;
      const pointerTarget = target.active ? 1 : 0;
      pointerActiveRef.current +=
        (pointerTarget - pointerActiveRef.current) *
        (target.active ? 0.18 : 0.06);

      rippleUniforms.fill(0);
      let rippleCount = 0;
      if (p.clickRipple) {
        const ripples = ripplesRef.current;
        for (let i = 0; i < ripples.length && rippleCount < MAX_RIPPLES; i++) {
          const ripple = ripples[i];
          const rippleAge = (now - ripple.start) / 1000;
          if (
            rippleAge < 0 ||
            rippleAge > RIPPLE_DURATION_SECONDS ||
            ripple.strength <= 0
          ) {
            continue;
          }
          const offset = rippleCount * 4;
          rippleUniforms[offset] = ripple.x;
          rippleUniforms[offset + 1] = ripple.y;
          rippleUniforms[offset + 2] = rippleAge;
          rippleUniforms[offset + 3] = ripple.strength;
          rippleCount++;
        }
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, (now - start) / 1000);
      gl.uniform1f(loc.speed, Math.max(0, s.speed));
      gl.uniform1f(loc.intensity, Math.max(0, Math.min(2, s.intensity)));
      gl.uniform1f(loc.rise, Math.max(0, Math.min(1, s.rise)));
      gl.uniform1f(loc.rays, Math.max(0, Math.min(1.5, s.rays)));
      gl.uniform1f(loc.softness, Math.max(0, Math.min(1, s.softness)));
      gl.uniform1f(loc.lightMode, p.mode === "light" ? 1 : 0);
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1f(loc.pointer, pointerActiveRef.current);
      gl.uniform1f(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(
        loc.mouseInfluence,
        Math.max(0, Math.min(1, s.mouseInfluence)),
      );
      gl.uniform4fv(loc.ripples, rippleUniforms);
      gl.uniform1i(loc.rippleCount, rippleCount);
      gl.uniform3fv(loc.stops, currentStops);
      gl.uniform1i(loc.stopCount, stopCount);
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
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      setTimeout(() => {
        if (!canvas.isConnected)
          gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    };
  }, [reduced]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { x, y, aspect } = pointerPosition(e);
    const p = paramsRef.current;
    const strength = horizonInteractionStrength(
      x,
      y,
      p.rise,
      p.rays,
      p.softness,
      aspect,
    );
    mouseTargetRef.current = {
      x,
      y,
      active:
        p.mouseFollow &&
        p.mouseInfluence > 0 &&
        p.intensity > 0 &&
        strength >= INTERACTION_STRENGTH_THRESHOLD,
    };
    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    mouseTargetRef.current = { x: 0.5, y: 0.5, active: false };
    onPointerLeave?.(e);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { x, y, aspect } = pointerPosition(e);
    const p = paramsRef.current;
    const strength = horizonInteractionStrength(
      x,
      y,
      p.rise,
      p.rays,
      p.softness,
      aspect,
    );
    if (
      p.clickRipple &&
      p.intensity > 0 &&
      strength >= INTERACTION_STRENGTH_THRESHOLD
    ) {
      const now = performance.now();
      const activeRipples = ripplesRef.current.filter(
        (ripple) =>
          (now - ripple.start) / 1000 <= RIPPLE_DURATION_SECONDS &&
          ripple.strength > 0,
      );
      activeRipples.push({
        x,
        y,
        start: now,
        strength: Math.max(0, Math.min(1, p.rippleStrength)),
      });
      ripplesRef.current = activeRipples.slice(-MAX_RIPPLES);
    }
    onPointerDown?.(e);
  };

  const spec = PALETTES[palette] ?? PALETTES.aurora;
  const modeStops = resolveStops(spec);
  const fallbackStops = colors && colors.length > 0 ? colors : modeStops.map(rgbToCss);
  const bgCss = backgroundColor ?? rgbToCss(resolveBackground(spec, mode));
  const fallbackBg = `radial-gradient(ellipse at 50% 105%, ${fallbackStops[Math.min(4, fallbackStops.length - 1)]} 0%, ${fallbackStops[Math.floor(fallbackStops.length / 2)]} 24%, ${fallbackStops[0]} 46%, transparent 74%), ${bgCss}`;

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
      onPointerDown={handlePointerDown}
      {...rest}
    >
      {!reduced && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      {showContent && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

HorizonGlow.displayName = "HorizonGlow";
