"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";

import { AnimatedTabs } from "@/components/lazy-ui/animated-tabs";
import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";
import { GridBackground } from "@/components/lazy-ui/grid-background";
import type { ComponentItem } from "@/registry/components";

import { contentFor } from "../component-content";
import { CustomizePanel, initialValues, type CustomizeValues } from "../customize";
import { HighlightTsx } from "../syntax-highlight";
import { useScrollReveal } from "../use-scroll-reveal";
import { CodeIcon, EyeIcon, RefreshIcon } from "../component-detail/icons";
import {
  importPathFor,
  installCmd,
  PM_TABS,
  type PmTab,
} from "../component-detail/install";
import { ToolbarButton } from "../component-detail/toolbar";

import { viewFor } from "./registry";
import type { ComponentView as ComponentViewConfig, ViewFrame } from "./types";

type Mode = "preview" | "code";

const DEFAULT_STAGE_MIN_HEIGHT = 500;

export function ComponentView({
  component,
  source,
}: {
  component: ComponentItem;
  source: string;
}) {
  useScrollReveal();

  // Resolve the config on the client — it carries functions (load/render/
  // mapProps/format) that can't cross the RSC boundary as props.
  const view = viewFor(component.slug);

  const [mode, setMode] = useState<Mode>("preview");
  const [pm, setPm] = useState<PmTab>("npm");

  // Docs content: a config may override per-field; otherwise fall back to the
  // shared component-content.ts entry so unmigrated components still render
  // Props / Usage / the right component name.
  const content = contentFor(component.slug);
  const componentName =
    view?.componentName ?? content?.componentName ?? view?.export;
  const api = view?.api ?? content?.api ?? [];
  const usageCode = view?.usageCode ?? content?.usageCode;
  const credits = view?.credits ?? content?.credits;
  const importPath = view?.importPath ?? importPathFor(component);

  const controls = view?.controls;
  const footer = view?.footer;
  // Plain helpers — the React Compiler memoizes the component, so no manual
  // useMemo/useCallback (which it can't preserve here anyway).
  const buildInitialValues = (): CustomizeValues => ({
    ...(controls ? initialValues(controls) : {}),
    ...(footer?.defaults ?? {}),
  });
  const [values, setValues] = useState<CustomizeValues>(buildInitialValues);
  const setValue = (key: string, value: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  const reset = () => setValues(buildInitialValues());

  const stageMinHeight = view?.stageMinHeight ?? DEFAULT_STAGE_MIN_HEIGHT;
  const cmd = installCmd(pm, component.slug);

  const pmPicker = (
    <span className="flex gap-0.5">
      {PM_TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setPm(t)}
          className={`pm-tab ${pm === t ? "is-active" : ""}`}
        >
          {t}
        </button>
      ))}
    </span>
  );

  const hasDeps = !!component.dependencies?.length;
  const hasExtras = !!component.extraFiles?.length;
  const installDepsCmd = hasDeps
    ? `${pm} ${pm === "npm" ? "install" : "add"} ${component.dependencies!.join(" ")}`
    : "";
  const copyStep = hasDeps ? 2 : 1;
  const extrasStep = hasDeps ? 3 : 2;

  const sourceBlock = (
    <CodePreview
      code={source}
      title={`${component.slug}.tsx`}
      meta={
        <span className="inline-flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-3,#737373)]">
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
    <main className="main component-detail-main container">
      <div className="component-hero reveal">
        <h1 className="page-title component-title">{component.title}</h1>
        <p className="page-sub component-description">{component.description}</p>
      </div>

      {/* Preview / Code */}
      <section className="component-preview-block block reveal d-2">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <ToolbarButton
              active={mode === "preview"}
              onClick={() => setMode("preview")}
            >
              <EyeIcon />
              <span>Preview</span>
            </ToolbarButton>
            <ToolbarButton active={mode === "code"} onClick={() => setMode("code")}>
              <CodeIcon />
              <span>Code</span>
            </ToolbarButton>
            <span
              aria-hidden
              className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block"
            />
            <span className="hidden min-w-0 items-center gap-1.5 font-mono text-[12px] text-[var(--text-2)] sm:flex">
              <span className="max-w-[160px] truncate md:max-w-[280px]">
                {component.slug}
              </span>
              <CopyButton
                content={cmd}
                text={false}
                textAs="tooltip"
                label={`Copy ${pm} install command`}
                iconAnimate="draw"
                className="text-[var(--text-3)] hover:text-[var(--text)]"
              />
            </span>
          </div>
          {mode === "preview" && controls && (
            <button
              type="button"
              onClick={reset}
              aria-label="Reset preview"
              title="Reset preview"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] transition-colors hover:bg-[var(--panel)] hover:text-[var(--text)]"
            >
              <RefreshIcon />
            </button>
          )}
        </div>

        {mode === "preview" ? (
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"
            style={{ minHeight: stageMinHeight }}
          >
            <GridBackground
              variant="dots"
              size={20}
              dotSize={3}
              color="var(--preview-grid)"
              className="rounded-3xl"
            />
            <div
              className="relative z-10 flex w-full items-center justify-center overflow-hidden rounded-3xl"
              style={{ minHeight: stageMinHeight }}
            >
              {view ? (
                <LiveRender view={view} values={values} />
              ) : (
                <PreviewPlaceholder />
              )}
            </div>
          </div>
        ) : (
          <div className="preview-shell-code code-themed overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {sourceBlock}
          </div>
        )}
      </section>

      {/* Customize */}
      {controls && (
        <section className="component-customize-block block reveal d-3 code-themed">
          <h2 className="block-title">Customize</h2>
          <p className="block-sub">Edit props; preview updates instantly.</p>
          <CustomizePanel
            controls={controls}
            values={values}
            onChange={setValue}
            componentName={componentName}
            importPath={importPath}
          />
          {footer && <div className="mt-2.5">{footer.render(values, setValue)}</div>}
        </section>
      )}

      {/* Props */}
      {api.length > 0 && (
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
              {componentName}
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
              {api.map((row) => (
                <tr key={row.name}>
                  <td className="name" data-label="Prop">
                    {row.name}
                  </td>
                  <td className="type" data-label="Type">
                    {row.type}
                  </td>
                  <td className="default" data-label="Default">
                    {row.default ?? "—"}
                  </td>
                  <td className="desc" data-label="Description">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Installation */}
      <section className="block reveal d-4 code-themed">
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
                    <CopyButton content={cmd} text label="Copy" iconAnimate="draw" />
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
                          <span className="text-[var(--text-2,#a3a3a3)]">
                            <span className="text-[var(--text-3,#525252)]">$</span>{" "}
                            terminal
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
                      Drop the file into your project at <code>{component.target}</code>{" "}
                      (or wherever your components live), then import it like any
                      local component.
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
      {usageCode && (
        <section className="block reveal d-4 code-themed">
          <h2 className="block-title">Usage</h2>
          <p className="block-sub">Import the component and drop it into a render.</p>
          <CodePreview
            code={usageCode}
            title="demo.tsx"
            meta={
              <span className="inline-flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-3,#737373)]">
                  {usageCode.split("\n").length} lines
                </span>
                <CopyButton
                  content={usageCode}
                  text
                  textAs="tooltip"
                  label="Copy usage"
                  iconAnimate="draw"
                />
              </span>
            }
          >
            <HighlightTsx source={usageCode} />
          </CodePreview>
        </section>
      )}

      {/* Credits */}
      {credits && credits.length > 0 && (
        <section className="block reveal d-6">
          <h2 className="block-title">Credits</h2>
          <div className="credits-grid">
            {credits.map((credit) => (
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

/** Renders the live component — escape-hatch `render` or declarative mount. */
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
  const props = { ...(view.staticProps ?? {}), ...(view.mapProps?.(values) ?? {}) };
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
      <div className="flex w-full items-center justify-center p-4">
        <div className="relative h-[460px] w-full overflow-hidden rounded-2xl bg-black">
          {children}
        </div>
      </div>
    );
  }
  if (frame === "card") {
    return (
      <div className="flex w-full items-center justify-center p-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          {children}
        </div>
      </div>
    );
  }
  return <div className="flex w-full items-center justify-center p-6">{children}</div>;
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
