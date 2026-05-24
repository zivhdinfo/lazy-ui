"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { AnimatedTabs } from "@/components/lazy-ui/animated-tabs";
import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";
import type { ComponentItem } from "@/registry/components";

import { contentFor } from "../component-content";
import {
  CustomizePanel,
  initialValues,
  type CustomizeValues,
} from "../customize";
import { HighlightTsx } from "../syntax-highlight";
import { useScrollReveal } from "../use-scroll-reveal";

import { customConfigFor, customFooterFor } from "./customize-configs";
import {
  CodeIcon,
  CurvedHandle,
  DesktopIcon,
  EyeIcon,
  MobileIcon,
  RefreshIcon,
  TabletIcon,
} from "./icons";
import { importPathFor, installCmd, PM_TABS, type PmTab } from "./install";
import { LivePreview } from "./live-preview";
import {
  DEVICE_WIDTHS,
  MIN_PREVIEW_WIDTH,
  STAGE_MIN_HEIGHT,
  type Device,
  type Mode,
} from "./stage";
import { DeviceButton, ToolbarButton } from "./toolbar";

export function ComponentDetail({
  component,
  source,
}: {
  component: ComponentItem;
  source: string;
}) {
  const [pm, setPm] = useState<PmTab>("npm");
  const [mode, setMode] = useState<Mode>("preview");
  /** `null` = full container width (desktop). Number = fixed pixel width. */
  const [width, setWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);

  // Drag handle physics — bend follows pointer velocity, springs back on release.
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

  // Underdamped spring back to zero — overshoots then settles.
  const startSpringBack = useCallback(() => {
    cancelSpring();
    const startTime = performance.now();
    const startBend = bendRef.current;
    if (Math.abs(startBend) < 0.5) {
      writeBend(0);
      return;
    }
    const omega = 14; // angular frequency
    const zeta = 0.28; // damping ratio
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

  // Track rendered width of the frame so the label can show the live value
  // (including during full-width / drag).
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
  }, [mode]);

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
    // Velocity → bend (px/ms × scale, clamped)
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

  useScrollReveal();

  const cmd = installCmd(pm, component.slug);
  const target = component.target;
  const content = contentFor(component.slug);
  const importPath = importPathFor(component);

  // Customize state, lifted out of the Preview tab so it can be rendered as
  // a separate block above Installation while still driving the live preview.
  const customControls = customConfigFor(component.slug);
  const customFooter = customFooterFor(component.slug);
  const initialCustom = useMemo(
    () => ({
      ...(customControls ? initialValues(customControls) : {}),
      ...(customFooter?.defaults ?? {}),
    }),
    [customControls, customFooter],
  );
  const [customValues, setCustomValues] =
    useState<CustomizeValues>(initialCustom);
  const setCustom = useCallback(
    (key: string, value: number | string | boolean) =>
      setCustomValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const resetPreview = useCallback(() => {
    setCustomValues(initialCustom);
    setWidth(null);
    setPreviewKey((k) => k + 1);
  }, [initialCustom]);

  const pmPicker = (
    <span className="flex gap-0.5">
      {PM_TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setPm(t)}
          className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
            pm === t
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {t}
        </button>
      ))}
    </span>
  );

  const installDepsCmd =
    component.dependencies && component.dependencies.length > 0
      ? `${pm} ${pm === "npm" ? "install" : "add"} ${component.dependencies.join(" ")}`
      : "";
  const hasDeps = !!component.dependencies?.length;
  const hasExtras = !!component.extraFiles?.length;
  const copyStep = hasDeps ? 2 : 1;
  const extrasStep = hasDeps ? 3 : 2;

  const sourceBlock = (
    <CodePreview
      code={source}
      title={`${component.slug}.tsx`}
      meta={
        <span className="inline-flex items-center gap-2">
          <span className="text-[11px] text-neutral-500">
            {source.split("\n").length} lines
          </span>
          <CopyButton
            content={source}
            text
            textAs="tooltip"
            label="Copy source"
            iconAnimate="draw"
          />
        </span>
      }
    >
      <HighlightTsx source={source} />
    </CodePreview>
  );

  return (
    <main className="main component-detail-main">
      <div className="component-hero reveal">
        <h1 className="page-title component-title">{component.title}</h1>
        <p className="page-sub component-description">{component.description}</p>
      </div>

      {/* Preview / Code */}
      <section className="component-preview-block block reveal d-2">
        {/* Toolbar */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <ToolbarButton
              active={mode === "preview"}
              onClick={() => setMode("preview")}
            >
              <EyeIcon />
              <span>Preview</span>
            </ToolbarButton>
            <ToolbarButton
              active={mode === "code"}
              onClick={() => setMode("code")}
            >
              <CodeIcon />
              <span>Code</span>
            </ToolbarButton>
            <span aria-hidden className="mx-1 h-4 w-px bg-white/10" />
            <span className="flex min-w-0 items-center gap-1.5 font-mono text-[12px] text-neutral-400">
              <span className="max-w-[280px] truncate">{component.slug}</span>
              <CopyButton
                content={cmd}
                text={false}
                textAs="tooltip"
                label={`Copy ${pm} install command`}
                iconAnimate="draw"
                className="text-neutral-500 hover:text-white"
              />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              role="group"
              aria-label="Preview device"
              className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.02] p-0.5"
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
              onClick={resetPreview}
              aria-label="Reset preview"
              title="Reset preview"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* Preview / Code body */}
        {mode === "preview" ? (
          <div
            ref={stageRef}
            className="relative rounded-3xl border border-white/10 bg-white/[0.02]"
            style={{ minHeight: STAGE_MIN_HEIGHT[component.slug] ?? 500 }}
          >
            {/* Dotted grid background */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "right bottom",
                WebkitMaskImage:
                  "repeating-linear-gradient(to right, black 0 3px, transparent 3px 8px), repeating-linear-gradient(to bottom, black 0 3px, transparent 3px 8px)",
                maskImage:
                  "repeating-linear-gradient(to right, black 0 3px, transparent 3px 8px), repeating-linear-gradient(to bottom, black 0 3px, transparent 3px 8px)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            />

            {/* Preview frame (anchored left, explicit width or full) */}
            <div
              data-preview-frame
              className="absolute inset-y-0 left-0 z-10 flex items-center justify-center overflow-hidden rounded-3xl bg-black"
              style={{
                width: width === null ? "100%" : `${width}px`,
                transition: dragging ? "none" : "width 0.3s ease-in-out",
              }}
            >
              <LivePreview
                key={previewKey}
                slug={component.slug}
                values={customValues}
              />
            </div>

            {/* Drag handle — curves with drag velocity, springs back on release */}
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
              className={`absolute top-1/2 z-20 -ml-3 flex h-[120px] w-6 -translate-y-1/2 cursor-ew-resize items-center justify-center transition-colors ${
                dragging || hoverHandle ? "text-white" : "text-white/30"
              }`}
              style={{
                left: width === null ? "100%" : `${width}px`,
                transition: dragging ? "none" : "left 0.3s ease-in-out",
              }}
            >
              <CurvedHandle bend={bend} glow={dragging || hoverHandle} />
            </div>

            {/* Width label (shown while dragging) */}
            <div
              className={`pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] font-mono text-neutral-300 backdrop-blur-sm transition-opacity duration-300 ${
                dragging ? "opacity-100" : "opacity-0"
              }`}
            >
              {Math.round(width ?? renderedWidth ?? 0)}px
            </div>
          </div>
        ) : (
          <div className="preview-shell-code overflow-hidden rounded-xl border border-white/10 bg-black">
            {sourceBlock}
          </div>
        )}
      </section>

      {/* Customize — separate block, drives the live preview above. */}
      {customControls && (
        <section className="component-customize-block block reveal d-3">
          <h2 className="block-title">Customize</h2>
          <p className="block-sub">Edit props; preview updates instantly.</p>
          <CustomizePanel
            controls={customControls}
            values={customValues}
            onChange={setCustom}
            componentName={content?.componentName}
            importPath={importPath}
          />
          {customFooter && (
            <div className="mt-2.5">
              {customFooter.render(customValues, setCustom)}
            </div>
          )}
        </section>
      )}

      {/* Props (API Reference) */}
      {content && content.api.length > 0 && (
        <section className="block reveal d-3">
          <h2 className="block-title">Props</h2>
          <p className="block-sub">
            Props accepted by{" "}
            <code
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                color: "var(--fg-1)",
              }}
            >
              {content.componentName}
            </code>
            .
          </p>
          <table className="api-table">
            <colgroup>
              <col className="api-col-name" />
              <col className="api-col-type" />
              <col className="api-col-default" />
              <col className="api-col-desc" />
            </colgroup>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {content.api.map((row) => (
                <tr key={row.name}>
                  <td className="name">{row.name}</td>
                  <td className="type">{row.type}</td>
                  <td className="default">{row.default ?? "—"}</td>
                  <td className="desc">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Installation */}
      <section className="block reveal d-4">
        <h2 className="block-title">Installation</h2>
        <p className="block-sub">
          Choose CLI for the one-line shadcn install, or copy the file manually.
        </p>

        <AnimatedTabs
          tabs={[
            {
              value: "cli",
              label: "CLI",
              content: (
                <CodePreview
                  code={cmd}
                  title={pmPicker}
                  meta={
                    <CopyButton
                      content={cmd}
                      text
                      label="Copy"
                      iconAnimate="draw"
                    />
                  }
                >
                  <HighlightTsx source={cmd} />
                </CodePreview>
              ),
            },
            {
              value: "manual",
              label: "Manual",
              content: (
                <div className="manual-panel">
                  {hasDeps && (
                    <div className="manual-step">
                      <div className="manual-step-head">
                        <span className="manual-step-label">
                          <span className="manual-step-num">1</span>
                          Install dependencies
                        </span>
                        {pmPicker}
                      </div>
                      <CodePreview
                        code={installDepsCmd}
                        title={
                          <span className="font-mono text-neutral-400">
                            <span className="text-neutral-600">$</span> terminal
                          </span>
                        }
                        meta={
                          <CopyButton
                            content={installDepsCmd}
                            text
                            label="Copy"
                            iconAnimate="draw"
                          />
                        }
                      >
                        <HighlightTsx source={installDepsCmd} />
                      </CodePreview>
                    </div>
                  )}
                  <div className="manual-step">
                    <div className="manual-step-head">
                      <span className="manual-step-label">
                        <span className="manual-step-num">{copyStep}</span>
                        Copy the source
                      </span>
                    </div>
                    <p className="manual-hint">
                      Drop the file into your project at <code>{target}</code>{" "}
                      (or wherever your components live), then import it like
                      any local component.
                    </p>
                    {sourceBlock}
                  </div>
                  {hasExtras && (
                    <div className="manual-step">
                      <div className="manual-step-head">
                        <span className="manual-step-label">
                          <span className="manual-step-num">{extrasStep}</span>
                          Add helper files
                        </span>
                      </div>
                      <p className="manual-hint">
                        Grab these from the repo at the same paths:
                      </p>
                      <ul className="manual-files">
                        {component.extraFiles!.map((f) => (
                          <li key={f.target}>
                            <code>{f.target}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* Usage */}
      {content && (
        <section className="block reveal d-4">
          <h2 className="block-title">Usage</h2>
          <p className="block-sub">
            Import the component and drop it into a render.
          </p>
          <CodePreview
            code={content.usageCode}
            title="demo.tsx"
            meta={
              <span className="inline-flex items-center gap-2">
                <span className="text-[11px] text-neutral-500">
                  {content.usageCode.split("\n").length} lines
                </span>
                <CopyButton
                  content={content.usageCode}
                  text
                  textAs="tooltip"
                  label="Copy usage"
                  iconAnimate="draw"
                />
              </span>
            }
          >
            <HighlightTsx source={content.usageCode} />
          </CodePreview>
        </section>
      )}

      {/* Credits */}
      {content?.credits && content.credits.length > 0 && (
        <section className="block reveal d-6">
          <h2 className="block-title">Credits</h2>
          <div className="credits-grid">
            {content.credits.map((credit) => (
              <a
                key={credit.href}
                href={credit.href}
                target="_blank"
                rel="noreferrer"
                className="credits-card"
              >
                <span className="credits-label">{credit.label}</span>
                <span className="credits-desc">{credit.description}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
