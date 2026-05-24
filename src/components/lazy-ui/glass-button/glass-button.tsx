"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label or arbitrary inline content. */
  children?: ReactNode;
  /** Turbulence base frequency at rest. Smaller = bigger refraction blobs. @default 0.014 */
  frequency?: number;
  /** Displacement amplitude in CSS pixels at rest. Higher = more shimmer along the button's edges. @default 10 */
  distortion?: number;
  /** Color-matrix tint applied after refraction. @default "cool" */
  tint?: "cool" | "warm" | "none";
  /** Size preset. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Disable the idle pulse + hover acceleration + click wave. Auto on for reduced-motion users. @default false */
  staticGlass?: boolean;
}

const SIZE_CLASS: Record<NonNullable<GlassButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

const TINT_MATRIX: Record<NonNullable<GlassButtonProps["tint"]>, string> = {
  cool: "1 0 0 0 0.01  0 1 0 0 0.01  0 0 1 0 0.04  0 0 0 1 0",
  warm: "1 0 0 0 0.04  0 1 0 0 0.01  0 0 1 0 0.00  0 0 0 1 0",
  none: "1 0 0 0 0     0 1 0 0 0     0 0 1 0 0     0 0 0 1 0",
};

export function GlassButton({
  children,
  frequency = 0.014,
  distortion = 10,
  tint = "cool",
  size = "md",
  staticGlass = false,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  ...rest
}: GlassButtonProps) {
  const reactId = useId();
  const filterId = `glass-btn-${reactId.replace(/:/g, "")}`;
  const reduced = useReducedMotion();
  const animated = !staticGlass && !reduced;

  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Imperative animation refs — we mutate SVG attributes each frame so the
  // edges shimmer and the click wave fire without re-rendering React.
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const clickStartRef = useRef(-Infinity);
  const stateRef = useRef({ hover, active, distortion, frequency });
  useEffect(() => {
    stateRef.current = { hover, active, distortion, frequency };
  }, [hover, active, distortion, frequency]);

  useEffect(() => {
    if (!animated) {
      dispRef.current?.setAttribute("scale", String(distortion));
      turbRef.current?.setAttribute("baseFrequency", String(frequency));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const disp = dispRef.current;
      const turb = turbRef.current;
      if (!disp || !turb) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = (performance.now() - start) / 1000;
      const s = stateRef.current;

      // Idle:   slow 2.5s pulse, small ±2 swing on the displacement.
      // Hover:  fast 1.1s pulse, ±4 swing — edges visibly accelerate.
      // The same multiplier drives the baseFrequency drift, so the noise
      // pattern itself reshapes faster on hover too (not just the amount).
      const speed = s.hover ? 1.8 : 0.6;
      const amp = s.hover ? 4 : 2;
      const base = s.hover ? s.distortion + 3 : s.distortion;
      const pulse = Math.sin(t * speed * Math.PI) * amp;

      // Frequency drift makes the noise blobs slide and reshape over time —
      // without this the displacement strength changes but the edge
      // pattern stays frozen.
      const freqDrift =
        s.frequency + Math.sin(t * speed * Math.PI * 0.6) * (s.frequency * 0.35);
      turb.setAttribute("baseFrequency", freqDrift.toFixed(4));

      // Click wave: a big easeOut spike that decays over 700ms — feels like
      // the whole button briefly flares outward then re-settles.
      const clickAge = (performance.now() - clickStartRef.current) / 1000;
      const wave =
        clickAge < 0 || clickAge > 0.7
          ? 0
          : Math.pow(1 - clickAge / 0.7, 2) * 28;

      // Active hold (pointer down without release yet): tone the
      // displacement down so the button feels "pressed flat" — contrast
      // against the surrounding states.
      const settled = s.active ? Math.max(0, s.distortion - 3) : base + pulse;

      const scale = settled + wave;
      disp.setAttribute("scale", scale.toFixed(2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, distortion, frequency]);

  const handlePointerEnter = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setHover(true);
    onPointerEnter?.(e);
  };
  const handlePointerLeave = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setHover(false);
    setActive(false);
    onPointerLeave?.(e);
  };
  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setActive(true);
    clickStartRef.current = performance.now();
    onPointerDown?.(e);
  };
  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setActive(false);
    onPointerUp?.(e);
  };

  const buttonStyle: CSSProperties = {
    filter: `url(#${filterId})`,
    ...style,
  };

  return (
    <span className="relative inline-flex">
      <svg
        className="pointer-events-none absolute h-0 w-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={filterId}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency={frequency}
              numOctaves={2}
              seed={3}
              result="n"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="n"
              scale={distortion}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feColorMatrix type="matrix" values={TINT_MATRIX[tint]} />
          </filter>
        </defs>
      </svg>

      <button
        type="button"
        data-glass-state={active ? "active" : hover ? "hover" : "idle"}
        className={`relative inline-flex items-center justify-center rounded-full border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.08)_55%,rgba(255,255,255,0.03)_100%)] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.05] hover:border-white/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.15),0_14px_38px_rgba(255,255,255,0.14)] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none active:scale-[0.95] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.25)] ${SIZE_CLASS[size]} ${className ?? ""}`}
        style={buttonStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        {...rest}
      >
        <span className="tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          {children}
        </span>
      </button>
    </span>
  );
}

GlassButton.displayName = "GlassButton";
