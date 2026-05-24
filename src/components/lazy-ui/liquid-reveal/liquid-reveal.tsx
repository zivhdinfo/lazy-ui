"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import * as THREE from "three";

export interface LiquidRevealProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  /** Front image — visible until cursor disturbs the surface. */
  frontImage: string;
  /** Back image — revealed inside the liquid trail. */
  backImage: string;
  /** Radius of the dye splat at the cursor, in pixels. @default 220 */
  cursorSize?: number;
  /** Impulse strength injected into velocity by mouse motion. @default 45 */
  mouseForce?: number;
  /** Simulation buffer scale (0.25–1). Lower is faster, blurrier. @default 0.45 */
  resolution?: number;
  /** Diffusion of velocity — higher = slower, syrupier flow. @default 30 */
  viscous?: number;
  /** How aggressively dye uncovers the back image. @default 0.85 */
  revealStrength?: number;
  /** Soft edge of the reveal mask (0 = hard, 1+ = soft). @default 1 */
  revealSoftness?: number;
  /** Drift the cursor automatically when the user is idle. @default true */
  autoDemo?: boolean;
  /** Auto-drift speed in normalized units/s. @default 0.5 */
  autoSpeed?: number;
  /** Idle ms before auto-drift resumes after the user moves. @default 1200 */
  autoResumeDelay?: number;
  style?: CSSProperties;
}

const VS_SCREEN = /* glsl */ `
precision highp float;
attribute vec3 position;
varying vec2 vUv;
uniform vec2 boundary;
void main() {
  vec2 s = 1.0 - boundary * 2.0;
  vec2 p = position.xy * s;
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const VS_SPLAT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
void main() {
  vec2 p = position.xy * scale * 2.0 * px + center;
  vUv = uv;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// BFECC advection — single-tap fallback removed since BFECC is the only mode we ship.
const FS_ADVECT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 fboSize;
void main() {
  vec2 r = max(fboSize.x, fboSize.y) / fboSize;
  vec2 v0 = texture2D(velocity, vUv).xy;
  vec2 back = vUv - v0 * dt * r;
  vec2 vN = texture2D(velocity, back).xy;
  vec2 fwd = back + vN * dt * r;
  vec2 mid = vUv - 0.5 * (fwd - vUv);
  vec2 v1 = texture2D(velocity, mid).xy;
  vec2 final = texture2D(velocity, mid - v1 * dt * r).xy;
  gl_FragColor = vec4(final, 0.0, 0.0);
}`;

const FS_FORCE = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 force;
void main() {
  vec2 c = (vUv - 0.5) * 2.0;
  float d = 1.0 - min(length(c), 1.0);
  d *= d;
  gl_FragColor = vec4(force * d, 0.0, 1.0);
}`;

const FS_DIVERGENCE = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D velocity;
uniform vec2 px;
uniform float dt;
void main() {
  float x0 = texture2D(velocity, vUv - vec2(px.x, 0.0)).x;
  float x1 = texture2D(velocity, vUv + vec2(px.x, 0.0)).x;
  float y0 = texture2D(velocity, vUv - vec2(0.0, px.y)).y;
  float y1 = texture2D(velocity, vUv + vec2(0.0, px.y)).y;
  gl_FragColor = vec4((x1 - x0 + y1 - y0) * 0.5 / dt);
}`;

const FS_POISSON = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform vec2 px;
void main() {
  float p0 = texture2D(pressure, vUv + vec2(px.x * 2.0, 0.0)).r;
  float p1 = texture2D(pressure, vUv - vec2(px.x * 2.0, 0.0)).r;
  float p2 = texture2D(pressure, vUv + vec2(0.0, px.y * 2.0)).r;
  float p3 = texture2D(pressure, vUv - vec2(0.0, px.y * 2.0)).r;
  float d = texture2D(divergence, vUv).r;
  gl_FragColor = vec4((p0 + p1 + p2 + p3) * 0.25 - d);
}`;

const FS_PRESSURE = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform vec2 px;
uniform float dt;
void main() {
  float p0 = texture2D(pressure, vUv + vec2(px.x, 0.0)).r;
  float p1 = texture2D(pressure, vUv - vec2(px.x, 0.0)).r;
  float p2 = texture2D(pressure, vUv + vec2(0.0, px.y)).r;
  float p3 = texture2D(pressure, vUv - vec2(0.0, px.y)).r;
  vec2 v = texture2D(velocity, vUv).xy;
  v -= vec2(p0 - p1, p2 - p3) * 0.5 * dt;
  gl_FragColor = vec4(v, 0.0, 1.0);
}`;

const FS_VISCOUS = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D velocity;
uniform sampler2D velocityIter;
uniform float nu;
uniform float dt;
uniform vec2 px;
void main() {
  vec2 v0 = texture2D(velocity, vUv).xy;
  vec2 a = texture2D(velocityIter, vUv + vec2(px.x * 2.0, 0.0)).xy;
  vec2 b = texture2D(velocityIter, vUv - vec2(px.x * 2.0, 0.0)).xy;
  vec2 c = texture2D(velocityIter, vUv + vec2(0.0, px.y * 2.0)).xy;
  vec2 d = texture2D(velocityIter, vUv - vec2(0.0, px.y * 2.0)).xy;
  vec2 next = (4.0 * v0 + nu * dt * (a + b + c + d)) / (4.0 * (1.0 + nu * dt));
  gl_FragColor = vec4(next, 0.0, 0.0);
}`;

const FS_DYE_ADVECT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D dye;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 fboSize;
uniform float decay;
void main() {
  vec2 r = max(fboSize.x, fboSize.y) / fboSize;
  vec2 v = texture2D(velocity, vUv).xy;
  vec4 col = texture2D(dye, vUv - v * dt * r);
  gl_FragColor = col * decay;
}`;

const FS_DYE_SPLAT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D dye;
uniform vec2 center;
uniform float radius;
uniform float strength;
void main() {
  vec4 base = texture2D(dye, vUv);
  vec2 d = vUv - center;
  float r2 = radius * radius + 1e-6;
  float w = exp(- dot(d, d) / r2) * strength;
  float v = clamp(base.r + w, 0.0, 1.0);
  gl_FragColor = vec4(v, v, v, 1.0);
}`;

// One shared cover transform driven by `imageRes`. Both front and back are
// sampled with the SAME final UV — when the two images share dimensions they
// are pixel-perfect aligned, and when they don't the back still tracks the
// front instead of drifting independently. A small velocity-driven refraction
// is applied identically to both samples so the liquid still warps the image
// at the boundary without breaking alignment.
const FS_COMPOSITE = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D frontTex;
uniform sampler2D backTex;
uniform sampler2D dye;
uniform sampler2D velocity;
uniform float revealStrength;
uniform float revealSoftness;
uniform float refraction;
uniform vec2 imageRes;
uniform vec2 canvasRes;

vec2 cover(vec2 uv, vec2 tr, vec2 cr) {
  vec2 ratio = vec2(
    min((cr.x / cr.y) / (tr.x / tr.y), 1.0),
    min((cr.y / cr.x) / (tr.y / tr.x), 1.0)
  );
  return uv * ratio + (1.0 - ratio) * 0.5;
}

void main() {
  float dC = texture2D(dye, vUv).r;
  vec2 vel = texture2D(velocity, vUv).xy;

  // Edge weight peaks where the dye mask transitions — that's the liquid
  // interface, where light should bend.
  float m = dC * revealStrength;
  float mask = clamp(smoothstep(0.0, revealSoftness, m), 0.0, 1.0);
  float edge = 1.0 - abs(mask * 2.0 - 1.0);

  // Velocity-driven refraction: same offset to both samples preserves alignment.
  vec2 disp = vel * refraction * (0.4 + 0.6 * edge);
  vec2 uvWarp = vUv + disp;
  vec2 sampleUv = cover(uvWarp, imageRes, canvasRes);

  vec4 f = texture2D(frontTex, sampleUv);
  vec4 b = texture2D(backTex, sampleUv);
  vec4 c = mix(f, b, mask);
  gl_FragColor = vec4(c.rgb, max(c.a, max(f.a, b.a)));
}`;

/** Quad geometry shared by every fullscreen pass — one allocation per instance. */
function makeQuad() {
  return new THREE.PlaneGeometry(2, 2);
}

/** Splat geometry used for the additive force injection — same idea. */
function makeSplatQuad() {
  return new THREE.PlaneGeometry(1, 1);
}

type Uniforms = Record<string, { value: unknown }>;

interface Pass {
  scene: THREE.Scene;
  camera: THREE.Camera;
  material: THREE.RawShaderMaterial;
  mesh: THREE.Mesh;
  uniforms: Uniforms;
}

function createPass(
  vertex: string,
  fragment: string,
  uniforms: Uniforms,
  geometry: THREE.BufferGeometry,
  blending: THREE.Blending = THREE.NoBlending,
): Pass {
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const material = new THREE.RawShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    blending,
    depthWrite: false,
    depthTest: false,
    transparent: blending !== THREE.NoBlending,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return { scene, camera, material, mesh, uniforms };
}

function renderPass(
  renderer: THREE.WebGLRenderer,
  pass: Pass,
  target: THREE.WebGLRenderTarget | null,
) {
  renderer.setRenderTarget(target);
  renderer.render(pass.scene, pass.camera);
  renderer.setRenderTarget(null);
}

interface Tunables {
  cursorSize: number;
  mouseForce: number;
  resolution: number;
  viscous: number;
  revealStrength: number;
  revealSoftness: number;
  autoDemo: boolean;
  autoSpeed: number;
  autoResumeDelay: number;
}

const VISCOUS_ITERS = 18;
const POISSON_ITERS = 24;
const DT = 0.014;
// Slow dye decay leaves a longer wash behind the cursor — reads as liquid
// pooling rather than a quick puff of ink.
const DYE_DECAY = 0.993;

export function LiquidReveal({
  frontImage,
  backImage,
  cursorSize = 200,
  mouseForce = 60,
  resolution = 0.5,
  viscous = 42,
  revealStrength = 1.0,
  revealSoftness = 0.85,
  autoDemo = true,
  autoSpeed = 0.5,
  autoResumeDelay = 1200,
  className,
  style,
  ...rest
}: LiquidRevealProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Mutable tunables — written by a sync effect, read by the running render loop.
  const knobsRef = useRef<Tunables>({
    cursorSize,
    mouseForce,
    resolution,
    viscous,
    revealStrength,
    revealSoftness,
    autoDemo,
    autoSpeed,
    autoResumeDelay,
  });

  // Sync tunables without tearing down the WebGL context.
  useEffect(() => {
    knobsRef.current = {
      cursorSize,
      mouseForce,
      resolution,
      viscous,
      revealStrength,
      revealSoftness,
      autoDemo,
      autoSpeed,
      autoResumeDelay,
    };
  }, [
    cursorSize,
    mouseForce,
    resolution,
    viscous,
    revealStrength,
    revealSoftness,
    autoDemo,
    autoSpeed,
    autoResumeDelay,
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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);

    const canvas = renderer.domElement;
    canvas.style.cssText =
      "width:100%;height:100%;display:block;border-radius:inherit;touch-action:none;";
    mount.prepend(canvas);

    // ────────── viewport + sim sizing ──────────
    const view = { w: 1, h: 1, fboW: 1, fboH: 1 };
    const cellScale = new THREE.Vector2(1, 1);
    const boundary = new THREE.Vector2(0, 0);
    const fboSize = new THREE.Vector2(1, 1);
    const canvasRes = new THREE.Vector2(1, 1);

    const measure = () => {
      const rect = mount.getBoundingClientRect();
      view.w = Math.max(1, Math.floor(rect.width));
      view.h = Math.max(1, Math.floor(rect.height));
      const res = knobsRef.current.resolution;
      view.fboW = Math.max(1, Math.round(view.w * res));
      view.fboH = Math.max(1, Math.round(view.h * res));
      cellScale.set(1 / view.fboW, 1 / view.fboH);
      boundary.copy(cellScale);
      fboSize.set(view.fboW, view.fboH);
      canvasRes.set(view.w, view.h);
      renderer.setSize(view.w, view.h, false);
    };
    measure();

    // ────────── FBOs ──────────
    const isMobile =
      typeof navigator !== "undefined" &&
      /(iPad|iPhone|iPod|Android)/i.test(navigator.userAgent);
    const fpType = isMobile ? THREE.HalfFloatType : THREE.FloatType;
    const targetOpts: THREE.RenderTargetOptions = {
      type: fpType,
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    };
    const makeRT = () =>
      new THREE.WebGLRenderTarget(view.fboW, view.fboH, targetOpts);

    const velA = makeRT();
    const velB = makeRT();
    const viscA = makeRT();
    const viscB = makeRT();
    const div = makeRT();
    const presA = makeRT();
    const presB = makeRT();
    const dyeA = makeRT();
    const dyeB = makeRT();

    // ────────── geometries (shared) ──────────
    const quad = makeQuad();
    const splatQuad = makeSplatQuad();

    // ────────── passes ──────────
    const advectPass = createPass(
      VS_SCREEN,
      FS_ADVECT,
      {
        boundary: { value: boundary },
        velocity: { value: velA.texture },
        dt: { value: DT },
        fboSize: { value: fboSize },
      },
      quad,
    );

    const forcePass = createPass(
      VS_SPLAT,
      FS_FORCE,
      {
        px: { value: cellScale },
        force: { value: new THREE.Vector2() },
        center: { value: new THREE.Vector2() },
        scale: { value: new THREE.Vector2(cursorSize, cursorSize) },
      },
      splatQuad,
      THREE.AdditiveBlending,
    );

    const viscousPass = createPass(
      VS_SCREEN,
      FS_VISCOUS,
      {
        boundary: { value: boundary },
        velocity: { value: velB.texture },
        velocityIter: { value: viscA.texture },
        nu: { value: viscous },
        dt: { value: DT },
        px: { value: cellScale },
      },
      quad,
    );

    const divergencePass = createPass(
      VS_SCREEN,
      FS_DIVERGENCE,
      {
        boundary: { value: boundary },
        velocity: { value: viscB.texture },
        px: { value: cellScale },
        dt: { value: DT },
      },
      quad,
    );

    const poissonPass = createPass(
      VS_SCREEN,
      FS_POISSON,
      {
        boundary: { value: boundary },
        pressure: { value: presA.texture },
        divergence: { value: div.texture },
        px: { value: cellScale },
      },
      quad,
    );

    const pressurePass = createPass(
      VS_SCREEN,
      FS_PRESSURE,
      {
        boundary: { value: boundary },
        pressure: { value: presB.texture },
        velocity: { value: viscB.texture },
        px: { value: cellScale },
        dt: { value: DT },
      },
      quad,
    );

    const dyeAdvectPass = createPass(
      VS_SCREEN,
      FS_DYE_ADVECT,
      {
        boundary: { value: boundary },
        dye: { value: dyeA.texture },
        velocity: { value: velA.texture },
        dt: { value: DT },
        fboSize: { value: fboSize },
        decay: { value: DYE_DECAY },
      },
      quad,
    );

    const dyeSplatPass = createPass(
      VS_SCREEN,
      FS_DYE_SPLAT,
      {
        boundary: { value: boundary },
        dye: { value: dyeB.texture },
        center: { value: new THREE.Vector2(0.5, 0.5) },
        radius: { value: 0.08 },
        strength: { value: 0.3 },
      },
      quad,
    );

    const compositeUniforms: Uniforms = {
      frontTex: { value: null },
      backTex: { value: null },
      dye: { value: dyeA.texture },
      velocity: { value: velA.texture },
      revealStrength: { value: revealStrength },
      revealSoftness: { value: revealSoftness },
      refraction: { value: 0.012 },
      imageRes: { value: new THREE.Vector2(1, 1) },
      canvasRes: { value: canvasRes },
    };
    const compositePass = createPass(
      VS_SCREEN,
      FS_COMPOSITE,
      compositeUniforms,
      quad,
    );
    (compositePass.material as THREE.RawShaderMaterial).transparent = true;

    // ────────── mouse state ──────────
    const mouseNDC = new THREE.Vector2(0, 0);
    const mousePrev = new THREE.Vector2(0, 0);
    const mouseDiff = new THREE.Vector2(0, 0);
    let hoverInside = false;
    let userControl = false;
    let autoActive = autoDemo;
    let lastInteract = -Infinity;

    // Takeover state — smooth blend from auto position to user position.
    let takeoverT = 1;
    const takeoverFrom = new THREE.Vector2();
    const takeoverTo = new THREE.Vector2();
    const TAKEOVER_MS = 250;
    let takeoverStart = 0;

    const setNDC = (clientX: number, clientY: number) => {
      const r = mount.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const nx = ((clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((clientY - r.top) / r.height) * 2 - 1);
      mouseNDC.set(nx, ny);
    };

    const handlePointerMove = (e: PointerEvent) => {
      lastInteract = performance.now();
      hoverInside = true;
      if (autoActive && !userControl) {
        const r = mount.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        takeoverFrom.copy(mouseNDC);
        takeoverTo.set(nx, ny);
        takeoverStart = performance.now();
        takeoverT = 0;
        userControl = true;
        autoActive = false;
        return;
      }
      setNDC(e.clientX, e.clientY);
      userControl = true;
    };

    const handlePointerEnter = () => {
      hoverInside = true;
    };

    const handlePointerLeave = () => {
      hoverInside = false;
    };

    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerenter", handlePointerEnter);
    mount.addEventListener("pointerleave", handlePointerLeave);

    // ────────── auto driver ──────────
    const autoCurrent = new THREE.Vector2(
      (Math.random() * 2 - 1) * 0.8,
      (Math.random() * 2 - 1) * 0.8,
    );
    const autoTarget = new THREE.Vector2();
    const autoTmpDir = new THREE.Vector2();
    let autoLastT = performance.now();
    const AUTO_MARGIN = 0.2;

    function pickAutoTarget() {
      autoTarget.set(
        (Math.random() * 2 - 1) * (1 - AUTO_MARGIN),
        (Math.random() * 2 - 1) * (1 - AUTO_MARGIN),
      );
    }
    pickAutoTarget();
    // Seed previous so the first frame produces a non-zero diff.
    mouseNDC.copy(autoCurrent);
    mousePrev.copy(autoCurrent).addScaledVector(
      autoTmpDir.subVectors(autoTarget, autoCurrent).normalize(),
      -0.05,
    );

    function updateAuto(now: number) {
      const knobs = knobsRef.current;
      if (!knobs.autoDemo) {
        autoActive = false;
        return;
      }
      const idle = now - lastInteract;
      if (idle < knobs.autoResumeDelay || hoverInside) {
        autoActive = false;
        return;
      }
      if (!autoActive) {
        autoActive = true;
        userControl = false;
        autoCurrent.copy(mouseNDC);
        autoLastT = now;
        pickAutoTarget();
      }
      let ds = (now - autoLastT) / 1000;
      autoLastT = now;
      if (ds > 0.2) ds = 0.016;
      const dir = autoTmpDir.subVectors(autoTarget, autoCurrent);
      const dist = dir.length();
      if (dist < 0.01) {
        pickAutoTarget();
        return;
      }
      dir.normalize();
      const step = Math.min(knobs.autoSpeed * ds, dist);
      autoCurrent.addScaledVector(dir, step);
      mouseNDC.copy(autoCurrent);
    }

    function updateMouse(now: number) {
      if (takeoverT < 1) {
        const t = (now - takeoverStart) / TAKEOVER_MS;
        if (t >= 1) {
          takeoverT = 1;
          mouseNDC.copy(takeoverTo);
        } else {
          takeoverT = t;
          const k = t * t * (3 - 2 * t);
          mouseNDC.copy(takeoverFrom).lerp(takeoverTo, k);
        }
      }
      mouseDiff.subVectors(mouseNDC, mousePrev);
      mousePrev.copy(mouseNDC);
    }

    // ────────── textures ──────────
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    let frontTex: THREE.Texture | null = null;
    let backTex: THREE.Texture | null = null;

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

    // ────────── resize handling ──────────
    function resizeFBOs() {
      measure();
      cellScale.set(1 / view.fboW, 1 / view.fboH);
      boundary.copy(cellScale);
      fboSize.set(view.fboW, view.fboH);
      canvasRes.set(view.w, view.h);
      velA.setSize(view.fboW, view.fboH);
      velB.setSize(view.fboW, view.fboH);
      viscA.setSize(view.fboW, view.fboH);
      viscB.setSize(view.fboW, view.fboH);
      div.setSize(view.fboW, view.fboH);
      presA.setSize(view.fboW, view.fboH);
      presB.setSize(view.fboW, view.fboH);
      dyeA.setSize(view.fboW, view.fboH);
      dyeB.setSize(view.fboW, view.fboH);
    }

    let resizeRaf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (disposed) return;
        resizeFBOs();
      });
    });
    ro.observe(mount);

    // ────────── visibility ──────────
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

    function handleVisibility() {
      pageVisible = !document.hidden;
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // ────────── simulation step ──────────
    function step() {
      const knobs = knobsRef.current;

      // 1. advect velocity: velA → velB
      advectPass.uniforms.velocity.value = velA.texture;
      renderPass(renderer, advectPass, velB);

      // 2. inject external force at cursor (additive on velB)
      if (mouseDiff.x !== 0 || mouseDiff.y !== 0) {
        const csU = knobs.cursorSize;
        const csNdcX = csU * cellScale.x;
        const csNdcY = csU * cellScale.y;
        const fx = (mouseDiff.x * 0.5) * knobs.mouseForce;
        const fy = (mouseDiff.y * 0.5) * knobs.mouseForce;
        const cx = clamp(
          mouseNDC.x,
          -1 + csNdcX + cellScale.x * 2.0,
          1 - csNdcX - cellScale.x * 2.0,
        );
        const cy = clamp(
          mouseNDC.y,
          -1 + csNdcY + cellScale.y * 2.0,
          1 - csNdcY - cellScale.y * 2.0,
        );
        const fu = forcePass.uniforms;
        (fu.force.value as THREE.Vector2).set(fx, fy);
        (fu.center.value as THREE.Vector2).set(cx, cy);
        (fu.scale.value as THREE.Vector2).set(csU, csU);
        renderPass(renderer, forcePass, velB);
      }

      // 3. viscous diffusion — ping pong: viscA ↔ viscB, seeded from velB
      // Start with viscA = velB, iterate the Jacobi solver.
      viscousPass.uniforms.velocity.value = velB.texture;
      viscousPass.uniforms.nu.value = knobs.viscous;
      let inRT = viscA;
      let outRT = viscB;
      // Seed: copy velB into viscA by running one iteration with iter=velB.
      viscousPass.uniforms.velocityIter.value = velB.texture;
      renderPass(renderer, viscousPass, viscA);
      for (let i = 0; i < VISCOUS_ITERS; i++) {
        viscousPass.uniforms.velocityIter.value = inRT.texture;
        renderPass(renderer, viscousPass, outRT);
        const t = inRT;
        inRT = outRT;
        outRT = t;
      }
      // `inRT` now holds the diffused velocity. We need it in viscB for the
      // downstream passes (divergence + pressure read from viscB).
      if (inRT !== viscB) {
        // One-shot copy via the divergence stage's source override would muddy
        // things; just run one extra iteration to land the result in viscB.
        viscousPass.uniforms.velocityIter.value = inRT.texture;
        renderPass(renderer, viscousPass, viscB);
      }

      // 4. divergence: viscB → div
      divergencePass.uniforms.velocity.value = viscB.texture;
      renderPass(renderer, divergencePass, div);

      // 5. poisson: solve pressure
      // Clear presA / presB by running a single pass with pressure=presA.texture.
      let pIn = presA;
      let pOut = presB;
      for (let i = 0; i < POISSON_ITERS; i++) {
        poissonPass.uniforms.pressure.value = pIn.texture;
        renderPass(renderer, poissonPass, pOut);
        const t = pIn;
        pIn = pOut;
        pOut = t;
      }

      // 6. subtract pressure gradient: viscB - grad(presA) → velA (input for next frame)
      pressurePass.uniforms.pressure.value = pIn.texture;
      pressurePass.uniforms.velocity.value = viscB.texture;
      renderPass(renderer, pressurePass, velA);

      // 7. advect dye: dyeA → dyeB (sampling velA)
      dyeAdvectPass.uniforms.dye.value = dyeA.texture;
      dyeAdvectPass.uniforms.velocity.value = velA.texture;
      renderPass(renderer, dyeAdvectPass, dyeB);

      // 8. splat dye at cursor: dyeB → dyeA. Slightly larger radius and a
      // higher floor on strength so even slow drags lay down a visible wash.
      const speed = mouseDiff.length();
      const baseRadius = 0.1 * (knobs.cursorSize / 120);
      const baseStrength = 0.42 * clamp(speed * 2.2, 0.55, 3.5);
      (dyeSplatPass.uniforms.center.value as THREE.Vector2).set(
        (mouseNDC.x + 1) * 0.5,
        (mouseNDC.y + 1) * 0.5,
      );
      dyeSplatPass.uniforms.dye.value = dyeB.texture;
      dyeSplatPass.uniforms.radius.value = baseRadius;
      dyeSplatPass.uniforms.strength.value = baseStrength;
      renderPass(renderer, dyeSplatPass, dyeA);
    }

    function composite() {
      const knobs = knobsRef.current;
      compositeUniforms.revealStrength.value = knobs.revealStrength;
      compositeUniforms.revealSoftness.value = knobs.revealSoftness;
      compositeUniforms.dye.value = dyeA.texture;
      compositeUniforms.velocity.value = velA.texture;
      compositeUniforms.frontTex.value = frontTex;
      compositeUniforms.backTex.value = backTex;
      renderer.setRenderTarget(null);
      renderer.render(compositePass.scene, compositePass.camera);
    }

    // ────────── main loop ──────────
    let rafId: number | null = null;
    function frame() {
      rafId = requestAnimationFrame(frame);
      if (!visible || !pageVisible) return;
      const now = performance.now();
      updateAuto(now);
      updateMouse(now);
      step();
      composite();
    }

    // ────────── kick off ──────────
    (async () => {
      try {
        const [f, b] = await Promise.all([
          loadTex(frontImage),
          loadTex(backImage),
        ]);
        if (disposed) {
          f.dispose();
          b.dispose();
          return;
        }
        frontTex = f;
        backTex = b;
        // The front image's resolution drives the cover transform for BOTH
        // samples. When the two images share dimensions this is pixel-perfect;
        // when they differ, the back is positioned identically to the front
        // rather than drifting away with its own cover-fit.
        const fw = (f.image as { width?: number })?.width ?? 1;
        const fh = (f.image as { height?: number })?.height ?? 1;
        (compositeUniforms.imageRes.value as THREE.Vector2).set(fw, fh);
        // Warm-start the auto-driver by stepping the sim a few times — avoids
        // a visible "snap" from a flat dye buffer when autoDemo is on.
        for (let i = 0; i < 3; i++) {
          updateAuto(performance.now());
          updateMouse(performance.now());
          step();
        }
        frame();
      } catch {
        // Texture load failed — leave the canvas blank rather than throwing.
      }
    })();

    // ────────── cleanup ──────────
    return () => {
      disposed = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerenter", handlePointerEnter);
      mount.removeEventListener("pointerleave", handlePointerLeave);

      // Dispose render targets.
      [velA, velB, viscA, viscB, div, presA, presB, dyeA, dyeB].forEach((rt) =>
        rt.dispose(),
      );

      // Dispose pass materials.
      [
        advectPass,
        forcePass,
        viscousPass,
        divergencePass,
        poissonPass,
        pressurePass,
        dyeAdvectPass,
        dyeSplatPass,
        compositePass,
      ].forEach((p) => p.material.dispose());

      // Dispose shared geometries.
      quad.dispose();
      splatQuad.dispose();

      // Dispose textures (if they were loaded).
      frontTex?.dispose();
      backTex?.dispose();

      // Tear down renderer + DOM.
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // We intentionally tear down + recreate the GL context only when the image
    // URLs change. All other tunables are read from `knobsRef` per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontImage, backImage]);

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

LiquidReveal.displayName = "LiquidReveal";

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}
