"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(useGSAP);

export type SpectralCardTone = "ember" | "aqua" | "violet" | "mono";

export interface SpectralCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content rendered above the image surface. */
  children?: ReactNode;
  /** Image source rendered into the WebGL texture. @default "/images/piano-girl.webp" */
  media?: string;
  /** Accessible label for the static reduced-motion fallback layer. @default "" */
  mediaLabel?: string;
  /** Source image aspect ratio. Auto-detected after load when omitted. */
  mediaRatio?: number;
  /** Root width. @default "100%" */
  width?: CSSProperties["width"];
  /** Root height. @default "100%" */
  height?: CSSProperties["height"];
  /** Root border radius. @default 24 */
  corner?: CSSProperties["borderRadius"];
  /** Highlight tint preset. @default "ember" */
  tone?: SpectralCardTone;
  /** Master effect strength (0-1.5). @default 1 */
  energy?: number;
  /** Always-on texture overscan so tilted corners never reveal the edge. @default 0.08 */
  restZoom?: number;
  /** Texture zoom applied while hovering (0-0.4). @default 0.24 */
  hoverZoom?: number;
  /** RGB channel separation strength (0-1). @default 0.7 */
  spectrum?: number;
  /** Localized refraction around the pointer (0-1). @default 0.85 */
  displace?: number;
  /** Diagonal highlight strength (0-1). @default 0.45 */
  gloss?: number;
  /** 3D tilt in degrees. @default 10 */
  tiltDepth?: number;
  /** Pixel translation following the pointer. @default 10 */
  floatRange?: number;
  /** Hover shader animation duration in seconds. @default 1.8 */
  hoverDuration?: number;
  /** Tilt, scale, and position animation duration in seconds. @default 0.45 */
  motionDuration?: number;
  /** Surface alpha. @default 1 */
  alpha?: number;
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

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_hover;
uniform float u_imageAspect;
uniform float u_premagnify;
uniform float u_magnify;
uniform float u_fringe;
uniform float u_warp;
uniform float u_glare;
uniform float u_alpha;
uniform vec3 u_glow;

in vec2 v_uv;
out vec4 fragColor;

float expoInOut(float t) {
  if (t == 0.0 || t == 1.0) return t;
  if (t < 0.5) return 0.5 * pow(2.0, 20.0 * t - 10.0);
  return -0.5 * pow(2.0, 10.0 - 20.0 * t) + 1.0;
}

vec2 coverUv(vec2 uv) {
  float screen = u_resolution.x / max(u_resolution.y, 1.0);
  float image = max(u_imageAspect, 0.001);
  vec2 scale = vec2(1.0);

  if (image > screen) {
    scale.x = screen / image;
  } else {
    scale.y = image / screen;
  }

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 uv = v_uv;
  float hover = clamp(u_hover, 0.0, 1.0);

  float baseZoom = clamp(u_premagnify, 0.0, 0.22);
  uv = 0.5 + (uv - 0.5) * (1.0 - baseZoom);

  vec2 texUv = coverUv(uv);
  float radial = distance(vec2(0.5), texUv);
  float hoverLevel = expoInOut(min(1.0, radial * hover + hover));

  texUv *= 1.0 - u_magnify * hoverLevel;
  texUv += u_magnify * 0.5 * hoverLevel;
  texUv = clamp(texUv, 0.001, 0.999);
  vec4 base = texture(u_image, texUv);

  float impulse = 1.0 - abs(hoverLevel - 0.5) * 2.0;
  impulse *= smoothstep(0.0, 0.02, hoverLevel);

  vec2 displaced = texUv;
  displaced.y += base.r * impulse * u_warp * 0.075;
  displaced.x += (base.g - 0.5) * impulse * u_warp * 0.018;
  displaced = clamp(displaced, 0.001, 0.999);

  vec4 colorSample = texture(u_image, displaced);
  vec2 split = vec2(u_fringe * impulse * 0.022, 0.0);
  colorSample.r = texture(u_image, clamp(displaced + split, 0.001, 0.999)).r;
  colorSample.g = texture(u_image, clamp(displaced - split * 0.65, 0.001, 0.999)).g;
  colorSample.b = texture(u_image, clamp(displaced - split, 0.001, 0.999)).b;

  vec2 pointerDelta = (v_uv - u_pointer) * vec2(aspect, 1.0);
  float pointerGlow = exp(-dot(pointerDelta, pointerDelta) * 7.0) * hover;
  float sweep = pow(0.5 + 0.5 * sin((v_uv.x + v_uv.y) * 4.0 - u_time * 0.9), 10.0);
  vec3 color = colorSample.rgb;
  color += u_glow * (pointerGlow * 0.18 + sweep * 0.08) * u_glare;

  vec2 centerDelta = (v_uv - 0.5) * vec2(aspect, 1.0);
  color *= 1.0 - smoothstep(0.5, 1.05, length(centerDelta)) * 0.18;

  fragColor = vec4(clamp(color, 0.0, 1.0), colorSample.a * u_alpha);
}
`;

type Rgb = [number, number, number];
type QuickTo = ReturnType<typeof gsap.quickTo>;

const TONES: Record<
  SpectralCardTone,
  { glow: Rgb; background: string; overlay: string }
> = {
  ember: {
    glow: [1.0, 0.43, 0.22],
    background: "#100c0a",
    overlay:
      "linear-gradient(135deg, rgba(255, 118, 54, .20), rgba(34, 211, 238, .10) 42%, rgba(0, 0, 0, .30))",
  },
  aqua: {
    glow: [0.16, 0.92, 0.95],
    background: "#061113",
    overlay:
      "linear-gradient(135deg, rgba(45, 212, 191, .24), rgba(59, 130, 246, .12) 44%, rgba(0, 0, 0, .34))",
  },
  violet: {
    glow: [0.68, 0.42, 1.0],
    background: "#100b18",
    overlay:
      "linear-gradient(135deg, rgba(168, 85, 247, .24), rgba(244, 114, 182, .14) 46%, rgba(0, 0, 0, .34))",
  },
  mono: {
    glow: [0.92, 0.92, 0.95],
    background: "#0d0d0f",
    overlay:
      "linear-gradient(135deg, rgba(255, 255, 255, .18), rgba(255, 255, 255, .06) 44%, rgba(0, 0, 0, .36))",
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
    console.error("SpectralCard shader compile error:", gl.getShaderInfoLog(shader));
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
    console.error("SpectralCard program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function killQuickTo(quick: QuickTo): void {
  (quick as QuickTo & { tween?: gsap.core.Tween }).tween?.kill();
}

export function SpectralCard({
  children,
  media = "/images/piano-girl.webp",
  mediaLabel = "",
  mediaRatio,
  width = "100%",
  height = "100%",
  corner = 24,
  tone = "ember",
  energy = 1,
  restZoom = 0.08,
  hoverZoom = 0.24,
  spectrum = 0.7,
  displace = 0.85,
  gloss = 0.45,
  tiltDepth = 10,
  floatRange = 10,
  hoverDuration = 1.8,
  motionDuration = 0.45,
  alpha = 1,
  className,
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: SpectralCardProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticMode = !!reduced;

  const paramsRef = useRef({
    mediaRatio,
    tone,
    energy,
    restZoom,
    hoverZoom,
    spectrum,
    displace,
    gloss,
    tiltDepth,
    floatRange,
    hoverDuration,
    motionDuration,
    alpha,
  });
  useEffect(() => {
    paramsRef.current = {
      mediaRatio,
      tone,
      energy,
      restZoom,
      hoverZoom,
      spectrum,
      displace,
      gloss,
      tiltDepth,
      floatRange,
      hoverDuration,
      motionDuration,
      alpha,
    };
  }, [
    mediaRatio,
    tone,
    energy,
    restZoom,
    hoverZoom,
    spectrum,
    displace,
    gloss,
    tiltDepth,
    floatRange,
    hoverDuration,
    motionDuration,
    alpha,
  ]);

  const pointerTargetRef = useRef({ x: 0.5, y: 0.5, active: false });
  const hoverActiveRef = useRef(false);
  const motionRef = useRef({ x: 0.5, y: 0.5, hover: 0 });
  const gsapDriveRef = useRef<{
    x: QuickTo;
    y: QuickTo;
    hover: QuickTo;
    frameX: QuickTo;
    frameY: QuickTo;
    rotationX: QuickTo;
    rotationY: QuickTo;
    scaleX: QuickTo;
    scaleY: QuickTo;
  } | null>(null);

  useGSAP(
    () => {
      if (staticMode) return;
      const frame = frameRef.current;
      if (!frame) return;

      const hoverTime = clamp(paramsRef.current.hoverDuration, 0.2, 4);
      const frameTime = clamp(paramsRef.current.motionDuration, 0.12, 1.2);
      const ease = "power3.out";

      gsap.set(frame, {
        force3D: true,
        transformOrigin: "50% 50%",
        transformPerspective: 900,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scaleX: 1.06,
        scaleY: 1.06,
      });

      gsapDriveRef.current = {
        x: gsap.quickTo(motionRef.current, "x", { duration: frameTime, ease }),
        y: gsap.quickTo(motionRef.current, "y", { duration: frameTime, ease }),
        hover: gsap.quickTo(motionRef.current, "hover", {
          duration: hoverTime,
          ease: "power1.inOut",
        }),
        frameX: gsap.quickTo(frame, "x", { duration: frameTime, ease }),
        frameY: gsap.quickTo(frame, "y", { duration: frameTime, ease }),
        rotationX: gsap.quickTo(frame, "rotationX", {
          duration: frameTime,
          ease,
        }),
        rotationY: gsap.quickTo(frame, "rotationY", {
          duration: frameTime,
          ease,
        }),
        scaleX: gsap.quickTo(frame, "scaleX", {
          duration: frameTime,
          ease,
        }),
        scaleY: gsap.quickTo(frame, "scaleY", {
          duration: frameTime,
          ease,
        }),
      };

      return () => {
        const drive = gsapDriveRef.current;
        if (drive) Object.values(drive).forEach(killQuickTo);
        gsapDriveRef.current = null;
        hoverActiveRef.current = false;
        gsap.set(frame, { clearProps: "transform,transformOrigin" });
      };
    },
    {
      dependencies: [staticMode, hoverDuration, motionDuration],
      scope: rootRef,
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (staticMode) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      console.warn("SpectralCard: WebGL2 unavailable — static background shown.");
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return;
    }

    const program = linkProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) return;

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    if (!buffer || !vao) {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    if (!texture) {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      return;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([18, 18, 20, 255]),
    );

    const loc = {
      image: gl.getUniformLocation(program, "u_image"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      time: gl.getUniformLocation(program, "u_time"),
      hover: gl.getUniformLocation(program, "u_hover"),
      imageAspect: gl.getUniformLocation(program, "u_imageAspect"),
      premagnify: gl.getUniformLocation(program, "u_premagnify"),
      magnify: gl.getUniformLocation(program, "u_magnify"),
      fringe: gl.getUniformLocation(program, "u_fringe"),
      warp: gl.getUniformLocation(program, "u_warp"),
      glare: gl.getUniformLocation(program, "u_glare"),
      alpha: gl.getUniformLocation(program, "u_alpha"),
      glow: gl.getUniformLocation(program, "u_glow"),
    };

    let imageAspect = paramsRef.current.mediaRatio ?? 1;
    let disposed = false;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    if (/^https?:\/\//i.test(media)) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      imageAspect =
        paramsRef.current.mediaRatio ??
        img.naturalWidth / Math.max(1, img.naturalHeight);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch (error) {
        console.warn("SpectralCard: texture upload failed.", error);
      }
    };
    img.onerror = () => {
      imageAspect = paramsRef.current.mediaRatio ?? 1;
    };
    img.src = media;

    const start = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    let resizeRaf = 0;
    let visible = true;
    let pageVisible =
      typeof document !== "undefined" ? !document.hidden : true;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(() => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    });
    ro.observe(root);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible = !!entry && entry.isIntersecting && entry.intersectionRatio > 0;
      },
      { threshold: [0, 0.01] },
    );
    io.observe(root);

    const handleVisibility = () => {
      pageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || !pageVisible) return;

      const pointer = motionRef.current;
      const p = paramsRef.current;
      const strength = clamp(p.energy, 0, 1.5);
      const hover = pointer.hover * strength;

      const toneSpec = TONES[p.tone] ?? TONES.ember;
      const [r, g, b] = toneSpec.glow;
      const elapsed = (performance.now() - start) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(loc.image, 0);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform2f(loc.pointer, pointer.x, 1 - pointer.y);
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.hover, clamp(hover, 0, 1));
      gl.uniform1f(loc.imageAspect, p.mediaRatio ?? imageAspect);
      gl.uniform1f(loc.premagnify, clamp(p.restZoom, 0, 0.22));
      gl.uniform1f(loc.magnify, clamp(p.hoverZoom, 0, 0.4) * strength);
      gl.uniform1f(loc.fringe, clamp(p.spectrum, 0, 1.2) * strength);
      gl.uniform1f(loc.warp, clamp(p.displace, 0, 1.2) * strength);
      gl.uniform1f(loc.glare, clamp(p.gloss, 0, 1.2) * strength);
      gl.uniform1f(loc.alpha, clamp(p.alpha, 0, 1));
      gl.uniform3f(loc.glow, r, g, b);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      img.onload = null;
      img.onerror = null;
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, [media, staticMode]);

  const setPointer = (event: ReactPointerEvent<HTMLDivElement>, active: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
    const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5;
    pointerTargetRef.current = {
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1),
      active,
    };
  };

  const updateGsapTargets = (active: boolean) => {
    const drive = gsapDriveRef.current;
    if (!drive) return;

    const target = pointerTargetRef.current;
    const p = paramsRef.current;
    const strength = clamp(p.energy, 0, 1.5);
    const dx = target.x - 0.5;
    const dy = target.y - 0.5;
    const tiltAmount = p.tiltDepth * strength;
    const liftAmount = p.floatRange * strength;

    drive.x(target.x);
    drive.y(target.y);
    if (hoverActiveRef.current !== active) {
      hoverActiveRef.current = active;
      drive.hover(active ? 1 : 0);
    }
    drive.frameX(active ? dx * liftAmount : 0);
    drive.frameY(active ? dy * liftAmount : 0);
    drive.rotationX(active ? -dy * tiltAmount : 0);
    drive.rotationY(active ? dx * tiltAmount : 0);
    const scaleTarget = active ? 1.06 + 0.025 * strength : 1.06;
    drive.scaleX(scaleTarget);
    drive.scaleY(scaleTarget);
  };

  const toneSpec = TONES[tone] ?? TONES.ember;
  const rootStyle: CSSProperties = {
    display: "grid",
    width,
    height,
    overflow: "hidden",
    borderRadius: corner,
    backgroundColor: toneSpec.background,
    backgroundImage: toneSpec.overlay,
    backgroundPosition: "center",
    backgroundSize: "cover",
    perspective: 900,
    isolation: "isolate",
    ...style,
  };

  const frameStyle: CSSProperties = {
    display: "grid",
    gridArea: "1 / 1",
    minWidth: 0,
    minHeight: 0,
    transformStyle: "preserve-3d",
    willChange: staticMode ? "auto" : "transform",
  };

  const layerStyle: CSSProperties = {
    gridArea: "1 / 1",
    minWidth: 0,
    minHeight: 0,
  };

  return (
    <div
      ref={rootRef}
      className={className}
      style={rootStyle}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented && !staticMode) {
          setPointer(event, true);
          updateGsapTargets(true);
        }
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!event.defaultPrevented && !staticMode) {
          setPointer(event, true);
          updateGsapTargets(true);
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        pointerTargetRef.current = { x: 0.5, y: 0.5, active: false };
        updateGsapTargets(false);
      }}
      {...rest}
    >
      <div ref={frameRef} style={frameStyle}>
        {staticMode ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={mediaLabel}
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
            src={media}
            style={{
              ...layerStyle,
              display: "block",
              height: "100%",
              objectFit: "cover",
              userSelect: "none",
              width: "100%",
            }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              display: "block",
              height: "100%",
              pointerEvents: "none",
              width: "100%",
            }}
          />
        )}
        {children && <div style={layerStyle}>{children}</div>}
      </div>
    </div>
  );
}

SpectralCard.displayName = "SpectralCard";
