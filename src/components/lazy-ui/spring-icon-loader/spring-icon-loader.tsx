"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export const SPRING_ICON_LOADER_DEFAULT_ICONS = [
  "/images/loading/1.png",
  "/images/loading/2.png",
  "/images/loading/3.png",
] as const;

export type SpringIconLoaderIcon =
  | string
  | {
      src: string;
      alt?: string;
    };

export type SpringIconLoaderImage = {
  src: string;
  alt: string;
};

export type SpringIconLoaderEvent = {
  icon: SpringIconLoaderImage;
  index: number;
  cycle: number;
};

export type SpringIconTransition = "fade" | "blur" | "none";

export type SpringIconLoaderClassNames = {
  stage?: string;
  icon?: string;
  body?: string;
  image?: string;
  shadow?: string;
};

export type SpringIconLoaderProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /** Image URLs rendered as the bouncing loader icons. */
  icons?: readonly SpringIconLoaderIcon[];
  /** Keeps the loop running. Set to false when the loading work is complete. @default true */
  loading?: boolean;
  /** Initial icon index. @default 0 */
  initialIndex?: number;
  /** Icon box size in CSS pixels. @default 48 */
  size?: number;
  /** Apex height measured from the landing point in CSS pixels. @default 58 */
  bounceHeight?: number;
  /** Downward acceleration in px/s2. Higher values make each hop faster. @default 1550 */
  gravity?: number;
  /** How long the icon compresses on the ground before launching again. @default 0.09 */
  impactHold?: number;
  /** Squash amount applied on landing, from 0 to 0.35. @default 0.12 */
  squash?: number;
  /** Stretch amount applied while the icon is moving fast. @default 0.1 */
  stretch?: number;
  /** Side-to-side rotation in degrees while the icon is airborne. @default 7 */
  tilt?: number;
  /** Fade style used when the image swaps at impact. @default "blur" */
  iconTransition?: SpringIconTransition;
  /** Accessible label for the loader root. @default "Loading" */
  label?: string;
  /** CSS color used for the ground shadow. @default "#94a3b8" */
  shadowColor?: string;
  /** Master opacity of the ground shadow at landing. @default 0.46 */
  shadowOpacity?: number;
  /** Smallest shadow scale at the apex. @default 0.38 */
  shadowMinScale?: number;
  /** Shadow opacity at the landing point. Defaults to `shadowOpacity`. */
  shadowMaxOpacity?: number;
  /** Shadow opacity near the apex. @default 0.08 */
  shadowMinOpacity?: number;
  /** Fired exactly when the icon touches the ground, after the index advances. */
  onIconChange?: (event: SpringIconLoaderEvent) => void;
  /** Fired on every landing, including single-icon loops. */
  onBounce?: (event: SpringIconLoaderEvent) => void;
  /** Fired once when `loading` changes from true to false. */
  onComplete?: (event: SpringIconLoaderEvent) => void;
  /** Slot-level class overrides. */
  classNames?: SpringIconLoaderClassNames;
};

const DEFAULT_SIZE = 48;
const DEFAULT_BOUNCE_HEIGHT = 58;
const DEFAULT_GRAVITY = 1550;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function normalizeIcon(icon: SpringIconLoaderIcon): SpringIconLoaderImage {
  if (typeof icon === "string") return { src: icon, alt: "" };
  return { src: icon.src, alt: icon.alt ?? "" };
}

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

function transitionFor(mode: SpringIconTransition, reduced: boolean) {
  if (mode === "none" || reduced) {
    return {
      initial: false,
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    } as const;
  }

  if (mode === "fade") {
    return {
      initial: { opacity: 0, scale: 0.98, filter: "blur(0px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, scale: 1.02, filter: "blur(0px)" },
      transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
    } as const;
  }

  return {
    initial: { opacity: 0, scale: 0.88, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.08, filter: "blur(7px)" },
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  } as const;
}

export function SpringIconLoader({
  icons = SPRING_ICON_LOADER_DEFAULT_ICONS,
  loading = true,
  initialIndex = 0,
  size = DEFAULT_SIZE,
  bounceHeight = DEFAULT_BOUNCE_HEIGHT,
  gravity = DEFAULT_GRAVITY,
  impactHold = 0.09,
  squash = 0.12,
  stretch = 0.1,
  tilt = 7,
  iconTransition = "blur",
  label = "Loading",
  shadowColor = "#94a3b8",
  shadowOpacity = 0.46,
  shadowMinScale = 0.38,
  shadowMaxOpacity,
  shadowMinOpacity = 0.08,
  className,
  classNames,
  style,
  onIconChange,
  onBounce,
  onComplete,
  ...props
}: SpringIconLoaderProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const iconRef = React.useRef<HTMLDivElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const shadowRef = React.useRef<HTMLSpanElement | null>(null);
  const normalizedIcons = React.useMemo(
    () => icons.map(normalizeIcon).filter((icon) => icon.src.length > 0),
    [icons],
  );
  const iconsKey = React.useMemo(
    () => normalizedIcons.map((icon) => icon.src).join("|"),
    [normalizedIcons],
  );
  const [currentIndex, setCurrentIndex] = React.useState(() =>
    wrapIndex(initialIndex, normalizedIcons.length),
  );
  const indexRef = React.useRef(currentIndex);
  const cycleRef = React.useRef(0);
  const completeFiredRef = React.useRef(false);
  const onIconChangeRef = useLatest(onIconChange);
  const onBounceRef = useLatest(onBounce);
  const onCompleteRef = useLatest(onComplete);

  const iconCount = normalizedIcons.length;
  const resolvedIndex = iconCount > 0 ? wrapIndex(currentIndex, iconCount) : 0;
  const currentIcon = normalizedIcons[resolvedIndex];
  const safeSize = Math.max(18, size);
  const safeBounceHeight = Math.max(12, bounceHeight);
  const safeGravity = Math.max(200, gravity);
  const safeImpactHold = clamp(impactHold, 0.03, 0.28);
  const safeSquash = clamp(squash, 0, 0.35);
  const safeStretch = clamp(stretch, 0, 0.24);
  const safeTilt = clamp(tilt, 0, 18);
  const safeShadowMaxOpacity = clamp(
    shadowMaxOpacity ?? shadowOpacity,
    0,
    1,
  );
  const safeShadowMinOpacity = clamp(shadowMinOpacity, 0, safeShadowMaxOpacity);
  const shadowHeight = Math.max(9, safeSize * 0.18);
  const groundInset = Math.max(8, safeSize * 0.16);
  const stageWidth = Math.max(safeSize * 1.7, safeSize + 28);
  const stageHeight = safeBounceHeight + safeSize + groundInset + shadowHeight;
  const imageMotion = transitionFor(iconTransition, Boolean(reducedMotion));

  useGSAP(
    () => {
      const icon = iconRef.current;
      const body = bodyRef.current;
      const shadow = shadowRef.current;
      if (!icon || !body || !shadow || iconCount === 0) return;

      const emitComplete = () => {
        if (completeFiredRef.current) return;
        completeFiredRef.current = true;
        const index = wrapIndex(indexRef.current, iconCount);
        const event = {
          icon: normalizedIcons[index],
          index,
          cycle: cycleRef.current,
        };
        onCompleteRef.current?.(event);
      };

      gsap.set(icon, {
        xPercent: -50,
        y: 0,
      });
      gsap.set(body, {
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        transformOrigin: "50% 100%",
      });
      gsap.set(shadow, {
        xPercent: -50,
        scaleX: safeShadowMaxOpacity > 0 ? 1 : 0,
        autoAlpha: safeShadowMaxOpacity,
        transformOrigin: "50% 50%",
      });

      if (!loading || reducedMotion) {
        if (!loading) emitComplete();
        return;
      }

      completeFiredRef.current = false;

      const setY = gsap.quickSetter(icon, "y", "px");
      const setBodyScaleX = gsap.quickSetter(body, "scaleX");
      const setBodyScaleY = gsap.quickSetter(body, "scaleY");
      const setBodyRotation = gsap.quickSetter(body, "rotation", "deg");
      const setShadowScale = gsap.quickSetter(shadow, "scaleX");
      const setShadowAlpha = gsap.quickSetter(shadow, "autoAlpha");
      const launchVelocity = Math.sqrt(2 * safeGravity * safeBounceHeight);
      const flightDuration = (launchVelocity * 2) / safeGravity;
      let y = 0;
      let velocity = -launchVelocity;
      let flightElapsed = 0;
      let phase: "flight" | "impact" = "flight";
      let impactElapsed = 0;
      let lastTime = gsap.ticker.time;
      let impactTween: gsap.core.Timeline | null = null;

      const advanceAtImpact = () => {
        const previousIndex = wrapIndex(indexRef.current, iconCount);
        const nextIndex = wrapIndex(previousIndex + 1, iconCount);
        const nextCycle = cycleRef.current + 1;
        indexRef.current = nextIndex;
        cycleRef.current = nextCycle;
        setCurrentIndex(nextIndex);

        const event = {
          icon: normalizedIcons[nextIndex],
          index: nextIndex,
          cycle: nextCycle,
        };
        if (nextIndex !== previousIndex) onIconChangeRef.current?.(event);
        onBounceRef.current?.(event);
      };

      const playImpact = () => {
        impactTween?.kill();
        impactTween = gsap
          .timeline({ defaults: { overwrite: "auto" } })
          .to(body, {
            rotation: 0,
            scaleX: 1 + safeSquash,
            scaleY: 1 - safeSquash,
            duration: safeImpactHold * 0.55,
            ease: "power3.out",
          })
          .to(body, {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            duration: 0.38,
            ease: "elastic.out(0.8, 0.46)",
          });
      };

      const tick = (time: number) => {
        const dt = clamp(time - lastTime, 0, 0.034);
        lastTime = time;

        if (phase === "impact") {
          impactElapsed += dt;
          if (impactElapsed >= safeImpactHold) {
            phase = "flight";
            flightElapsed = 0;
            velocity = -launchVelocity;
          }
          return;
        }

        flightElapsed += dt;
        velocity = -launchVelocity + safeGravity * flightElapsed;
        y = -launchVelocity * flightElapsed + 0.5 * safeGravity * flightElapsed ** 2;

        if (flightElapsed >= flightDuration || y >= 0) {
          y = 0;
          setY(0);
          setBodyScaleX(1);
          setBodyScaleY(1);
          setBodyRotation(0);
          setShadowScale(1);
          setShadowAlpha(safeShadowMaxOpacity);
          advanceAtImpact();
          playImpact();
          phase = "impact";
          impactElapsed = 0;
          return;
        }

        const heightRatio = clamp(-y / safeBounceHeight, 0, 1);
        const easedHeight = Math.sin(heightRatio * Math.PI * 0.5);
        const speedRatio = clamp(Math.abs(velocity) / launchVelocity, 0, 1);
        const stretchAmount = safeStretch * Math.pow(speedRatio, 1.35);
        const progress = clamp(flightElapsed / flightDuration, 0, 1);
        const tiltDirection = cycleRef.current % 2 === 0 ? 1 : -1;
        const rotation = tiltDirection * safeTilt * Math.sin(progress * Math.PI);
        setY(y);
        setBodyScaleX(1 - stretchAmount * 0.42);
        setBodyScaleY(1 + stretchAmount);
        setBodyRotation(rotation);
        setShadowScale(lerp(1, shadowMinScale, easedHeight));
        setShadowAlpha(
          lerp(safeShadowMaxOpacity, safeShadowMinOpacity, easedHeight),
        );
      };

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        impactTween?.kill();
        gsap.killTweensOf(icon);
        gsap.killTweensOf(body);
        gsap.killTweensOf(shadow);
      };
    },
    {
      scope: rootRef,
      dependencies: [
        loading,
        reducedMotion,
        iconsKey,
        iconCount,
        safeBounceHeight,
        safeGravity,
        safeImpactHold,
        safeSquash,
        safeStretch,
        safeTilt,
        safeShadowMaxOpacity,
        safeShadowMinOpacity,
        shadowMinScale,
      ],
      revertOnUpdate: true,
    },
  );

  if (!currentIcon) return null;

  return (
    <div
      ref={rootRef}
      role={loading ? "status" : undefined}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-grid select-none place-items-center overflow-visible",
        className,
      )}
      style={{
        width: stageWidth,
        height: stageHeight,
        ...style,
      }}
      {...props}
    >
      <div
        className={cn("relative overflow-visible", classNames?.stage)}
        style={{ width: stageWidth, height: stageHeight }}
      >
        <div
          ref={iconRef}
          className={cn(
            "absolute left-1/2 grid place-items-center overflow-visible",
            classNames?.icon,
          )}
          style={{
            bottom: groundInset + shadowHeight,
            width: safeSize,
            height: safeSize,
            willChange: "transform",
          }}
        >
          <div
            ref={bodyRef}
            className={cn(
              "relative h-full w-full overflow-visible",
              classNames?.body,
            )}
            style={{ willChange: "transform" }}
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={`${currentIcon.src}-${resolvedIndex}`}
                src={currentIcon.src}
                alt={currentIcon.alt}
                draggable={false}
                className={cn(
                  "absolute inset-0 h-full w-full object-contain",
                  classNames?.image,
                )}
                style={{ willChange: "opacity, transform, filter" }}
                {...imageMotion}
              />
            </AnimatePresence>
          </div>
        </div>
        <span
          ref={shadowRef}
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 rounded-full",
            classNames?.shadow,
          )}
          style={{
            bottom: groundInset,
            width: safeSize * 0.98,
            height: shadowHeight,
            background: shadowColor,
            filter: `blur(${Math.max(6, safeSize * 0.16)}px)`,
            maskImage:
              "radial-gradient(ellipse at center, #000 0%, rgba(0,0,0,0.72) 42%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 0%, rgba(0,0,0,0.72) 42%, transparent 72%)",
            willChange: "transform, opacity",
          }}
        />
      </div>
    </div>
  );
}
