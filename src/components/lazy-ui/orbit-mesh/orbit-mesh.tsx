"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useReducedMotion } from "motion/react";

export type OrbitMeshEffect =
  | "ripple"
  | "spiral"
  | "vortex"
  | "pulse"
  | "wave"
  | "bloom";

export interface OrbitMeshProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Wave mode swapping the radial pulse formula. @default "spiral" */
  effect?: OrbitMeshEffect;
  /** Animation speed multiplier. @default 0.3 */
  speed?: number;
  /** Zoom of the visible wave field — higher = bigger features, less crammed at center. @default 1.2 */
  scale?: number;
  /** Number of chromatic channel iterations (1–6). Each layer adds an
   *  RGB / CMY-flavoured ghost so higher = richer color separation. @default 3 */
  colorLayers?: number;
  /** Number of arms in `spiral` / `vortex` / `pulse` / `bloom`. @default 3 */
  spiralArms?: number;
  /** Radial displacement intensity. @default 0.18 */
  waveIntensity?: number;
  /** Spiral / rotation effect intensity. @default 0.6 */
  spiralIntensity?: number;
  /** Streak thickness — the `lineThickness / length(gridCell)` numerator. @default 0.06 */
  lineThickness?: number;
  /** Distance falloff factor. Lower = brighter edges. @default 0.5 */
  falloff?: number;
  /** Overall brightness multiplier. @default 1.5 */
  brightness?: number;
  /** Primary color tint (hex). @default "#c084fc" */
  colorTint?: string;
  /** Background fill (hex). @default "#000000" */
  background?: string;
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader — references SquircleShift's vocabulary (radial pulse +
// spiral offset + chromatic layers + 1/length stars) but with three concrete
// differences:
//
//   1. `u_effect` swaps the radial pulse between four wave modes shared with
//      Orbit Cipher / Orbit Bloom (ripple / spiral / vortex / pulse).
//   2. No high-frequency XY grid modulation — the lattice rides on the smooth
//      radial wave, giving long streaks instead of a tight star field.
//   3. The centered coordinate system is rotated by a small constant so the
//      `atan` seam (along the −x axis) doesn't land on the canvas horizontal
//      and create the visible "scar" the centered-default suffers from.
//
// Up to six chromatic layers can be requested; each layer uses a different
// channel mask (RGB then CMY) so higher `colorLayers` reads as richer fringes.
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform int u_effect;
uniform float u_speed;
uniform float u_scale;
uniform int u_colorLayers;
uniform float u_spiralArms;
uniform float u_waveIntensity;
uniform float u_spiralIntensity;
uniform float u_lineThickness;
uniform float u_falloff;
uniform vec3 u_colorTint;
uniform vec3 u_backgroundColor;
uniform float u_brightness;

in vec2 v_uv;
out vec4 fragColor;

const float SEAM_ROTATION = 0.6;

float radialPulse(int effect, vec2 cp, float dist, float theta, float depth, float arms) {
  if (effect == 0) {
    // ripple — concentric rings, no theta term.
    return abs(sin(dist * 7.0 - depth));
  } else if (effect == 2) {
    // vortex — log-radius winds arms tightly at the center, counter-rotates.
    return abs(sin(-theta * arms + log(max(dist, 0.02)) * 5.0 + depth));
  } else if (effect == 3) {
    // pulse — radial pulses modulated by angular petals.
    return abs(sin(dist * 6.0 - depth * 2.0 + cos(theta * max(1.0, arms)) * 0.6));
  } else if (effect == 4) {
    // wave — non-radial horizontal sweep with vertical angular modulation;
    // gives a "scanning" feel instead of concentric/spiral motion.
    return abs(sin(cp.x * 7.0 + depth * 1.5 + sin(cp.y * 5.0 + depth * 0.7) * 1.2));
  } else if (effect == 5) {
    // bloom — burst that grows then resets, modulated by arm count so the
    // expansion fans out into petals.
    float burst = mod(depth * 0.4, 2.4);
    return abs(sin(dist * (2.0 + burst * 4.5) - depth + theta * arms * 0.4));
  }
  // spiral (default) — arms unfurl with a slow breathing harmonic so the
  // streaks feel alive rather than static.
  return abs(
    sin(
      theta * arms + dist * 5.0 - depth +
      sin(depth * 0.4 + dist * 2.2) * 0.55
    )
  );
}

vec2 rot2(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// Channel mask for the per-layer chromatic split — RGB for layers 0..2, CMY
// for 3..5. Each is normalized so summing them recovers the tint at overlap.
vec3 channelMask(int layer) {
  if (layer == 0) return vec3(1.0, 0.0, 0.0);
  if (layer == 1) return vec3(0.0, 1.0, 0.0);
  if (layer == 2) return vec3(0.0, 0.0, 1.0);
  if (layer == 3) return vec3(0.5, 0.5, 0.0);
  if (layer == 4) return vec3(0.0, 0.5, 0.5);
  return vec3(0.5, 0.0, 0.5);
}

void main() {
  float animTime = u_time * u_speed;

  // Aspect-corrected centered position, rotated by SEAM_ROTATION so the atan
  // discontinuity isn't aligned with the canvas horizontal. Dividing by scale
  // zooms in on the wave field — higher scale = bigger visible features.
  float zoom = max(0.05, u_scale);
  vec2 centeredPos = v_uv - 0.5;
  centeredPos.x *= u_resolution.x / u_resolution.y;
  centeredPos = rot2(centeredPos, SEAM_ROTATION);
  centeredPos /= zoom;

  float dist = length(centeredPos);
  float theta = atan(centeredPos.y, centeredPos.x);

  vec3 colorAccum = vec3(0.0);
  float depth = animTime;
  int layerCount = clamp(u_colorLayers, 1, 6);

  for (int layer = 0; layer < 6; layer++) {
    if (layer >= layerCount) break;

    depth += 0.05;

    // Smooth radial pulse from the selected effect mode.
    float pulse = radialPulse(u_effect, centeredPos, dist, theta, depth, u_spiralArms);
    float oscillation = sin(depth) + 1.0;
    float wave = oscillation * pulse * u_waveIntensity;

    // Tangent direction at this pixel (perpendicular to the radial ray).
    vec2 tangent = vec2(-sin(theta), cos(theta));

    // Lattice rides in UV space. The radial push and spiral twist together
    // do all the displacement — no grid-pattern gating, so we get long
    // streaks instead of a tight star field.
    vec2 normalizedPos = v_uv;
    normalizedPos += (centeredPos / max(dist, 0.001)) * wave;
    normalizedPos += tangent * pulse * u_spiralIntensity * (0.5 + 0.5 * dist);

    // Per-layer angular twist so the chromatic ghosts fan radially.
    normalizedPos = rot2(normalizedPos - 0.5, float(layer) * 0.04) + 0.5;

    vec2 gridCell = fract(normalizedPos) - 0.5;
    float intensity = u_lineThickness / length(gridCell);

    colorAccum += channelMask(layer) * intensity;
  }

  colorAccum /= (dist + u_falloff);

  // High spiral intensity pulls every chromatic layer back to the origin and
  // piles them into a hard bright dot. Carve a soft "hole" at the center
  // proportional to spiralIntensity so the streaks fade in smoothly instead.
  float centerHole = smoothstep(0.0, 0.18 * u_spiralIntensity, dist);
  colorAccum *= centerHole;

  colorAccum *= u_brightness;
  vec3 tintedColor = colorAccum * u_colorTint;

  float alpha = clamp(length(colorAccum) * 0.5, 0.0, 1.0);
  vec3 finalColor = mix(u_backgroundColor, tintedColor, alpha);

  fragColor = vec4(finalColor, 1.0);
}
`;

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string, fallback: Rgb): Rgb {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return fallback;
  return {
    r: parseInt(m[1], 16) / 255,
    g: parseInt(m[2], 16) / 255,
    b: parseInt(m[3], 16) / 255,
  };
}

function effectToInt(e: OrbitMeshEffect): number {
  switch (e) {
    case "ripple":
      return 0;
    case "vortex":
      return 2;
    case "pulse":
      return 3;
    case "wave":
      return 4;
    case "bloom":
      return 5;
    case "spiral":
    default:
      return 1;
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
    console.error("OrbitMesh shader compile error:", gl.getShaderInfoLog(shader));
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
    console.error("OrbitMesh program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function OrbitMesh({
  effect = "spiral",
  speed = 0.3,
  scale = 1.2,
  colorLayers = 3,
  spiralArms = 3,
  waveIntensity = 0.18,
  spiralIntensity = 0.6,
  lineThickness = 0.06,
  falloff = 0.5,
  brightness = 1.5,
  colorTint = "#c084fc",
  background = "#000000",
  className,
  style,
  ...rest
}: OrbitMeshProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paramsRef = useRef({
    effect,
    speed,
    scale,
    colorLayers,
    spiralArms,
    waveIntensity,
    spiralIntensity,
    lineThickness,
    falloff,
    brightness,
    colorTint,
    background,
  });
  useEffect(() => {
    paramsRef.current = {
      effect,
      speed,
      scale,
      colorLayers,
      spiralArms,
      waveIntensity,
      spiralIntensity,
      lineThickness,
      falloff,
      brightness,
      colorTint,
      background,
    };
  }, [
    effect,
    speed,
    scale,
    colorLayers,
    spiralArms,
    waveIntensity,
    spiralIntensity,
    lineThickness,
    falloff,
    brightness,
    colorTint,
    background,
  ]);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn("OrbitMesh: WebGL2 not available — effect disabled.");
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = linkProgram(gl, vs, fs);
    if (!program) return;
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
      effect: gl.getUniformLocation(program, "u_effect"),
      speed: gl.getUniformLocation(program, "u_speed"),
      scale: gl.getUniformLocation(program, "u_scale"),
      colorLayers: gl.getUniformLocation(program, "u_colorLayers"),
      spiralArms: gl.getUniformLocation(program, "u_spiralArms"),
      waveIntensity: gl.getUniformLocation(program, "u_waveIntensity"),
      spiralIntensity: gl.getUniformLocation(program, "u_spiralIntensity"),
      lineThickness: gl.getUniformLocation(program, "u_lineThickness"),
      falloff: gl.getUniformLocation(program, "u_falloff"),
      colorTint: gl.getUniformLocation(program, "u_colorTint"),
      backgroundColor: gl.getUniformLocation(program, "u_backgroundColor"),
      brightness: gl.getUniformLocation(program, "u_brightness"),
    };

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const startTime = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const tick = () => {
      const p = paramsRef.current;
      const elapsed = (performance.now() - startTime) / 1000;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      const tint = parseHex(p.colorTint, { r: 0.75, g: 0.52, b: 0.99 });
      const bg = parseHex(p.background, { r: 0, g: 0, b: 0 });

      gl.uniform1f(loc.time, elapsed);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1i(loc.effect, effectToInt(p.effect));
      gl.uniform1f(loc.speed, p.speed);
      gl.uniform1f(loc.scale, p.scale);
      gl.uniform1i(
        loc.colorLayers,
        Math.max(1, Math.min(6, Math.round(p.colorLayers))),
      );
      gl.uniform1f(loc.spiralArms, p.spiralArms);
      gl.uniform1f(loc.waveIntensity, p.waveIntensity);
      gl.uniform1f(loc.spiralIntensity, p.spiralIntensity);
      gl.uniform1f(loc.lineThickness, p.lineThickness);
      gl.uniform1f(loc.falloff, p.falloff);
      gl.uniform3f(loc.colorTint, tint.r, tint.g, tint.b);
      gl.uniform3f(loc.backgroundColor, bg.r, bg.g, bg.b);
      gl.uniform1f(loc.brightness, p.brightness);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteVertexArray(vao);
    };
  }, [reduced]);

  const rootStyle: CSSProperties = {
    pointerEvents: "none",
    background,
    ...style,
  };

  const rootClass = `absolute inset-0 overflow-hidden ${className ?? ""}`;

  if (reduced) {
    return <div ref={containerRef} className={rootClass} style={rootStyle} {...rest} />;
  }

  return (
    <div ref={containerRef} className={rootClass} style={rootStyle} {...rest}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

OrbitMesh.displayName = "OrbitMesh";
