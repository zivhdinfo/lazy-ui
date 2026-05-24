"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import * as THREE from "three";

export type BlingTransitionDirection =
  | "noise"
  | "horizontal"
  | "vertical"
  | "radial";

export type BlingPalette = "iris" | "ember" | "ice" | "silver";

export interface BlingTransitionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  /** First image — shown at progress 0. */
  imageA: string;
  /** Second image — revealed at progress 1. */
  imageB: string;
  /** Controlled progress 0..1. When provided, internal autoplay is disabled. */
  progress?: number;
  /** Animate progress automatically. Ignored when `progress` is set. @default true */
  autoPlay?: boolean;
  /** Full A → B sweep, in milliseconds. @default 4200 */
  duration?: number;
  /** Pause at each end of the sweep when looping, in milliseconds. @default 1800 */
  hold?: number;
  /** Ping-pong forever. When false, stops at B after the first sweep. @default true */
  loop?: boolean;
  /** Color palette preset for the sparkle bloom. @default "iris" */
  palette?: BlingPalette;
  /** Anamorphic star size (≈ 0.001–0.02). Higher = larger, hotter sparkles. @default 0.005 */
  intensity?: number;
  /** Glitter richness (1–6). More iterations = denser, multi-scale star bursts. @default 4 */
  iterations?: number;
  /** Per-pixel sparkle bloom + star-burst contribution multiplier (0–2). @default 1 */
  sparkleStrength?: number;
  /** UV refraction amplitude at each pixel's flip moment, in UV units. @default 0.08 */
  distortion?: number;
  /** Per-pixel transition window width — how long each pixel takes to flip. @default 0.22 */
  softness?: number;
  /** Scale of the dissolve noise field. Higher = finer-grained dissolve. @default 2.4 */
  noiseScale?: number;
  /** Direction bias (0 = pure noise dissolve, 1 = pure directional dissolve). @default 0.55 */
  drip?: number;
  /** Direction the dissolve sweeps in. @default "noise" */
  direction?: BlingTransitionDirection;
  /** Fired when the forward sweep finishes (or each end when looping). */
  onComplete?: () => void;
  style?: CSSProperties;
}

const VS = /* glsl */ `
precision highp float;
attribute vec3 position;
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position, 1.0);
}`;

// Per-pixel noise dissolve. Every pixel picks its own flip time from a
// jittered noise field; as `t` sweeps it crosses each pixel's flip time
// independently. The transition is intentionally scattered — there is no
// coherent boundary line, so there is no place a "dark stripe" can form
// from averaging two images at mask=0.5.
//
// At each pixel's flip moment a palette-tinted bloom flashes and a refraction
// jitters the UV briefly. On top of the dissolve a multi-scale field of
// anamorphic star bursts pops in sync with the same flip schedule — every
// star has its own flip time so the canvas reads as a wave of bling.
const FS = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D imageA;
uniform sampler2D imageB;
uniform vec2 imageARes;
uniform vec2 imageBRes;
uniform vec2 canvasRes;
uniform float progress;
uniform float time;
uniform float distortion;
uniform float softness;
uniform float noiseScale;
uniform float drip;
uniform int direction;
uniform float intensity;
uniform int iterations;
uniform float sparkleStrength;
uniform vec3 pA;
uniform vec3 pB;
uniform vec3 pC;
uniform vec3 pD;

vec3 palette(float t) {
  return pA + pB * cos(6.28318 * (pC * t + pD));
}

float hash11(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
vec2 hash22(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash11(i);
  float b = hash11(i + vec2(1.0, 0.0));
  float c = hash11(i + vec2(0.0, 1.0));
  float d = hash11(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.02 + 7.13;
    a *= 0.5;
  }
  return v;
}

vec2 cover(vec2 uv, vec2 tr, vec2 cr) {
  vec2 ratio = vec2(
    min((cr.x / cr.y) / (tr.x / tr.y), 1.0),
    min((cr.y / cr.x) / (tr.y / tr.x), 1.0)
  );
  return uv * ratio + (1.0 - ratio) * 0.5;
}

// Anamorphic sparkle — round gaussian core + horizontal/vertical light rays.
float anamorphic(vec2 p, float size) {
  float r2 = dot(p, p);
  float core = exp(-r2 / (size * size));
  float hRay = exp(-p.y * p.y / (size * size * 0.04))
             / (1.0 + (p.x * p.x) / (size * size * 9.0));
  float vRay = exp(-p.x * p.x / (size * size * 0.04))
             / (1.0 + (p.y * p.y) / (size * size * 9.0));
  return core * 1.6 + (hRay + vRay) * 0.55;
}

// Star burst layer — anamorphic stars on a hash-jittered grid. Each star has
// its own flip time and bursts as currentT crosses it.
vec3 starBurst(vec2 p, float cells, float starSize, float density,
               float currentT, float burstWidth, float seed) {
  vec2 grid = p * cells;
  vec2 ci = floor(grid);
  vec2 cf = fract(grid) - 0.5;
  vec3 acc = vec3(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 off = vec2(float(i), float(j));
      vec2 c = ci + off;
      float h = hash11(c + seed);
      if (h < 1.0 - density) continue;
      vec2 jit = (hash22(c + vec2(17.3, 5.1)) - 0.5) * 0.7;
      vec2 q = cf - off - jit;
      float starFlip = hash11(c + vec2(91.7, 23.1));
      float dist = abs(currentT - starFlip) / max(burstWidth, 1e-4);
      float burst = max(0.0, 1.0 - dist);
      burst = burst * burst * (3.0 - 2.0 * burst);
      vec3 tint = palette(h * 0.7 + time * 0.2);
      acc += tint * anamorphic(q, starSize) * burst;
    }
  }
  return acc;
}

void main() {
  // Direction bias for the per-pixel flip-time field.
  float bias;
  if (direction == 1) {
    bias = vUv.x;
  } else if (direction == 2) {
    bias = 1.0 - vUv.y;
  } else if (direction == 3) {
    bias = length(vUv - 0.5) * 1.4142;
  } else {
    bias = 0.5;
  }

  vec2 np = vUv * noiseScale;
  float n = fbm(np);

  // Per-pixel hash jitter, scaled to softness. Even at drip=1 (purely
  // directional), neighbouring pixels get slightly offset flip times so the
  // transition never collapses to a coherent boundary line — that is exactly
  // the line that produced the bright/dark stripe pair in the prior shader.
  float pxJitter = (hash11(floor(vUv * canvasRes)) - 0.5)
                 * max(softness, 0.05) * 1.4;
  float flipTime = mix(n, bias, drip) + pxJitter;

  // Extend t past [0,1] so pixels with extreme flip times still get to
  // flip cleanly inside the progress sweep.
  float t = mix(-softness - 0.1, 1.1 + softness, progress);
  float transitionWidth = max(softness, 0.04) * 1.4;

  // Smootherstep dissolve. Per-pixel — there is no shared boundary.
  float u = clamp(
    (t - flipTime + transitionWidth) / (2.0 * transitionWidth),
    0.0, 1.0
  );
  float dissolve = u * u * u * (u * (u * 6.0 - 15.0) + 10.0);

  // Bloom peaks while the pixel is mid-flip; zero before and after.
  float bloom = 1.0 - abs(u - 0.5) * 2.0;
  bloom = bloom * bloom * (3.0 - 2.0 * bloom);

  // Refraction only at the moment of flip — pulls a brief glittery distortion
  // through each pixel as it transitions, with zero smearing afterwards.
  vec2 dn = vec2(
    fbm(np + vec2(3.7, 1.2)) - 0.5,
    fbm(np + vec2(8.3, 4.5)) - 0.5
  );
  vec2 disp = dn * distortion * bloom;

  vec2 uvA = cover(vUv + disp, imageARes, canvasRes);
  vec2 uvB = cover(vUv + disp, imageBRes, canvasRes);
  vec4 a = texture2D(imageA, uvA);
  vec4 b = texture2D(imageB, uvB);

  vec3 baseColor = mix(a.rgb, b.rgb, dissolve);

  // Per-pixel palette glow at the flip moment — scattered across the whole
  // dissolve front, not concentrated on a line.
  vec3 perPixelGlow = palette(flipTime + time * 0.25) * bloom * 0.6;

  // Multi-scale anamorphic star bursts synced to the dissolve wave. Bursts
  // are tight (narrow window) so individual stars pop and vanish quickly.
  vec2 sUv = vUv;
  sUv.x *= canvasRes.x / max(canvasRes.y, 1.0);
  float layers = clamp(float(iterations), 1.0, 6.0);
  float density = clamp(0.06 + 0.07 * layers, 0.06, 0.5);
  float baseSize = clamp(intensity * 22.0, 0.04, 0.32);
  float bw = max(transitionWidth * 1.1, 0.05);

  vec3 stars = vec3(0.0);
  stars += starBurst(sUv, 8.0,  baseSize * 1.35, density * 0.55, t, bw * 1.4, 1.7);
  stars += starBurst(sUv, 17.0, baseSize * 0.75, density * 0.95, t, bw * 1.2, 13.1) * 0.75;
  if (layers >= 3.0) {
    stars += starBurst(sUv, 38.0, baseSize * 0.42, density * 1.25, t, bw, 27.3) * 0.5;
  }
  if (layers >= 5.0) {
    stars += starBurst(sUv, 78.0, baseSize * 0.26, density * 1.5, t, bw * 0.8, 41.9) * 0.28;
  }

  // Global transition envelope — stars only exist while the dissolve is
  // mid-flight. Fades to zero at progress=0 (showing pure A) and progress=1
  // (showing pure B), so resting states have no leftover sparkle.
  float wave = smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(0.88, 1.0, progress));

  vec3 finalRgb = baseColor
                + perPixelGlow * sparkleStrength * wave
                + stars * sparkleStrength * 1.6 * wave;

  gl_FragColor = vec4(finalRgb, max(a.a, b.a));
}`;

type Rgb = [number, number, number];

interface PaletteSpec {
  a: Rgb;
  b: Rgb;
  c: Rgb;
  d: Rgb;
}

const PALETTES: Record<BlingPalette, PaletteSpec> = {
  iris: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.263, 0.416, 0.557],
  },
  ember: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.1, 0.2],
  },
  ice: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.5, 0.6, 0.7],
  },
  silver: {
    a: [0.5, 0.5, 0.5],
    b: [0.4, 0.4, 0.4],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.0, 0.0],
  },
};

interface Knobs {
  progress: number | undefined;
  autoPlay: boolean;
  duration: number;
  hold: number;
  loop: boolean;
  palette: BlingPalette;
  intensity: number;
  iterations: number;
  sparkleStrength: number;
  distortion: number;
  softness: number;
  noiseScale: number;
  drip: number;
  direction: BlingTransitionDirection;
}

function dirToInt(d: BlingTransitionDirection): number {
  switch (d) {
    case "horizontal":
      return 1;
    case "vertical":
      return 2;
    case "radial":
      return 3;
    default:
      return 0;
  }
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

// Smootherstep — Perlin's 6t^5-15t^4+10t^3. C2-continuous at 0 and 1, so the
// sweep glides into the destination instead of ticking to a stop.
function easeSmootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function BlingTransition({
  imageA,
  imageB,
  progress,
  autoPlay = true,
  duration = 4200,
  hold = 1800,
  loop = true,
  palette = "iris",
  intensity = 0.005,
  iterations = 4,
  sparkleStrength = 1,
  distortion = 0.08,
  softness = 0.22,
  noiseScale = 2.4,
  drip = 0.55,
  direction = "noise",
  onComplete,
  className,
  style,
  ...rest
}: BlingTransitionProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const knobsRef = useRef<Knobs>({
    progress,
    autoPlay,
    duration,
    hold,
    loop,
    palette,
    intensity,
    iterations,
    sparkleStrength,
    distortion,
    softness,
    noiseScale,
    drip,
    direction,
  });
  const onCompleteRef = useRef<typeof onComplete>(undefined);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Hot-swap tunables without tearing down the GL context.
  useEffect(() => {
    knobsRef.current = {
      progress,
      autoPlay,
      duration,
      hold,
      loop,
      palette,
      intensity,
      iterations,
      sparkleStrength,
      distortion,
      softness,
      noiseScale,
      drip,
      direction,
    };
  }, [
    progress,
    autoPlay,
    duration,
    hold,
    loop,
    palette,
    intensity,
    iterations,
    sparkleStrength,
    distortion,
    softness,
    noiseScale,
    drip,
    direction,
  ]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const canvas = renderer.domElement;
    canvas.style.cssText =
      "width:100%;height:100%;display:block;border-radius:inherit;";
    mount.prepend(canvas);

    const canvasRes = new THREE.Vector2(1, 1);
    const imageARes = new THREE.Vector2(1, 1);
    const imageBRes = new THREE.Vector2(1, 1);

    const spec = PALETTES[knobsRef.current.palette] ?? PALETTES.iris;
    const uniforms: Record<string, { value: unknown }> = {
      imageA: { value: null },
      imageB: { value: null },
      imageARes: { value: imageARes },
      imageBRes: { value: imageBRes },
      canvasRes: { value: canvasRes },
      progress: { value: 0 },
      time: { value: 0 },
      distortion: { value: distortion },
      softness: { value: softness },
      noiseScale: { value: noiseScale },
      drip: { value: drip },
      direction: { value: dirToInt(direction) },
      intensity: { value: intensity },
      iterations: { value: iterations },
      sparkleStrength: { value: sparkleStrength },
      pA: { value: new THREE.Vector3(spec.a[0], spec.a[1], spec.a[2]) },
      pB: { value: new THREE.Vector3(spec.b[0], spec.b[1], spec.b[2]) },
      pC: { value: new THREE.Vector3(spec.c[0], spec.c[1], spec.c[2]) },
      pD: { value: new THREE.Vector3(spec.d[0], spec.d[1], spec.d[2]) },
    };

    const material = new THREE.RawShaderMaterial({
      vertexShader: VS,
      fragmentShader: FS,
      uniforms,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();

    const measure = () => {
      const rect = mount.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvasRes.set(w, h);
      renderer.setSize(w, h, false);
    };
    measure();

    let resizeRaf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (disposed) return;
        measure();
      });
    });
    ro.observe(mount);

    let visible = true;
    let pageVisible = !document.hidden;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        visible = !!e && e.isIntersecting && e.intersectionRatio > 0;
      },
      { threshold: [0, 0.01] },
    );
    io.observe(mount);

    const handleVisibility = () => {
      pageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    let texA: THREE.Texture | null = null;
    let texB: THREE.Texture | null = null;

    function configureTex(t: THREE.Texture) {
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
    }
    function loadTex(url: string): Promise<THREE.Texture> {
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (t) => {
            configureTex(t);
            resolve(t);
          },
          undefined,
          (err) => reject(err),
        );
      });
    }

    type Phase = "forward" | "holdF" | "backward" | "holdB" | "done";
    let phase: Phase = "forward";
    let phaseStart = performance.now();
    let progressVal = 0;
    const startTime = performance.now();

    function advancePhase(now: number) {
      const k = knobsRef.current;
      const dt = now - phaseStart;
      if (phase === "forward") {
        const linear = clamp(dt / Math.max(1, k.duration), 0, 1);
        progressVal = easeSmootherstep(linear);
        if (dt >= k.duration) {
          progressVal = 1;
          onCompleteRef.current?.();
          if (k.loop) {
            phase = "holdF";
            phaseStart = now;
          } else {
            phase = "done";
          }
        }
      } else if (phase === "holdF") {
        progressVal = 1;
        if (dt >= k.hold) {
          phase = "backward";
          phaseStart = now;
        }
      } else if (phase === "backward") {
        const linear = clamp(dt / Math.max(1, k.duration), 0, 1);
        progressVal = 1 - easeSmootherstep(linear);
        if (dt >= k.duration) {
          progressVal = 0;
          onCompleteRef.current?.();
          phase = "holdB";
          phaseStart = now;
        }
      } else if (phase === "holdB") {
        progressVal = 0;
        if (dt >= k.hold) {
          phase = "forward";
          phaseStart = now;
        }
      }
    }

    let rafId: number | null = null;
    function frame() {
      rafId = requestAnimationFrame(frame);
      if (!visible || !pageVisible) return;
      const now = performance.now();
      const k = knobsRef.current;

      if (k.progress !== undefined) {
        progressVal = clamp(k.progress, 0, 1);
      } else if (k.autoPlay) {
        advancePhase(now);
      }

      const ps = PALETTES[k.palette] ?? PALETTES.iris;
      uniforms.progress.value = progressVal;
      uniforms.time.value = (now - startTime) / 1000;
      uniforms.distortion.value = k.distortion;
      uniforms.softness.value = k.softness;
      uniforms.noiseScale.value = k.noiseScale;
      uniforms.drip.value = k.drip;
      uniforms.direction.value = dirToInt(k.direction);
      uniforms.intensity.value = Math.max(0.0005, k.intensity);
      uniforms.iterations.value = Math.max(1, Math.min(6, k.iterations | 0));
      uniforms.sparkleStrength.value = Math.max(0, k.sparkleStrength);
      (uniforms.pA.value as THREE.Vector3).set(ps.a[0], ps.a[1], ps.a[2]);
      (uniforms.pB.value as THREE.Vector3).set(ps.b[0], ps.b[1], ps.b[2]);
      (uniforms.pC.value as THREE.Vector3).set(ps.c[0], ps.c[1], ps.c[2]);
      (uniforms.pD.value as THREE.Vector3).set(ps.d[0], ps.d[1], ps.d[2]);

      renderer.render(scene, camera);
    }

    (async () => {
      try {
        const [a, b] = await Promise.all([loadTex(imageA), loadTex(imageB)]);
        if (disposed) {
          a.dispose();
          b.dispose();
          return;
        }
        texA = a;
        texB = b;
        const aw = (a.image as { width?: number })?.width ?? 1;
        const ah = (a.image as { height?: number })?.height ?? 1;
        const bw = (b.image as { width?: number })?.width ?? 1;
        const bh = (b.image as { height?: number })?.height ?? 1;
        imageARes.set(aw, ah);
        imageBRes.set(bw, bh);
        uniforms.imageA.value = texA;
        uniforms.imageB.value = texB;
        frame();
      } catch {
        // Texture load failed — leave the canvas blank rather than throwing.
      }
    })();

    return () => {
      disposed = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      material.dispose();
      geometry.dispose();
      texA?.dispose();
      texB?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // GL context is rebuilt only when image URLs change. Every other prop
    // flows through `knobsRef` per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageA, imageB]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...style,
      }}
      {...rest}
    />
  );
}

BlingTransition.displayName = "BlingTransition";
