"use client";

import * as React from "react";

type ImageZoomVars = React.CSSProperties & {
  "--image-zoom-x"?: string;
  "--image-zoom-y"?: string;
};

type ImageZoomProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  zoomScale?: number;
  duration?: number;
  easing?: string;
  zoomOnClick?: boolean;
  zoomOnHover?: boolean;
  disabled?: boolean;
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
  edgeBlur?: boolean;
  edgeBlurAmount?: number;
  focusRadius?: number;
  children: React.ReactElement;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Credit: inspired by Animate UI Image Zoom.
 * https://animate-ui.com/docs/primitives/effects/image-zoom
 */
export function ImageZoom({
  children,
  zoomScale = 2.6,
  duration = 420,
  easing = EASE,
  style,
  className,
  zoomOnClick = true,
  zoomOnHover = true,
  disabled = false,
  width = "100%",
  height = "100%",
  edgeBlur = true,
  edgeBlurAmount = 10,
  focusRadius = 42,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onClick,
  ...props
}: ImageZoomProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [zoomed, setZoomed] = React.useState(false);

  const setFocus = React.useCallback((point: { clientX: number; clientY: number }) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const x = clamp(((point.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((point.clientY - rect.top) / rect.height) * 100, 0, 100);

    root.style.setProperty("--image-zoom-x", `${x}%`);
    root.style.setProperty("--image-zoom-y", `${y}%`);
  }, []);

  const active = !disabled && zoomed;
  const interactive = !disabled && (zoomOnClick || zoomOnHover);
  const safeDuration = Math.max(0, duration);
  const safeScale = Math.max(1, zoomScale);
  const safeBlur = Math.max(0, edgeBlurAmount);
  const radius = clamp(focusRadius, 18, 72);
  const blurStart = Math.min(100, radius + 6);
  const blurEnd = Math.min(100, radius + 24);
  const focusMask =
    `radial-gradient(circle at var(--image-zoom-x) var(--image-zoom-y), ` +
    `transparent 0%, transparent ${radius}%, ` +
    `rgba(0, 0, 0, 0.35) ${blurStart}%, ` +
    `rgba(0, 0, 0, 0.9) ${blurEnd}%, black 100%)`;
  const rootStyle: ImageZoomVars = {
    "--image-zoom-x": "50%",
    "--image-zoom-y": "50%",
    position: "relative",
    overflow: "hidden",
    width,
    height,
    touchAction: interactive ? "none" : "auto",
    cursor: !interactive ? "default" : active ? "zoom-out" : "zoom-in",
    ...style,
  };

  return (
    <div
      ref={rootRef}
      className={className}
      style={rootStyle}
      data-zoomed={active ? "" : undefined}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.defaultPrevented || disabled) return;
        setFocus(event);
        if (zoomOnHover && event.pointerType !== "touch") setZoomed(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (event.defaultPrevented || disabled) return;
        if (zoomOnHover && event.pointerType !== "touch") setZoomed(false);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!event.defaultPrevented && !disabled) setFocus(event);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || disabled) return;
        setFocus(event);
        if (!zoomOnClick && event.pointerType === "touch") setZoomed(true);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!event.defaultPrevented && !zoomOnClick) setZoomed(false);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (!event.defaultPrevented && !zoomOnClick) setZoomed(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled || !zoomOnClick) return;
        setFocus(event);
        setZoomed((value) => !value);
      }}
      {...props}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translateZ(0) scale(${active ? safeScale : 1})`,
          transformOrigin: "var(--image-zoom-x) var(--image-zoom-y)",
          transition:
            `transform ${safeDuration}ms ${easing}, ` +
            `transform-origin 180ms ${easing}`,
          willChange: active ? "transform" : "auto",
        }}
      >
        {children}
      </div>

      {edgeBlur && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: active ? 1 : 0,
            backdropFilter: `blur(${safeBlur}px)`,
            WebkitBackdropFilter: `blur(${safeBlur}px)`,
            maskImage: focusMask,
            WebkitMaskImage: focusMask,
            transition: `opacity ${Math.min(safeDuration, 280)}ms ${easing}`,
            backgroundColor: "rgba(0,0,0,.12)",
            backgroundImage:
              `radial-gradient(circle at var(--image-zoom-x) var(--image-zoom-y), ` +
              `transparent 0%, transparent ${radius}%, ` +
              `rgba(0,0,0,.06) ${blurStart}%, ` +
              `rgba(0,0,0,.18) ${blurEnd}%, rgba(0,0,0,.28) 100%)`,
          }}
        />
      )}
    </div>
  );
}

type ImageProps<T extends React.ElementType = "img"> = {
  objectFit?: React.CSSProperties["objectFit"];
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

export function Image<T extends React.ElementType = "img">({
  objectFit = "cover",
  as,
  style,
  ...props
}: ImageProps<T>) {
  const Component = as ?? "img";

  return (
    <Component
      draggable={false}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit,
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
      {...props}
    />
  );
}
