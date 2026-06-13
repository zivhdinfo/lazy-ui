"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Video as VideoIcon } from "lucide-react";

import { GridBackground } from "@/components/lazy-ui/grid-background";

import type { CustomizeValues } from "../customize";
import {
  CurvedHandle,
  DesktopIcon,
  MobileIcon,
  RefreshIcon,
  TabletIcon,
} from "../component-detail/icons";
import {
  exportPreviewVideo,
  isPreviewVideoExportSupported,
} from "../component-detail/preview-video-export";
import {
  DEVICE_WIDTHS,
  MIN_PREVIEW_WIDTH,
  deviceFromViewport,
  type Device,
} from "../component-detail/stage";
import { DeviceButton } from "../component-detail/toolbar";

import type { ComponentView as ComponentViewConfig, ViewFrame } from "./types";

const VIDEO_DURATION_MS = 5000;

export function PreviewStage({
  view,
  values,
  stageMinHeight,
  slug,
  responsive,
  isBlock,
  toolbarLeft,
}: {
  view: ComponentViewConfig | undefined;
  values: CustomizeValues;
  stageMinHeight: number;
  slug: string;
  responsive?: boolean;
  isBlock: boolean;
  toolbarLeft?: ReactNode;
}) {
  const [width, setWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);

  const [bend, setBend] = useState(0);
  const [hoverHandle, setHoverHandle] = useState(false);

  const [canRecord, setCanRecord] = useState(false);
  const [hasCanvas, setHasCanvas] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const showDevices = responsive ?? (isBlock || hasCanvas || hasImage);
  const showRecord = canRecord && (hasCanvas || view?.record === true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const bendRef = useRef(0);
  const lastPointerRef = useRef<{ x: number; t: number } | null>(null);
  const springRafRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    if (!showDevices || typeof window === "undefined") return;
    const raf = requestAnimationFrame(() => {
      setWidth(DEVICE_WIDTHS[deviceFromViewport(window.innerWidth)]);
    });
    return () => cancelAnimationFrame(raf);
  }, [showDevices]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setCanRecord(isPreviewVideoExportSupported());
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const check = () => {
      setHasCanvas(!!frame.querySelector("canvas"));
      setHasImage(!!frame.querySelector("img"));
    };
    const raf = requestAnimationFrame(check);
    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(check)
        : null;
    mo?.observe(frame, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      mo?.disconnect();
    };
  }, [view]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const frame = frameRef.current;
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
    const startWidth =
      width ?? frameRef.current?.offsetWidth ?? stage.getBoundingClientRect().width;
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
    } catch {}
  };

  const reset = useCallback(() => {
    setWidth(null);
    setPreviewKey((k) => k + 1);
  }, []);

  const cancelRecording = useCallback(() => abortRef.current?.abort(), []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    const frame = frameRef.current;
    if (!frame || !canRecord) return;
    const canvas = frame.querySelector("canvas");
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);
    setIsRecording(true);
    try {
      await exportPreviewVideo({
        frame,
        canvas,
        slug,
        durationMs: VIDEO_DURATION_MS,
        fps: 60,
        signal: controller.signal,
        onProgress: setProgress,
      });
    } catch {
      setProgress(0);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsRecording(false);
      setProgress(0);
    }
  }, [isRecording, canRecord, slug]);

  const remainingSeconds = Math.max(
    0,
    Math.ceil((VIDEO_DURATION_MS * (100 - progress)) / 100 / 1000),
  );

  return (
    <>
      <div className="cv-toolbar">
        <div className="cv-toolbar-left">{toolbarLeft}</div>
        <div className="cv-toolbar-right">
          {showDevices && (
            <div className="cv-devices" role="group" aria-label="Preview device">
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
          )}
          <button
            type="button"
            onClick={reset}
            aria-label="Reset preview"
            title="Reset preview"
            className="cv-stage-btn"
          >
            <RefreshIcon />
          </button>
          {(showRecord || isRecording) && (
            <button
              type="button"
              onClick={isRecording ? cancelRecording : startRecording}
              aria-label={
                isRecording
                  ? "Cancel video export"
                  : "Export preview as 5 second WebM"
              }
              title={
                isRecording
                  ? "Cancel video export"
                  : "Export preview as 5 second WebM"
              }
              className={`cv-record-btn${isRecording ? " is-recording" : ""}`}
            >
              {isRecording && (
                <span
                  className="cv-record-fill"
                  style={{ width: `${progress}%` }}
                  aria-hidden
                />
              )}
              <VideoIcon className="cv-record-icon" aria-hidden />
              {isRecording && (
                <span className="cv-record-time">{remainingSeconds}s</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div
        ref={stageRef}
        className="cv-stage"
        style={{ "--cv-stage-h": `${stageMinHeight}px` } as CSSProperties}
      >
        <GridBackground
          variant="dots"
          size={20}
          dotSize={3}
          color="var(--preview-grid)"
        />
        <div
          ref={frameRef}
          data-preview-frame
          className={`cv-frame${view?.frame === "block" ? " is-flow" : ""}`}
          style={{
            width: width === null ? "100%" : `${width}px`,
            transition: dragging ? "none" : "width 0.3s var(--ease-out)",
          }}
        >
          <div key={previewKey} className="cv-frame-pad">
            {view ? (
              <LiveRender view={view} values={values} />
            ) : (
              <div className="flex w-full items-center justify-center">
                <PreviewPlaceholder />
              </div>
            )}
          </div>
        </div>

        {showDevices && (
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
              className={`cv-handle${dragging || hoverHandle ? " is-hot" : ""}`}
              style={{
                left: width === null ? "100%" : `min(${width}px, 100%)`,
                transition: dragging ? "none" : "left 0.3s var(--ease-out)",
              }}
            >
              <CurvedHandle bend={bend} glow={dragging || hoverHandle} />
            </div>

            <div className={`cv-width-label${dragging ? " is-visible" : ""}`}>
              {Math.round(width ?? renderedWidth ?? 0)}px
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LiveRender({
  view,
  values,
}: {
  view: ComponentViewConfig;
  values: CustomizeValues;
}) {
  const Dynamic = useMemo<ComponentType<Record<string, unknown>> | null>(() => {
    if (view.render) return null;
    return dynamic(
      () =>
        view.load().then(
          (m) => m[view.export] as ComponentType<Record<string, unknown>>,
        ),
      { ssr: false, loading: () => <PreviewSkeleton /> },
    ) as ComponentType<Record<string, unknown>>;
  }, [view]);

  if (view.render) return <>{view.render(values)}</>;
  if (!Dynamic) return <PreviewPlaceholder />;
  const props = {
    ...(view.staticProps ?? {}),
    ...(view.mapProps?.(values) ?? {}),
  };
  return (
    <FrameWrap frame={view.frame ?? "center"}>
      <Dynamic {...props} />
    </FrameWrap>
  );
}

function FrameWrap({
  frame,
  children,
}: {
  frame: ViewFrame;
  children: ReactNode;
}) {
  if (frame === "fill") {
    return (
      <div className="flex w-full">
        <div className="cv-frame-fill relative w-full overflow-hidden rounded-xl bg-black">
          {children}
        </div>
      </div>
    );
  }
  if (frame === "card") {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          {children}
        </div>
      </div>
    );
  }
  if (frame === "block") {
    return <div className="w-full self-stretch">{children}</div>;
  }
  return (
    <div className="flex w-full items-center justify-center">{children}</div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="flex h-24 w-24 items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text-2)]" />
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <div className="flex max-w-sm flex-col items-center gap-2 px-8 text-center">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        Live preview
      </span>
      <p className="text-sm text-[var(--text-2)]">
        Coming soon. The Code, Installation, and Usage below are ready to use.
      </p>
    </div>
  );
}
