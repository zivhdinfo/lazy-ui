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

export type LiquidChromePalette =
  | "nightfire"
  | "aurora"
  | "nebula"
  | "ember"
  | "chrome"
  | "mercury";

export interface LiquidChromeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the canvas. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Color preset. @default "nightfire" */
  palette?: LiquidChromePalette;
  /** Custom 5-stop palette `[base, ambient, lightA, lightB, sparkle]`. Overrides `palette`. */
  colors?: string[];
  /** Animation speed multiplier. `0` freezes the surface. @default 0.45 */
  speed?: number;
  /** Wave field scale — higher packs more swirls into the frame. @default 2.4 */
  scale?: number;
  /** Domain-warp depth — how tightly the liquid curls back on itself (0–3). @default 1.3 */
  warp?: number;
  /** Surface relief (0.1–4). Lower = more mirror-like. @default 0.85 */
  relief?: number;
  /** Rotation of the two-light pair around the canvas center, in degrees. @default 0 */
  tilt?: number;
  /** Specular highlight intensity (0–3). Brightness of both reflected lights. @default 1.4 */
  highlight?: number;
  /** Surface roughness (0–1). 0 = needle-sharp pinpoint glints, 1 = soft satin smears. @default 0.12 */
  roughness?: number;
  /** Ambient base glow strength (0–1). Lifts the dead-black shadow. @default 0.3 */
  ambient?: number;
  /** Cursor stirs the liquid flow. @default true */
  mouseFollow?: boolean;
  /** Stir strength (0–1). @default 0.55 */
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

// Two-light bichromatic chrome: a doubly domain-warped fbm height field is
// sampled with finite-difference gradients to recover a surface normal. Two
// point lights sit at fixed offsets from the canvas center (rotatable via
// `u_tilt`) and each contributes a Blinn-Phong specular term in its own
// color — gold from the upper-left, blue from the right by default. The
// base surface is near-black; almost all visible color comes from the
// reflected lights, attenuated by distance from each light's UV position.
// A high-frequency hash term sprinkles glitter dust through the lit regions
// (twinkles slowly with time). The result reads as dark inky liquid with
// two coloured studio rigs catching the crests.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_warp;
uniform float u_relief;
uniform float u_tilt;
uniform float u_highlight;
uniform float u_roughness;
uniform float u_ambient;
uniform vec2 u_mouse;
uniform int u_mouseFollow;
uniform float u_mouseInfluence;
uniform vec3 u_c0;  // base (dark)
uniform vec3 u_c1;  // ambient glow tint
uniform vec3 u_c2;  // light A color (warm by default)
uniform vec3 u_c3;  // light B color (cool by default)
uniform vec3 u_c4;  // sparkle accent

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

// 3 octaves — after the double domain warp below, the 4th octave is
// barely visible and just bloats the per-pixel cost. Sticking to 3 cuts
// roughly 25% of the fbm work without a perceptible quality change.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 4.7;
    a *= 0.5;
  }
  return v;
}

// Inigo Quilez recursive domain warp — a first fbm sample becomes the
// offset for a second sample, which becomes the offset for the final read.
// Two recursive levels produce the ropy, curling reflections that read as
// poured liquid rather than generic cloud noise.
float marble(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + t * 0.12),
    fbm(p + vec2(5.2, 1.3) - t * 0.09)
  );
  vec2 pq = p + u_warp * 4.0 * q;
  vec2 r = vec2(
    fbm(pq + vec2(1.7, 9.2) + t * 0.17),
    fbm(pq + vec2(8.3, 2.8) - t * 0.13)
  );
  return fbm(p + u_warp * 4.0 * r);
}

float heightAt(vec2 uv, float t) {
  // Anisotropic scaling — wider in X, narrower in Y. The result is that
  // the warped noise stretches horizontally so the liquid reads as poured
  // ribbon flowing left-to-right rather than a field of round blobs.
  vec2 p = uv * vec2(u_scale * 0.7, u_scale * 1.4);
  // Slow horizontal drift so the chrome appears to keep pouring.
  p.x -= t * 0.16;

  // Cursor pushes a Gaussian bulge into the field. Working on the sampled
  // coordinate rather than the resulting color keeps normals consistent —
  // no flat-shaded "disc" giveaway around the pointer.
  if (u_mouseFollow == 1) {
    vec2 d = uv - u_mouse;
    p += d * exp(-dot(d, d) * 18.0) * u_mouseInfluence * 1.5;
  }
  return marble(p, t);
}

// Returns the specular and halo contribution of a single point light in
// UV space. The light sits at lightUV with a fixed virtual height (the
// last component of toL) so the half-vector calculation has parallax
// across the canvas rather than acting as a single directional source.
// Output: vec3(sharp, halo, attenuation).
vec3 lightContribution(vec3 N, vec2 uv, vec2 lightUV, float shininess) {
  vec3 toL = vec3(lightUV - uv, 0.55);
  float dist = length(toL.xy);
  toL = normalize(toL);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(toL + V);
  float NdotH = max(dot(N, H), 0.0);
  float sharp = pow(NdotH, shininess);
  float halo = pow(NdotH, max(4.0, shininess * 0.08));
  // Soft inverse-square-ish falloff — fades the influence with distance
  // so each light owns its quadrant of the canvas.
  float atten = 1.0 / (1.0 + dist * dist * 3.2);
  return vec3(sharp, halo, atten);
}

void main() {
  float t = u_time * u_speed;

  // Aspect-correct so the wave shapes don't squash on wide containers.
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 uv = v_uv;
  vec2 puv = (uv - 0.5) * vec2(aspect, 1.0) + 0.5;

  // Finite-difference normal — three samples. Epsilon scales inversely
  // with u_scale so the sample step stays proportional to one wave period
  // regardless of zoom level. Without this the gradient explodes at high
  // scale and the specular term shimmers at every pixel.
  float eps = 0.0028;
  float h0 = heightAt(puv, t);
  float hx = heightAt(puv + vec2(eps, 0.0), t);
  float hy = heightAt(puv + vec2(0.0, eps), t);

  // Normalize the gradient by u_scale so the apparent tilt of each wave
  // stays constant — at high scale the field oscillates more often but
  // each wave still reads as the same depth, not a screaming high-freq
  // noise field.
  float gradScale = 1.0 / max(0.5, u_scale);
  vec3 N = normalize(vec3(
    (h0 - hx) / eps * gradScale,
    (h0 - hy) / eps * gradScale,
    max(0.1, u_relief)
  ));

  // Two-light positions, rotated as a pair around (0.5, 0.5) by u_tilt.
  // Light A (warm) sits upper-left of center; Light B (cool) sits right.
  vec2 lightAOff = vec2(-0.22, 0.20);
  vec2 lightBOff = vec2(0.30, -0.02);
  float tiltRad = u_tilt * 0.01745329;
  float ca = cos(tiltRad);
  float sa = sin(tiltRad);
  mat2 rot = mat2(ca, -sa, sa, ca);
  vec2 lightAUV = vec2(0.5) + rot * lightAOff;
  vec2 lightBUV = vec2(0.5) + rot * lightBOff;

  float shininess = mix(420.0, 12.0, clamp(u_roughness, 0.0, 1.0));
  vec3 contA = lightContribution(N, v_uv, lightAUV, shininess);
  vec3 contB = lightContribution(N, v_uv, lightBUV, shininess);

  // Compose — start from near-black base, add each light tinted by its own
  // colour and attenuated by distance. The halo term broadens each light
  // into the soft glow you see surrounding the sharp specular streaks.
  vec3 col = u_c0;
  col += u_c2 * (contA.x * 1.8 + contA.y * 0.22) * contA.z * u_highlight;
  col += u_c3 * (contB.x * 1.8 + contB.y * 0.22) * contB.z * u_highlight;

  // Ambient bias — the dark base picks up a slight tint of whichever light
  // it's closest to. Without this the unlit regions read as flat black and
  // the lit regions float in space; with it, the whole field feels like a
  // single illuminated volume.
  float totalAtten = contA.z + contB.z + 0.0001;
  vec3 ambTint = (u_c2 * contA.z + u_c3 * contB.z) / totalAtten;
  col += mix(u_c1, ambTint, 0.6) * u_ambient * (contA.z + contB.z) * 0.5;

  // Rim crescents — surfaces facing nearly grazing pick up a thin bright
  // edge from whichever light is closer. Sells the "wet" curl edges.
  float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 2.5);
  col += ambTint * rim * 0.35 * u_highlight;

  // c4 is the warm sparkle accent — used here to brighten the very top of
  // each crest where both lights are catching it. Keeps the accent stop
  // doing something rather than going unused after sparkle was removed.
  float crestPop = pow(max(contA.x, contB.x), 0.5) * smoothstep(0.55, 0.95, h0);
  col += u_c4 * crestPop * (contA.z + contB.z) * 0.18 * u_highlight;

  // Vignette toward the deepest base near the far edges — pushes the eye
  // into the lit centre and matches the moody depth in the reference.
  vec2 cv = (v_uv - 0.5) * vec2(aspect, 1.0);
  float vig = smoothstep(0.55, 1.15, length(cv));
  col = mix(col, u_c0, vig * 0.4);

  fragColor = vec4(col, 1.0);
}
`;

type Rgb = [number, number, number];

interface PaletteSpec {
  c0: Rgb; // base dark
  c1: Rgb; // ambient glow tint
  c2: Rgb; // light A color (warm)
  c3: Rgb; // light B color (cool)
  c4: Rgb; // sparkle accent
}

const PALETTES: Record<LiquidChromePalette, PaletteSpec> = {
  // Reference image — near-black inky liquid with gold + electric blue
  // studio lights, warm champagne sparkle accent.
  nightfire: {
    c0: [0.003, 0.005, 0.011],
    c1: [0.04, 0.06, 0.10],
    c2: [1.0, 0.62, 0.18],
    c3: [0.18, 0.55, 1.0],
    c4: [1.0, 0.92, 0.65],
  },
  // Teal + magenta — same dark base, two saturated complementary lights.
  aurora: {
    c0: [0.005, 0.008, 0.012],
    c1: [0.06, 0.05, 0.10],
    c2: [1.0, 0.30, 0.65],
    c3: [0.22, 0.95, 0.82],
    c4: [0.95, 0.92, 1.0],
  },
  // Violet + cyan — cosmic feel.
  nebula: {
    c0: [0.004, 0.005, 0.012],
    c1: [0.06, 0.05, 0.12],
    c2: [0.75, 0.25, 0.95],
    c3: [0.22, 0.78, 1.0],
    c4: [1.0, 0.88, 1.0],
  },
  // Amber + red — warm two-tone fire.
  ember: {
    c0: [0.012, 0.005, 0.003],
    c1: [0.12, 0.05, 0.02],
    c2: [1.0, 0.55, 0.15],
    c3: [1.0, 0.22, 0.10],
    c4: [1.0, 0.92, 0.55],
  },
  // Original cool silver chrome — kept for the "polished metal" look from
  // the earlier reference image.
  chrome: {
    c0: [0.025, 0.038, 0.06],
    c1: [0.16, 0.22, 0.32],
    c2: [0.88, 0.70, 0.42],
    c3: [0.50, 0.72, 0.95],
    c4: [0.97, 0.98, 1.0],
  },
  // Neutral silver mercury — no chromatic cast.
  mercury: {
    c0: [0.028, 0.028, 0.032],
    c1: [0.20, 0.20, 0.22],
    c2: [0.85, 0.80, 0.75],
    c3: [0.75, 0.80, 0.85],
    c4: [1.0, 1.0, 1.0],
  },
};

function parseColor(input: string, fallback: Rgb): Rgb {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "transparent" || trimmed === "none") return fallback;
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
    console.error("LiquidChrome compile error:", gl.getShaderInfoLog(shader));
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
    console.error("LiquidChrome link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function LiquidChrome({
  children,
  palette = "nightfire",
  colors,
  speed = 0.45,
  scale = 2.4,
  warp = 1.3,
  relief = 0.85,
  tilt = 0,
  highlight = 1.4,
  roughness = 0.12,
  ambient = 0.3,
  mouseFollow = true,
  mouseInfluence = 0.55,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: LiquidChromeProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    speed,
    scale,
    warp,
    relief,
    tilt,
    highlight,
    roughness,
    ambient,
    mouseFollow,
    mouseInfluence,
  });
  useEffect(() => {
    paramsRef.current = {
      speed,
      scale,
      warp,
      relief,
      tilt,
      highlight,
      roughness,
      ambient,
      mouseFollow,
      mouseInfluence,
    };
  }, [
    speed,
    scale,
    warp,
    relief,
    tilt,
    highlight,
    roughness,
    ambient,
    mouseFollow,
    mouseInfluence,
  ]);

  // Parsed RGB stops live in a ref and are only recomputed when palette or
  // custom colors change. The previous design ran parseColor inside the
  // render loop, allocating five 3-tuple arrays per frame (~300/s at 60fps)
  // and producing measurable GC churn. Moving the work into an effect
  // eliminates that allocation entirely.
  const colorsRef = useRef<PaletteSpec>(
    PALETTES[palette] ?? PALETTES.nightfire,
  );
  useEffect(() => {
    const spec = PALETTES[palette] ?? PALETTES.nightfire;
    const custom = colors && colors.length >= 5 ? colors : null;
    colorsRef.current = {
      c0: custom ? parseColor(custom[0], spec.c0) : spec.c0,
      c1: custom ? parseColor(custom[1], spec.c1) : spec.c1,
      c2: custom ? parseColor(custom[2], spec.c2) : spec.c2,
      c3: custom ? parseColor(custom[3], spec.c3) : spec.c3,
      c4: custom ? parseColor(custom[4], spec.c4) : spec.c4,
    };
  }, [palette, colors]);

  const mouseTargetRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });
  const mouseSmoothedRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
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
      powerPreference: "low-power",
    } as WebGLContextAttributes) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn(
        "LiquidChrome: WebGL2 unavailable — static fallback shown.",
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
      scale: gl.getUniformLocation(program, "u_scale"),
      warp: gl.getUniformLocation(program, "u_warp"),
      relief: gl.getUniformLocation(program, "u_relief"),
      tilt: gl.getUniformLocation(program, "u_tilt"),
      highlight: gl.getUniformLocation(program, "u_highlight"),
      roughness: gl.getUniformLocation(program, "u_roughness"),
      ambient: gl.getUniformLocation(program, "u_ambient"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
      c0: gl.getUniformLocation(program, "u_c0"),
      c1: gl.getUniformLocation(program, "u_c1"),
      c2: gl.getUniformLocation(program, "u_c2"),
      c3: gl.getUniformLocation(program, "u_c3"),
      c4: gl.getUniformLocation(program, "u_c4"),
    };

    // Cap DPR well below 1 — the chrome field is dominated by smooth
    // gradients (low-frequency post-warp), so internal resolution can drop
    // to 60% of CSS pixels before the upscale becomes visible. The fragment
    // shader is heavy (15 fbm calls per pixel for normal sampling) so this
    // is the single largest perf lever: roughly a 2.7x speedup vs DPR=1.
    const dpr = Math.min(0.6, window.devicePixelRatio || 1);
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
      const { c0, c1, c2, c3, c4 } = colorsRef.current;

      const elapsed = (performance.now() - start) / 1000;

      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.12 : 0.04;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;
      const activeTarget = target.active ? 1 : 0;
      pointerActiveRef.current +=
        (activeTarget - pointerActiveRef.current) *
        (target.active ? 0.16 : 0.05);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.speed, Math.max(0, p.speed));
      gl.uniform1f(loc.scale, Math.max(0.2, p.scale));
      gl.uniform1f(loc.warp, Math.max(0, Math.min(3, p.warp)));
      gl.uniform1f(loc.relief, Math.max(0.1, Math.min(4, p.relief)));
      gl.uniform1f(loc.tilt, p.tilt);
      gl.uniform1f(loc.highlight, Math.max(0, Math.min(3, p.highlight)));
      gl.uniform1f(loc.roughness, Math.max(0, Math.min(1, p.roughness)));
      gl.uniform1f(loc.ambient, Math.max(0, Math.min(1, p.ambient)));
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1i(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(
        loc.mouseInfluence,
        p.mouseInfluence * pointerActiveRef.current,
      );
      gl.uniform3f(loc.c0, c0[0], c0[1], c0[2]);
      gl.uniform3f(loc.c1, c1[0], c1[1], c1[2]);
      gl.uniform3f(loc.c2, c2[0], c2[1], c2[2]);
      gl.uniform3f(loc.c3, c3[0], c3[1], c3[2]);
      gl.uniform3f(loc.c4, c4[0], c4[1], c4[2]);

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

  // Reduced-motion fallback — a static dual-source radial gradient layered
  // over the dark base so the surface still reads as inky with two
  // coloured lights catching it.
  const fallbackSpec = PALETTES[palette] ?? PALETTES.nightfire;
  const customStops = colors && colors.length >= 5 ? colors : null;
  const s0 = customStops ? customStops[0] : rgbToCss(fallbackSpec.c0);
  const s2 = customStops ? customStops[2] : rgbToCss(fallbackSpec.c2);
  const s3 = customStops ? customStops[3] : rgbToCss(fallbackSpec.c3);
  const fallbackBg = `radial-gradient(ellipse 50% 60% at 28% 32%, ${s2} 0%, transparent 55%), radial-gradient(ellipse 55% 70% at 78% 52%, ${s3} 0%, transparent 55%), ${s0}`;

  const rootStyle: CSSProperties = {
    background: reduced ? fallbackBg : rgbToCss(fallbackSpec.c0),
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

LiquidChrome.displayName = "LiquidChrome";
