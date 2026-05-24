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

export interface AuroraMeshProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered over the gradient. */
  children?: ReactNode;
  /** Gradient anchor colors. 2–8 entries; positions drift independently. @default monochrome silver palette */
  colors?: string[];
  /** Animation speed multiplier. @default 0.3 */
  speed?: number;
  /** Solid fill drawn behind the mesh — fallback for reduced-motion and the first paint. @default first color */
  backgroundColor?: string;
  /** Add a contour-banded layer for extra texture on top of the gradient. @default false */
  wireframe?: boolean;
  /** Wireframe overlay opacity (0–1). @default 0.45 */
  wireframeOpacity?: number;
  /** Subtle film grain blended over the gradient. @default 0.06 */
  grain?: number;
  /** Last anchor smoothly tracks the cursor while it's over the background. @default true */
  mouseFollow?: boolean;
  /** Pointer pull strength (0–1). Higher = the followed anchor snaps to the cursor; lower = lags behind smoothly. @default 0.6 */
  mouseInfluence?: number;
  /** Click anywhere on the background to emit a temporary ripple that warps the mesh. @default true */
  ripple?: boolean;
  /** Ripple displacement amplitude in UV units. @default 0.06 */
  rippleStrength?: number;
}

const DEFAULT_COLORS = [
  "#050505",
  "#161616",
  "#525252",
  "#a3a3a3",
  "#f8f8f8",
];

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Up to 8 floating color anchors blended via inverse-distance weighting
// (Shepard interpolation). Each anchor drifts on its own lissajous; when
// `u_mouseFollow == 1`, the last anchor is lerped toward the cursor so the
// brightest color "lives" near the pointer.
//
// `u_ripple = (x, y, age, strength)` defines a single active ripple. The age
// counts up in seconds from the click; `rippleOffset` returns a radial UV
// displacement that decays to zero over ~1.4s.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define MAX_COLORS 8

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform vec3 u_colors[MAX_COLORS];
uniform int u_colorCount;
uniform vec3 u_background;
uniform int u_wireframe;
uniform float u_grain;
uniform vec2 u_mouse;
uniform int u_mouseFollow;
uniform float u_mouseInfluence;
uniform vec4 u_ripple;

in vec2 v_uv;
out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 anchorPosition(int i, float t) {
  float fi = float(i);
  float phase = fi * 1.61803398875;
  float fx = 0.45 + fi * 0.07;
  float fy = 0.38 + fi * 0.09;
  return vec2(
    0.5 + 0.42 * sin(t * fx + phase * 1.3),
    0.5 + 0.42 * cos(t * fy + phase * 0.7)
  );
}

// Expanding ring centered on the click. The wavefront starts at a small
// non-zero radius so the click point itself stays calm — without that the
// band collapses to a single pixel at age 0 and reads as a hard spike. A
// soft center suppression rejects any leftover energy inside the ring as
// it grows, keeping the area under the cursor mirror-smooth.
vec2 rippleOffset(vec2 uv) {
  if (u_ripple.w <= 0.0) return vec2(0.0);
  float age = u_ripple.z;
  if (age < 0.0 || age > 1.4) return vec2(0.0);
  vec2 from = uv - u_ripple.xy;
  float d = length(from);

  float wavefront = 0.05 + age * 0.85;
  float band = exp(-pow((d - wavefront) * 8.0, 2.0));
  float centerHole = smoothstep(0.0, 0.05, d);
  float decay = 1.0 - smoothstep(0.0, 1.4, age);
  float push = band * centerHole * decay * u_ripple.w;
  return normalize(from + 0.0001) * push;
}

vec3 meshGradient(vec2 uv, float t) {
  vec3 sumColor = vec3(0.0);
  float sumWeight = 0.0;
  int count = clamp(u_colorCount, 2, MAX_COLORS);
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  for (int i = 0; i < MAX_COLORS; i++) {
    if (i >= count) break;
    vec2 a = anchorPosition(i, t);

    // Pull the last anchor toward the cursor when mouse-follow is on. Only
    // the last (typically brightest) anchor moves so the rest of the field
    // keeps its slow, organic drift.
    if (u_mouseFollow == 1 && i == count - 1) {
      a = mix(a, u_mouse, clamp(u_mouseInfluence, 0.0, 1.0));
    }

    vec2 delta = (uv - a) * vec2(aspect, 1.0);
    float d2 = dot(delta, delta) + 0.0025;
    float w = 1.0 / (d2 * d2);
    sumColor += u_colors[i] * w;
    sumWeight += w;
  }
  return sumColor / max(sumWeight, 0.0001);
}

void main() {
  float t = u_time * u_speed;
  vec2 uv = v_uv + rippleOffset(v_uv);
  vec3 col = meshGradient(uv, t);

  if (u_wireframe == 1) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float bands = abs(fract(lum * 6.0 - t * 0.2) - 0.5) * 2.0;
    float lines = smoothstep(0.0, 0.08, 1.0 - bands);
    col = mix(col, col * (1.0 - lines), 0.55);
  }

  if (u_grain > 0.0) {
    float n = hash21(gl_FragCoord.xy + t * 60.0) - 0.5;
    col += n * u_grain;
  }

  col = mix(u_background, col, 0.985);
  fragColor = vec4(col, 1.0);
}
`;

type Rgb = [number, number, number];

function parseHex(hex: string, fallback: Rgb): Rgb {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return fallback;
  return [
    parseInt(m[1], 16) / 255,
    parseInt(m[2], 16) / 255,
    parseInt(m[3], 16) / 255,
  ];
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
    console.error("AuroraMesh compile error:", gl.getShaderInfoLog(shader));
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
    console.error("AuroraMesh link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function AuroraMesh({
  children,
  colors = DEFAULT_COLORS,
  speed = 0.3,
  backgroundColor,
  wireframe = false,
  wireframeOpacity = 0.45,
  grain = 0.06,
  mouseFollow = true,
  mouseInfluence = 0.6,
  ripple = true,
  rippleStrength = 0.06,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  ...rest
}: AuroraMeshProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    colors,
    speed,
    backgroundColor,
    wireframe,
    grain,
    mouseFollow,
    mouseInfluence,
    ripple,
    rippleStrength,
  });
  useEffect(() => {
    paramsRef.current = {
      colors,
      speed,
      backgroundColor,
      wireframe,
      grain,
      mouseFollow,
      mouseInfluence,
      ripple,
      rippleStrength,
    };
  }, [
    colors,
    speed,
    backgroundColor,
    wireframe,
    grain,
    mouseFollow,
    mouseInfluence,
    ripple,
    rippleStrength,
  ]);

  // Mouse target + smoothed value. We lerp toward target inside the tick so
  // the followed anchor never snaps — feels like the color is following the
  // cursor through honey, not glued to it.
  const mouseTargetRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });
  const mouseSmoothedRef = useRef<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  });

  // Single ripple slot — new clicks replace the oldest. strength = 0 means
  // no ripple is active.
  const rippleRef = useRef<{
    x: number;
    y: number;
    start: number;
    strength: number;
  }>({ x: 0.5, y: 0.5, start: 0, strength: 0 });

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
      console.warn("AuroraMesh: WebGL2 unavailable — static fallback shown.");
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
      colors: gl.getUniformLocation(program, "u_colors[0]"),
      colorCount: gl.getUniformLocation(program, "u_colorCount"),
      background: gl.getUniformLocation(program, "u_background"),
      wireframe: gl.getUniformLocation(program, "u_wireframe"),
      grain: gl.getUniformLocation(program, "u_grain"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mouseFollow: gl.getUniformLocation(program, "u_mouseFollow"),
      mouseInfluence: gl.getUniformLocation(program, "u_mouseInfluence"),
      ripple: gl.getUniformLocation(program, "u_ripple"),
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
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const colorBuffer = new Float32Array(8 * 3);

    const tick = () => {
      const p = paramsRef.current;
      const elapsed = (performance.now() - start) / 1000;
      const count = Math.max(2, Math.min(8, p.colors.length));

      for (let i = 0; i < 8; i++) {
        const src = i < count ? p.colors[i] : p.colors[count - 1];
        const [r, g, b] = parseHex(src, [0, 0, 0]);
        colorBuffer[i * 3] = r;
        colorBuffer[i * 3 + 1] = g;
        colorBuffer[i * 3 + 2] = b;
      }
      const bg = parseHex(
        p.backgroundColor ?? p.colors[0] ?? "#000000",
        [0, 0, 0],
      );

      // Smooth the cursor toward target. When pointer leaves, target eases
      // back to center instead of snapping.
      const target = mouseTargetRef.current;
      const smoothed = mouseSmoothedRef.current;
      const easeRate = target.active ? 0.12 : 0.04;
      smoothed.x += (target.x - smoothed.x) * easeRate;
      smoothed.y += (target.y - smoothed.y) * easeRate;

      const r = rippleRef.current;
      const rippleAge = (performance.now() - r.start) / 1000;

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.speed, p.speed);
      gl.uniform3fv(loc.colors, colorBuffer);
      gl.uniform1i(loc.colorCount, count);
      gl.uniform3f(loc.background, bg[0], bg[1], bg[2]);
      gl.uniform1i(loc.wireframe, p.wireframe ? 1 : 0);
      gl.uniform1f(loc.grain, Math.max(0, Math.min(0.3, p.grain)));
      gl.uniform2f(loc.mouse, smoothed.x, smoothed.y);
      gl.uniform1i(loc.mouseFollow, p.mouseFollow ? 1 : 0);
      gl.uniform1f(loc.mouseInfluence, p.mouseInfluence);
      gl.uniform4f(
        loc.ripple,
        r.x,
        r.y,
        rippleAge,
        p.ripple ? r.strength : 0,
      );

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

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rippleRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
      start: performance.now(),
      strength: rippleStrength,
    };
    onPointerDown?.(e);
  };

  const fallback =
    backgroundColor ?? colors[Math.floor(colors.length / 2)] ?? "#0a0a0a";

  const rootStyle: CSSProperties = {
    background: fallback,
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

      {wireframe && !reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: Math.max(0, Math.min(1, wireframeOpacity)),
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 18px)",
            maskImage:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0) 70%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0) 70%)",
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

AuroraMesh.displayName = "AuroraMesh";
