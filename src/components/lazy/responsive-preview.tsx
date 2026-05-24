"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  CurvedHandle,
  DesktopIcon,
  MobileIcon,
  RefreshIcon,
  TabletIcon,
} from "./component-detail/icons";
import {
  DEVICE_WIDTHS,
  MIN_PREVIEW_WIDTH,
  deviceFromViewport,
  type Device,
} from "./component-detail/stage";
import { DeviceButton } from "./component-detail/toolbar";

export interface ResponsivePreviewFrameProps {
  /** What renders inside the frame. */
  children: ReactNode;
  /** Minimum stage height in px. @default 560 */
  minHeight?: number;
  /**
   * Maximum stage height in px. When set, the stage scrolls vertically once
   * the preview is taller than this. Omit (or pass `null`) for no cap.
   */
  maxHeight?: number | null;
  /** Slot rendered in the toolbar before the device picker (left side). */
  toolbarLeft?: ReactNode;
  /** Extra controls after the reset button (right side). */
  toolbarRight?: ReactNode;
  /** Optional extra class on the root wrapper. */
  className?: string;
}

/**
 * Wraps a preview with the same responsive controls used on /components/<slug>:
 *  - Device preset picker (desktop / tablet / mobile)
 *  - Drag handle with spring-back bend physics
 *  - Refresh that re-mounts the preview (replays motion)
 *  - Width label while dragging
 *
 * Self-contained — drop `<ResponsivePreviewFrame>{anything}</ResponsivePreviewFrame>`
 * anywhere a sized preview is needed.
 */
export function ResponsivePreviewFrame({
  children,
  minHeight = 560,
  maxHeight = null,
  toolbarLeft,
  toolbarRight,
  className,
}: ResponsivePreviewFrameProps) {
  const [width, setWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);

  // Spring-back bend physics on the drag handle.
  const [bend, setBend] = useState(0);
  const [hoverHandle, setHoverHandle] = useState(false);
  const bendRef = useRef(0);
  const lastPointerRef = useRef<{ x: number; t: number } | null>(null);
  const springRafRef = useRef<number | null>(null);

  const writeBend = useCallback((v: number) => {
    bendRef.current = v;
    setBend(v);
  }, []);

  const cancelSpring = useCallback(() => {
    if (springRafRef.current !== null) {
      cancelAnimationFrame(springRafRef.current);
      springRafRef.current = null;
    }
  }, []);

  const startSpringBack = useCallback(() => {
    cancelSpring();
    const startTime = performance.now();
    const startBend = bendRef.current;
    if (Math.abs(startBend) < 0.5) {
      writeBend(0);
      return;
    }
    const omega = 14;
    const zeta = 0.28;
    const tick = (now: number) => {
      const t = (now - startTime) / 1000;
      const value =
        startBend * Math.cos(omega * t) * Math.exp(-zeta * omega * t);
      writeBend(value);
      if (t < 1.8 && Math.abs(value) > 0.15) {
        springRafRef.current = requestAnimationFrame(tick);
      } else {
        writeBend(0);
        springRafRef.current = null;
      }
    };
    springRafRef.current = requestAnimationFrame(tick);
  }, [cancelSpring, writeBend]);

  useEffect(() => cancelSpring, [cancelSpring]);

  // Auto-select initial device based on the user's actual viewport so mobile
  // visitors don't land on the full-width desktop preset. Runs once on mount
  // to avoid overriding subsequent user choices.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setWidth(DEVICE_WIDTHS[deviceFromViewport(window.innerWidth)]);
  }, []);

  // Track rendered frame width so the label reads correctly during full-width.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const frame = stage.querySelector<HTMLDivElement>("[data-preview-frame]");
    if (!frame) return;
    if (typeof ResizeObserver === "undefined") {
      setRenderedWidth(frame.offsetWidth);
      return;
    }
    const ro = new ResizeObserver(() => setRenderedWidth(frame.offsetWidth));
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  const activeDevice: Device | null = useMemo(() => {
    if (width === null) return "desktop";
    if (width === DEVICE_WIDTHS.tablet) return "tablet";
    if (width === DEVICE_WIDTHS.mobile) return "mobile";
    return null;
  }, [width]);

  const setDevice = (d: Device) => setWidth(DEVICE_WIDTHS[d]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    cancelSpring();
    const stage = stageRef.current;
    if (!stage) return;
    const startRect = stage.getBoundingClientRect();
    const startWidth =
      width ??
      stage.querySelector<HTMLDivElement>("[data-preview-frame]")?.offsetWidth ??
      startRect.width;
    setWidth(startWidth);
    draggingRef.current = true;
    setDragging(true);
    lastPointerRef.current = { x: e.clientX, t: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const next = Math.max(
      MIN_PREVIEW_WIDTH,
      Math.min(rect.width, e.clientX - rect.left),
    );
    setWidth(next);
    const now = performance.now();
    const last = lastPointerRef.current;
    if (last) {
      const dt = Math.max(8, now - last.t);
      const dx = e.clientX - last.x;
      const velocity = dx / dt;
      const target = Math.max(-22, Math.min(22, velocity * 30));
      writeBend(target);
    }
    lastPointerRef.current = { x: e.clientX, t: now };
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    lastPointerRef.current = null;
    startSpringBack();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const reset = useCallback(() => {
    setWidth(null);
    setPreviewKey((k) => k + 1);
  }, []);

  // When the stage scrolls vertically (maxHeight set), the absolutely-positioned
  // handle/label scroll with content. Hide them — the device picker is enough.
  const showResizeAffordances = maxHeight === null;

  return (
    <div className={`responsive-preview${className ? ` ${className}` : ""}`}>
      <div className="responsive-preview-toolbar">
        <div className="responsive-preview-toolbar-l">{toolbarLeft}</div>
        <div className="responsive-preview-toolbar-r">
          <div
            role="group"
            aria-label="Preview device"
            className="responsive-preview-devices"
          >
            <DeviceButton
              active={activeDevice === "desktop"}
              onClick={() => setDevice("desktop")}
              label="Desktop (full)"
            >
              <DesktopIcon />
            </DeviceButton>
            <DeviceButton
              active={activeDevice === "tablet"}
              onClick={() => setDevice("tablet")}
              label="Tablet (768px)"
            >
              <TabletIcon />
            </DeviceButton>
            <DeviceButton
              active={activeDevice === "mobile"}
              onClick={() => setDevice("mobile")}
              label="Mobile (320px)"
            >
              <MobileIcon />
            </DeviceButton>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset preview"
            title="Reset preview"
            className="responsive-preview-reset"
          >
            <RefreshIcon />
          </button>
          {toolbarRight}
        </div>
      </div>

      <div
        ref={stageRef}
        className="responsive-preview-stage"
        data-scrollable={maxHeight !== null ? "true" : "false"}
        style={
          {
            minHeight,
            // Exposed so children (e.g. the loading skeleton) can fill the
            // stage's visible height even when the frame is in scroll mode
            // and has no explicit `height` for `100%` to resolve against.
            "--responsive-stage-min": `${minHeight}px`,
            ...(maxHeight !== null
              ? { maxHeight, overflowY: "auto" as const }
              : null),
          } as CSSProperties
        }
      >
        <div aria-hidden className="responsive-preview-grid" />

        <div
          data-preview-frame
          className="responsive-preview-frame"
          style={{
            width: width === null ? "100%" : `${width}px`,
            transition: dragging ? "none" : "width 0.3s ease-in-out",
          }}
        >
          <div key={previewKey} className="responsive-preview-content">
            {children}
          </div>
        </div>

        {showResizeAffordances && (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize preview"
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              onMouseEnter={() => setHoverHandle(true)}
              onMouseLeave={() => setHoverHandle(false)}
              className={`responsive-preview-handle${
                dragging || hoverHandle ? " is-hot" : ""
              }`}
              style={{
                left: width === null ? "100%" : `${width}px`,
                transition: dragging ? "none" : "left 0.3s ease-in-out",
              }}
            >
              <CurvedHandle bend={bend} glow={dragging || hoverHandle} />
            </div>

            <div
              className={`responsive-preview-width${dragging ? " is-visible" : ""}`}
            >
              {Math.round(width ?? renderedWidth ?? 0)}px
            </div>
          </>
        )}
      </div>
    </div>
  );
}
