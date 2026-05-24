"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import * as THREE from "three";

export type LiquidTransitionDirection =
  | "noise"
  | "horizontal"
  | "vertical"
  | "radial";

export interface LiquidTransitionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  /** First image — shown at progress 0. */
  imageA: string;
  /** Second image — revealed at progress 1. */
  imageB: string;
  /** Controlled progress 0..1. When provided, internal autoplay is disabled. */
  progress?: number;
  /** Animate progress automatically. Ignored when `progress` is set. @default true */
  autoPlay?: boolean;
  /** Full A → B sweep, in milliseconds. @default 2400 */
  duration?: number;
  /** Pause at each end of the sweep when looping, in milliseconds. @default 1200 */
  hold?: number;
  /** Ping-pong forever. When false, stops at B after the first sweep. @default true */
  loop?: boolean;
  /** Liquid distortion amplitude near the boundary, in UV units. @default 0.08 */
  distortion?: number;
  /** Soft edge of the boundary mask. 0 is a hard wipe, 0.5 is a wide fade. @default 0.18 */
  softness?: number;
  /** Noise scale — higher = finer streaks. @default 2.4 */
  noiseScale?: number;
  /** Direction bias (0 = pure noise, 1 = pure direction). @default 0.55 */
  drip?: number;
  /** Direction the liquid front sweeps in. @default "noise" */
  direction?: LiquidTransitionDirection;
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

// Single composite pass — fbm-driven mask sweeps from imageA to imageB,
// with a velocity-style refraction concentrated at the moving boundary.
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
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

void main() {
  // Direction bias — 0 means the front leaves from this point first, 1 means last.
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

  vec2 np = vUv * noiseScale + vec2(time * 0.06, time * 0.04);
  float n = fbm(np);
  // The field that progress will sweep through. drip=0 is a pure noise blob,
  // drip=1 is a clean directional wipe; in between is the liquid-y look.
  float field = mix(n, bias, drip);

  // Pad the threshold past [0,1] so progress 0 and 1 fully clear the field.
  float t = mix(-softness, 1.0 + softness, progress);
  float mask = smoothstep(field - softness, field + softness, t);

  // Edge weight peaks at the moving boundary — only there does light bend.
  float edge = 1.0 - abs(mask * 2.0 - 1.0);

  // Refraction vector from a separate fbm sample — cheaper than gradient.
  vec2 dn = vec2(
    fbm(np + vec2(3.7, 1.2)) - 0.5,
    fbm(np + vec2(8.3, 4.5)) - 0.5
  );
  vec2 disp = dn * distortion * edge;

  vec2 uvA = cover(vUv + disp, imageARes, canvasRes);
  vec2 uvB = cover(vUv + disp, imageBRes, canvasRes);

  vec4 a = texture2D(imageA, uvA);
  vec4 b = texture2D(imageB, uvB);
  vec4 c = mix(a, b, mask);
  gl_FragColor = vec4(c.rgb, max(c.a, max(a.a, b.a)));
}`;

interface Knobs {
  progress: number | undefined;
  autoPlay: boolean;
  duration: number;
  hold: number;
  loop: boolean;
  distortion: number;
  softness: number;
  noiseScale: number;
  drip: number;
  direction: LiquidTransitionDirection;
}

function dirToInt(d: LiquidTransitionDirection): number {
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

export function LiquidTransition({
  imageA,
  imageB,
  progress,
  autoPlay = true,
  duration = 2400,
  hold = 1200,
  loop = true,
  distortion = 0.08,
  softness = 0.18,
  noiseScale = 2.4,
  drip = 0.55,
  direction = "noise",
  onComplete,
  className,
  style,
  ...rest
}: LiquidTransitionProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const knobsRef = useRef<Knobs>({
    progress,
    autoPlay,
    duration,
    hold,
    loop,
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

    // Pause when off-screen or tab-hidden.
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

    // ────────── textures ──────────
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

    // ────────── animation state ──────────
    type Phase = "forward" | "holdF" | "backward" | "holdB" | "done";
    let phase: Phase = "forward";
    let phaseStart = performance.now();
    let progressVal = 0;
    const startTime = performance.now();

    function advancePhase(now: number) {
      const k = knobsRef.current;
      const dt = now - phaseStart;
      if (phase === "forward") {
        progressVal = clamp(dt / Math.max(1, k.duration), 0, 1);
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
        progressVal = 1 - clamp(dt / Math.max(1, k.duration), 0, 1);
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

      uniforms.progress.value = progressVal;
      uniforms.time.value = (now - startTime) / 1000;
      uniforms.distortion.value = k.distortion;
      uniforms.softness.value = k.softness;
      uniforms.noiseScale.value = k.noiseScale;
      uniforms.drip.value = k.drip;
      uniforms.direction.value = dirToInt(k.direction);

      renderer.render(scene, camera);
    }

    // ────────── kick off ──────────
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

LiquidTransition.displayName = "LiquidTransition";
