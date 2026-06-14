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
  /** Size preset — controls padding and text size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Roll the label up to a fresh copy on hover. Disabled for reduced-motion. @default true */
  roll?: boolean;
  /** Faint cast on the frosted fill + sheen. @default "neutral" */
  tint?: "neutral" | "cool" | "warm";
  /** Refraction strength in CSS px — how hard the glass bends the background behind it. @default 14 */
  distortion?: number;
  /** Turbulence base frequency. Smaller = larger, more lens-like ripples. @default 0.009 */
  frequency?: number;
  /** Freeze the liquid drift so the refraction is static. Auto-on for reduced-motion. @default false */
  staticGlass?: boolean;
}

const SIZE: Record<
  NonNullable<GlassButtonProps["size"]>,
  { pad: string; line: string; text: string }
> = {
  sm: { pad: "px-5 py-2.5", line: "h-4", text: "text-xs" },
  md: { pad: "px-7 py-3", line: "h-5", text: "text-sm" },
  lg: { pad: "px-9 py-3.5", line: "h-6", text: "text-base" },
};

// Low-opacity fills so the refracted background bleeds through the glass.
const TINT: Record<NonNullable<GlassButtonProps["tint"]>, string> = {
  neutral: "rgba(255, 255, 255, 0.16)",
  cool: "rgba(222, 233, 255, 0.18)",
  warm: "rgba(255, 240, 224, 0.18)",
};

export function GlassButton({
  children,
  size = "md",
  roll = true,
  tint = "neutral",
  distortion = 14,
  frequency = 0.009,
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

  const s = SIZE[size];
  const [hover, setHover] = useState(false);

  // Imperative refs — we mutate the filter each frame so the backdrop ripples
  // without re-rendering React.
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const clickStartRef = useRef(-Infinity);
  const stateRef = useRef({ hover, distortion, frequency });
  useEffect(() => {
    stateRef.current = { hover, distortion, frequency };
  }, [hover, distortion, frequency]);

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
      const st = stateRef.current;

      // Idle: slow drift, small swing. Hover: faster, wider — the background
      // visibly churns under the glass.
      const speed = st.hover ? 1.6 : 0.5;
      const amp = st.hover ? 4 : 2;
      const base = st.hover ? st.distortion + 4 : st.distortion;
      const pulse = Math.sin(t * speed * Math.PI) * amp;

      // Frequency drift reshapes the ripple pattern over time, not just its
      // amount — without it the blobs stay frozen.
      const freqDrift =
        st.frequency + Math.sin(t * speed * Math.PI * 0.6) * (st.frequency * 0.3);
      turb.setAttribute("baseFrequency", freqDrift.toFixed(4));

      // Click wave: a big easeOut spike that decays over 700ms — the glass
      // flares then re-settles.
      const clickAge = (performance.now() - clickStartRef.current) / 1000;
      const wave =
        clickAge < 0 || clickAge > 0.7
          ? 0
          : Math.pow(1 - clickAge / 0.7, 2) * 24;

      disp.setAttribute("scale", (base + pulse + wave).toFixed(2));
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
    onPointerLeave?.(e);
  };
  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    clickStartRef.current = performance.now();
    onPointerDown?.(e);
  };
  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    onPointerUp?.(e);
  };

  // `url(#id)` on backdrop-filter displaces the BACKDROP (whatever is painted
  // behind the button), so the glass refracts the page/background it sits over.
  const glassStyle: CSSProperties = {
    backgroundColor: TINT[tint],
    backdropFilter: `blur(2px) url(#${filterId})`,
    WebkitBackdropFilter: `blur(2px) url(#${filterId})`,
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
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency={frequency}
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="1.2" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale={distortion}
              xChannelSelector="R"
              yChannelSelector="G"
              ref={dispRef}
            />
          </filter>
        </defs>
      </svg>

      <button
        type="button"
        className={`group relative inline-flex overflow-hidden rounded-full border border-white/40 ${s.pad} outline-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(0,0,0,0.12),0_10px_24px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.12)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-white/55 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-2px_8px_rgba(0,0,0,0.12),0_16px_34px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 active:scale-[0.97] ${className ?? ""}`}
        style={glassStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        {...rest}
      >
        {/* Translucent sheen for the beveled rim — never occludes the refraction. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.14)_100%)]"
        />
        <span
          className={`relative z-10 block overflow-hidden ${s.line} ${s.text} font-semibold tracking-[-0.01em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}
        >
          <span
            className={`flex flex-col ${
              roll
                ? "motion-safe:transition-transform motion-safe:duration-[400ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-y-1/2"
                : ""
            }`}
          >
            <span
              className={`flex ${s.line} items-center justify-center whitespace-nowrap`}
            >
              {children}
            </span>
            <span
              aria-hidden
              className={`flex ${s.line} items-center justify-center whitespace-nowrap`}
            >
              {children}
            </span>
          </span>
        </span>
      </button>
    </span>
  );
}

GlassButton.displayName = "GlassButton";
