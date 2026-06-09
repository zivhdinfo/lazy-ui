"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

export type RippleSurfacePalette =
  | "pearl"
  | "bone"
  | "linen"
  | "silver"
  | "mist"
  | "ocean"
  | "graphite"
  | "obsidian";

export type RippleSurfaceEffect = "outward" | "inward" | "breathe" | "drift";

export interface RippleSurfaceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the canvas. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Color preset. @default "pearl" */
  palette?: RippleSurfacePalette;
  /** Custom palette `[surface, highlight, shadow]`. Overrides `palette`. */
  colors?: [string, string, string];
  /** Animation pattern. @default "outward" */
  effect?: RippleSurfaceEffect;
  /** Animation speed multiplier. `0` freezes the surface. @default 1 */
  speed?: number;
  /** Number of visible ring crests across the radius. @default 9 */
  rings?: number;
  /** Ridge sharpness (0.2–4). Higher = thinner, more defined ridges. @default 1 */
  sharpness?: number;
  /** Shading contrast — how strong the highlight/shadow on each ridge reads. @default 1 */
  depth?: number;
  /** Light direction in degrees. 0 = right, 90 = down, 315 = top-right. @default 315 */
  lightAngle?: number;
  /** Center brightness lift (0–1). Subtle radial highlight at the center. @default 0.18 */
  centerGlow?: number;
  /** Vignette intensity at the edge (0–1). @default 0.2 */
  vignette?: number;
  /** Horizontal center offset, where `0.5` = middle. @default 0.5 */
  originX?: number;
  /** Vertical center offset, where `0.5` = middle. @default 0.5 */
  originY?: number;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Concentric rings as a height field: h = sin(r * freq * 2π - t). The radial
// gradient direction `p/r` dotted with the light direction gives a per-pixel
// shading term — bright on the slope facing the light, dark on the opposite
// slope. Two refinements over the naive form:
//   • Near the origin, `p/r` flips sign across the center which paints a
//     visible 1-pixel seam through the canvas. We fade the shading to zero
//     over a small disk (`coreFade`) so the seam disappears.
//   • Sharpness uses `tanh` saturation instead of `sign(s)*pow(|s|,1/k)` —
//     tanh is smooth at the zero crossing, so ridges don't pick up kinks
//     when the contrast knob is pushed.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_rings;
uniform float u_sharpness;
uniform float u_depth;
uniform vec2 u_lightDir;
uniform float u_centerGlow;
uniform float u_vignette;
uniform int u_effect;
uniform vec2 u_origin;
uniform float u_lightSpin;
uniform vec3 u_surface;
uniform vec3 u_highlight;
uniform vec3 u_shadow;

in vec2 v_uv;
out vec4 fragColor;

const float TAU = 6.2831853;

void main() {
  // Aspect-correct the UV so rings stay circular regardless of container shape.
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  vec2 p = v_uv - u_origin;
  p.x *= aspect;

  float r = length(p);
  // Soft radius — avoids dividing by ~0 at the origin, where p/r would
  // otherwise snap across the center and stamp a seam down the canvas.
  float softR = sqrt(r * r + 1e-4);
  vec2 dir = p / softR;
  float t = u_time * u_speed;

  // Phase drives the ring travel direction per effect. Breathe and drift keep
  // the rings stationary so the eye reads them as a textured surface rather
  // than a moving wave.
  float phase;
  if (u_effect == 1) {
    phase = r * u_rings * TAU + t * 2.0;          // inward
  } else if (u_effect == 2) {
    phase = r * u_rings * TAU;                    // breathe (stationary)
  } else if (u_effect == 3) {
    phase = r * u_rings * TAU - t * 0.45;         // drift (slow outward)
  } else {
    phase = r * u_rings * TAU - t * 2.0;          // outward (default)
  }

  // Smooth height (no sign/pow kink at the zero crossing). Slope is just
  // cos(phase); the magnitude is absorbed into the shade scale below.
  float dh = cos(phase);

  // Optional slow rotation of the light — only the drift effect spins;
  // otherwise u_lightSpin is zero and the matrix collapses to identity.
  float ca = cos(u_lightSpin);
  float sa = sin(u_lightSpin);
  vec2 L = vec2(
    u_lightDir.x * ca - u_lightDir.y * sa,
    u_lightDir.x * sa + u_lightDir.y * ca
  );

  // Lambert-ish shade — radial direction dotted with light, modulated by
  // slope. coreFade kills the directional contribution inside a tiny disk
  // around the origin so the center reads as a uniform sheen.
  float coreFade = smoothstep(0.0, 0.04, r);
  float shade = dot(dir, L) * dh * coreFade;

  // tanh saturation is smooth across zero — no cusp like sign()*pow().
  // u_sharpness > 1 pushes the curve toward a square wave (crisp ridges),
  // < 1 leaves the surface near-linear (very soft gradient).
  float k = max(0.3, u_sharpness);
  shade = tanh(shade * k * 1.6);

  // Breathe pulses the shading magnitude — felt as the surface inhaling
  // under a fixed light, rings staying put.
  float pulse = u_effect == 2 ? (0.55 + 0.45 * sin(t * 1.4)) : 1.0;
  shade *= u_depth * pulse;

  vec3 col = u_surface;
  col = mix(col, u_highlight, clamp( shade, 0.0, 1.0));
  col = mix(col, u_shadow,    clamp(-shade, 0.0, 1.0));

  // Center sheen — broad soft Gaussian centered on the origin. Together with
  // coreFade above, this gives a clean specular pool at the center instead of
  // the directional seam the raw p/r produced.
  float center = exp(-r * r * 5.5);
  col = mix(col, u_highlight, center * u_centerGlow);

  // Edge vignette — eased toward the shadow tint near the far corners.
  float vig = smoothstep(0.6, 1.25, r);
  col = mix(col, u_shadow, vig * u_vignette);

  fragColor = vec4(col, 1.0);
}
`;

type Rgb = [number, number, number];

interface PaletteSpec {
  surface: Rgb;
  highlight: Rgb;
  shadow: Rgb;
}

const PALETTES: Record<RippleSurfacePalette, PaletteSpec> = {
  // The reference image — cool, near-white with a faint blue cast.
  pearl: {
    surface: [0.945, 0.953, 0.965],
    highlight: [1.0, 1.0, 1.0],
    shadow: [0.78, 0.81, 0.86],
  },
  // Warm cream — same value range, shifted toward yellow.
  bone: {
    surface: [0.953, 0.929, 0.886],
    highlight: [1.0, 0.984, 0.945],
    shadow: [0.81, 0.78, 0.71],
  },
  // Soft pink-warm linen.
  linen: {
    surface: [0.965, 0.929, 0.918],
    highlight: [1.0, 0.969, 0.953],
    shadow: [0.847, 0.78, 0.745],
  },
  // Neutral cool silver.
  silver: {
    surface: [0.867, 0.882, 0.902],
    highlight: [1.0, 1.0, 1.0],
    shadow: [0.62, 0.643, 0.69],
  },
  // Pale icy blue.
  mist: {
    surface: [0.91, 0.937, 0.957],
    highlight: [0.972, 0.984, 1.0],
    shadow: [0.725, 0.776, 0.835],
  },
  // Deeper aqua tint — still high-key.
  ocean: {
    surface: [0.835, 0.875, 0.918],
    highlight: [0.945, 0.965, 1.0],
    shadow: [0.545, 0.62, 0.722],
  },
  // Dark mode — soft graphite ripples.
  graphite: {
    surface: [0.118, 0.125, 0.141],
    highlight: [0.235, 0.243, 0.275],
    shadow: [0.04, 0.043, 0.055],
  },
  // Near-black obsidian — strongest contrast on dark.
  obsidian: {
    surface: [0.055, 0.059, 0.067],
    highlight: [0.176, 0.184, 0.204],
    shadow: [0.0, 0.0, 0.0],
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
    console.error("RippleSurface compile error:", gl.getShaderInfoLog(shader));
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
    console.error("RippleSurface link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function RippleSurface({
  children,
  palette = "pearl",
  colors,
  effect = "outward",
  speed = 1,
  rings = 9,
  sharpness = 1,
  depth = 1,
  lightAngle = 315,
  centerGlow = 0.18,
  vignette = 0.2,
  originX = 0.5,
  originY = 0.5,
  className,
  style,
  ...rest
}: RippleSurfaceProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Latest-prop ref — read inside the render loop so prop changes apply
  // without tearing down the WebGL context on every frame.
  const paramsRef = useRef({
    palette,
    colors,
    effect,
    speed,
    rings,
    sharpness,
    depth,
    lightAngle,
    centerGlow,
    vignette,
    originX,
    originY,
  });
  useEffect(() => {
    paramsRef.current = {
      palette,
      colors,
      effect,
      speed,
      rings,
      sharpness,
      depth,
      lightAngle,
      centerGlow,
      vignette,
      originX,
      originY,
    };
  }, [
    palette,
    colors,
    effect,
    speed,
    rings,
    sharpness,
    depth,
    lightAngle,
    centerGlow,
    vignette,
    originX,
    originY,
  ]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      // Discrete-GPU laptops shouldn't fire up the gaming card for a soft
      // monochrome ripple — let the integrated GPU handle it.
      powerPreference: "low-power",
    } as WebGLContextAttributes) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn(
        "RippleSurface: WebGL2 unavailable — static fallback shown.",
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
      rings: gl.getUniformLocation(program, "u_rings"),
      sharpness: gl.getUniformLocation(program, "u_sharpness"),
      depth: gl.getUniformLocation(program, "u_depth"),
      lightDir: gl.getUniformLocation(program, "u_lightDir"),
      centerGlow: gl.getUniformLocation(program, "u_centerGlow"),
      vignette: gl.getUniformLocation(program, "u_vignette"),
      effect: gl.getUniformLocation(program, "u_effect"),
      origin: gl.getUniformLocation(program, "u_origin"),
      lightSpin: gl.getUniformLocation(program, "u_lightSpin"),
      surface: gl.getUniformLocation(program, "u_surface"),
      highlight: gl.getUniformLocation(program, "u_highlight"),
      shadow: gl.getUniformLocation(program, "u_shadow"),
    };

    // The ring field is soft — no high-frequency detail benefits from DPR > 1.
    // Capping at 1 halves the fragment cost on retina with no visible loss.
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

    // Pause the render loop when off-screen or on a hidden tab — keeps the
    // GPU idle when the user isn't looking.
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
      const spec = PALETTES[p.palette] ?? PALETTES.pearl;
      const custom = p.colors && p.colors.length >= 3 ? p.colors : null;
      const surface = custom
        ? parseColor(custom[0], spec.surface)
        : spec.surface;
      const highlight = custom
        ? parseColor(custom[1], spec.highlight)
        : spec.highlight;
      const shadow = custom ? parseColor(custom[2], spec.shadow) : spec.shadow;

      const elapsed = (performance.now() - start) / 1000;

      const lightRad = (p.lightAngle * Math.PI) / 180;
      const lightSpin =
        p.effect === "drift" ? elapsed * p.speed * 0.25 : 0;

      const effectIdx =
        p.effect === "inward"
          ? 1
          : p.effect === "breathe"
            ? 2
            : p.effect === "drift"
              ? 3
              : 0;

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.speed, Math.max(0, p.speed));
      gl.uniform1f(loc.rings, Math.max(1, p.rings));
      gl.uniform1f(loc.sharpness, Math.max(0.2, Math.min(4, p.sharpness)));
      gl.uniform1f(loc.depth, Math.max(0, Math.min(3, p.depth)));
      gl.uniform2f(loc.lightDir, Math.cos(lightRad), Math.sin(lightRad));
      gl.uniform1f(loc.centerGlow, Math.max(0, Math.min(1, p.centerGlow)));
      gl.uniform1f(loc.vignette, Math.max(0, Math.min(1, p.vignette)));
      gl.uniform1i(loc.effect, effectIdx);
      gl.uniform2f(loc.origin, p.originX, p.originY);
      gl.uniform1f(loc.lightSpin, lightSpin);
      gl.uniform3f(loc.surface, surface[0], surface[1], surface[2]);
      gl.uniform3f(loc.highlight, highlight[0], highlight[1], highlight[2]);
      gl.uniform3f(loc.shadow, shadow[0], shadow[1], shadow[2]);

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
      // Unbind before deleting — some drivers leak VRAM if buffers are still
      // bound to a deleted VAO.
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      // Free the context itself, not just its buffers — a detached canvas
      // keeps its live WebGL context, and browsers cap live contexts (~16)
      // then evict the oldest, so leaking one per navigation eventually janks
      // the whole app. Deferred + isConnected-guarded: a StrictMode/HMR
      // remount reuses this same <canvas>, and a lost context can't be
      // re-acquired on the same element — so only release it on a real unmount.
      setTimeout(() => {
        if (!canvas.isConnected)
          gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    };
  }, [reduced]);

  // Reduced-motion fallback — a static radial gradient matching the palette
  // so the surface still reads as a soft, layered field with no animation.
  const fallbackSpec = PALETTES[palette] ?? PALETTES.pearl;
  const customStops = colors && colors.length >= 3 ? colors : null;
  const surfaceCss = customStops ? customStops[0] : rgbToCss(fallbackSpec.surface);
  const highlightCss = customStops
    ? customStops[1]
    : rgbToCss(fallbackSpec.highlight);
  const shadowCss = customStops ? customStops[2] : rgbToCss(fallbackSpec.shadow);
  const fallbackBg = `radial-gradient(circle at ${originX * 100}% ${originY * 100}%, ${highlightCss} 0%, ${surfaceCss} 45%, ${shadowCss} 100%)`;

  const rootStyle: CSSProperties = {
    background: reduced ? fallbackBg : surfaceCss,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={rootStyle}
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

RippleSurface.displayName = "RippleSurface";
