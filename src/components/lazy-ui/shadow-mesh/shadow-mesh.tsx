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

export interface ShadowMeshProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the plume. Wrapped in `relative z-10`. */
  children?: ReactNode;
  /** Fill color of the plume mass. @default "#0a0a0a" */
  color?: string;
  /** Background fill drawn behind the plume. Pass `"transparent"` to let the parent show through. @default "transparent" */
  backgroundColor?: string;
  /** Plume radius in UV units (0–1). Roughly how much of the smaller axis the mass occupies before feathering. @default 0.55 */
  scale?: number;
  /** Drift + turbulence speed multiplier. `0` freezes the field. @default 0.3 */
  speed?: number;
  /** Edge softness (0–1). Higher values dissolve the outer edge over a longer falloff. @default 0.45 */
  feather?: number;
  /** How much FBM noise warps the plume's radius (0–1). `0` is a clean circle. @default 0.3 */
  turbulence?: number;
  /** Plume center smoothly tracks the cursor while it's over the canvas. @default true */
  mouseFollow?: boolean;
  /** Pointer pull strength (0–1). Higher = the plume snaps to the cursor; lower = lags behind. @default 0.6 */
  mouseInfluence?: number;
  /** Film-grain intensity blended over the canvas (0–0.3). @default 0.06 */
  noise?: number;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Three soft radial masses drifting on independent lissajous curves. Each
// contributes Gaussian-falloff mass; the sum is saturated to a single alpha
// channel, so the plumes blend additively and bleed into one another instead
// of reading as separate circles. The FBM warp gives every plume's edge an
// organic, breathing silhouette. `u_useBackground == 0` means the canvas is
// transparent and the fragment output is premultiplied — the plume then
// composites cleanly over whatever sits behind the container.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform vec3 u_color;
uniform vec3 u_background;
uniform int u_useBackground;
uniform float u_scale;
uniform float u_feather;
uniform float u_turbulence;
uniform float u_grain;
uniform vec2 u_mouse;
uniform int u_mouseFollow;
uniform float u_mouseInfluence;

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
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec2 anchorPosition(float t, float phase) {
  // Golden-ratio phase offset keeps the three anchors visually decorrelated
  // even when frequencies are close. Each plume orbits a different region
  // of the central 60% of the canvas.
  float p = phase * 1.61803398875;
  return vec2(
    0.5 + 0.22 * sin(t * (0.41 + phase * 0.08) + p * 1.3),
    0.5 + 0.18 * cos(t * (0.29 + phase * 0.11) + p * 0.7)
  );
}

float plumeMass(vec2 uv, vec2 anchor, float radius, float warp, float aspect) {
  vec2 delta = (uv - anchor) * vec2(aspect, 1.0);
  float d = length(delta) + warp * u_turbulence * radius * 0.55;
  // Reach extends past the nominal radius proportional to feather — high
  // feather lets the plume bleed across a wider zone.
  float reach = radius * (1.0 + u_feather * 1.6);
  float t = d / max(reach, 0.0001);
  // Gaussian-ish: smooth, never hard-edged. exp(-t*t*3) gives roughly 5%
  // at t=1, which composites well when summed across plumes.
  return exp(-t * t * 3.0);
}

void main() {
  float t = u_time * u_speed;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  vec2 a1 = anchorPosition(t, 0.0);
  vec2 a2 = anchorPosition(t, 1.0);
  vec2 a3 = anchorPosition(t, 2.0);

  // Only the primary (biggest) plume tracks the cursor — the others keep
  // their drift so the field still feels alive when the pointer settles.
  if (u_mouseFollow == 1) {
    a1 = mix(a1, u_mouse, clamp(u_mouseInfluence, 0.0, 1.0));
  }

  // Two FBM fields: one warps the plume edge, the other gives the canvas a
  // very faint background haze so the dark mass appears to diffuse outward.
  float warpEdge = fbm(v_uv * 3.0 + vec2(t * 0.2, -t * 0.15)) * 2.0 - 1.0;
  float haze = fbm(v_uv * 1.6 + vec2(-t * 0.08, t * 0.05));

  float m = 0.0;
  m += plumeMass(v_uv, a1, u_scale * 1.00, warpEdge, aspect);
  m += plumeMass(v_uv, a2, u_scale * 0.78, warpEdge, aspect) * 0.9;
  m += plumeMass(v_uv, a3, u_scale * 0.60, warpEdge, aspect) * 0.8;

  // Subtle background haze adds a wash of the plume color across the whole
  // surface — without it the plumes feel like isolated blobs. Modulated by
  // feather so users can dial it back to a clean blob look.
  m += haze * 0.14 * u_feather;

  // Saturate to a single alpha. exp(-m * k) gives a smooth approach to 1
  // without clipping the highlights.
  float a = 1.0 - exp(-m * 1.3);
  a = clamp(a, 0.0, 1.0);

  vec3 col = u_color;
  if (u_grain > 0.0) {
    float n = hash21(gl_FragCoord.xy + t * 60.0) - 0.5;
    col += n * u_grain;
  }

  if (u_useBackground == 1) {
    fragColor = vec4(mix(u_background, col, a), 1.0);
  } else {
    fragColor = vec4(col * a, a);
  }
}
`;

type Rgb = [number, number, number];

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

function isTransparent(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return trimmed === "transparent" || trimmed === "none";
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
    console.error("ShadowMesh compile error:", gl.getShaderInfoLog(shader));
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
    console.error("ShadowMesh link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function ShadowMesh({
  children,
  color = "#0a0a0a",
  backgroundColor = "transparent",
  scale = 0.55,
  speed = 0.3,
  feather = 0.45,
  turbulence = 0.3,
  mouseFollow = true,
  mouseInfluence = 0.6,
  noise = 0.06,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...rest
}: ShadowMeshProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live prop ref so the RAF tick reads the latest values without the
  // effect tearing down and recreating GL state on every prop change.
  const paramsRef = useRef({
    color,
    backgroundColor,
    scale,
    speed,
    feather,
    turbulence,
    mouseFollow,
    mouseInfluence,
    noise,
  });
  useEffect(() => {
    paramsRef.current = {
      color,
      backgroundColor,
      scale,
      speed,
      feather,
      turbulence,
      mouseFollow,
      mouseInfluence,
      noise,
    };
  }, [
    color,
    backgroundColor,
    scale,
    speed,
    feather,
    turbulence,
    mouseFollow,
    mouseInfluence,
    noise,
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
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn("ShadowMesh: WebGL2 unavailable — static fallback shown.");
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
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      speed: gl.getUniformLocation(program, "u_speed"),
      color: gl.getUniformLocation(program, "u_color"),
      background: gl.getUniformLocation(program, "u_background"),
      useBackground: gl.getUniformLocation(program, "u_useBackground"),
      scale: gl.getUniformLocation(program, "u_scale"),
      feather: gl.getUniformLocation(program, "u_feather"),
      turbulence: gl.getUniformLocation(program, "u_turbulence"),
      grain: gl.getUniformLocation(program, "u_grain"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const tick = () => {
      const p = paramsRef.current;
      const elapsed = (performance.now() - start) / 1000;

      const [cr, cg, cb] = parseColor(p.color, [0.04, 0.04, 0.04]);
      const [br, bg2, bb] = parseColor(p.backgroundColor, [0, 0, 0]);
      const transparent = isTransparent(p.backgroundColor);

      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.12 : 0.04;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.speed, p.speed);
      gl.uniform3f(loc.color, cr, cg, cb);
      gl.uniform3f(loc.background, br, bg2, bb);
      gl.uniform1i(loc.useBackground, transparent ? 0 : 1);
      gl.uniform1f(loc.scale, Math.max(0.05, Math.min(0.95, p.scale)));
      gl.uniform1f(loc.feather, Math.max(0.02, Math.min(0.98, p.feather)));
      gl.uniform1f(loc.turbulence, Math.max(0, Math.min(1, p.turbulence)));
      gl.uniform1f(loc.grain, Math.max(0, Math.min(0.3, p.noise)));
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1i(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(loc.mouseInfluence, p.mouseInfluence);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
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

  // Reduced-motion fallback — show the static background fill plus a soft
  // radial silhouette of the plume so the surface isn't blank.
  const fallbackBg = isTransparent(backgroundColor)
    ? `radial-gradient(ellipse at 50% 50%, ${color} 0%, transparent ${Math.round(
        Math.max(0.05, Math.min(0.95, scale)) * 70,
      )}%)`
    : `radial-gradient(ellipse at 50% 50%, ${color} 0%, ${backgroundColor} ${Math.round(
        Math.max(0.05, Math.min(0.95, scale)) * 70,
      )}%)`;

  const rootStyle: CSSProperties = {
    background: reduced ? fallbackBg : undefined,
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
      <div className="relative z-10">{children}</div>
    </div>
  );
}

ShadowMesh.displayName = "ShadowMesh";
