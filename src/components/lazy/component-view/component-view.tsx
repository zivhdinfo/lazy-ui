"use client";

import dynamic from "next/dynamic";
import {
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronDownIcon, TerminalIcon } from "lucide-react";

import { AnimateTooltip } from "@/components/lazy-ui/animate-tooltip";
import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";
import { GridBackground } from "@/components/lazy-ui/grid-background";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ComponentItem } from "@/registry/components";

import { contentFor } from "../component-content";
import { buildUsageCode, initialValues, type CustomizeValues } from "../customize";
import { HighlightTsx } from "../syntax-highlight";
import { useScrollReveal } from "../use-scroll-reveal";
import { DesktopIcon, MobileIcon, TabletIcon } from "../component-detail/icons";
import {
  importPathFor,
  installCmd,
  PM_TABS,
  type PmTab,
} from "../component-detail/install";
import { DEVICE_WIDTHS, type Device } from "../component-detail/stage";
import { DeviceButton } from "../component-detail/toolbar";

import { CustomizeSection } from "./customize-section";
import { viewFor } from "./registry";
import type { ComponentView as ComponentViewConfig, ViewFrame } from "./types";

type Tab = "preview" | "props" | "install" | "credits";
type InstallMode = "cli" | "manual";

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

  const [tab, setTab] = useState<Tab>("preview");
  const [installMode, setInstallMode] = useState<InstallMode>("cli");
  const [pm, setPm] = useState<PmTab>("npm");
  const [device, setDevice] = useState<Device>("desktop");

  // Docs content: a config may override per-field; otherwise fall back to the
  // shared component-content.ts entry so unmigrated components still render
  // Props / Install / the right component name.
  const content = contentFor(component.slug);
  const componentName =
    view?.componentName ?? content?.componentName ?? view?.export;
  const api = view?.api ?? content?.api ?? [];
  const credits = view?.credits ?? content?.credits;
  const importPath = view?.importPath ?? importPathFor(component);
  const staticUsageCode = view?.usageCode ?? content?.usageCode;

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
  const deviceWidth = DEVICE_WIDTHS[device];

  // Usage reflects the current control values when there are controls;
  // otherwise it falls back to the static docs snippet.
  const usageCode =
    componentName && controls
      ? buildUsageCode(componentName, importPath, controls, values)
      : (staticUsageCode ?? "");

  const hasDeps = !!component.dependencies?.length;
  const hasExtras = !!component.extraFiles?.length;
  const installDepsCmd = hasDeps
    ? `${pm} ${pm === "npm" ? "install" : "add"} ${component.dependencies!.join(" ")}`
    : "";

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: "preview", label: "Preview" },
    ...(api.length > 0 ? [{ value: "props" as const, label: "Props" }] : []),
    { value: "install" as const, label: "Install" },
    ...(credits && credits.length > 0
      ? [{ value: "credits" as const, label: "Credits" }]
      : []),
  ];

  return (
    <main className="main component-detail-main cv-main container">
      <div className="cv-hero reveal">
        <h1 className="page-title component-title">{component.title}</h1>
        <p className="page-sub component-description">{component.description}</p>
      </div>

      <div
        className="cv-tabs reveal d-1"
        role="tablist"
        aria-label="Component sections"
      >
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`cv-tab ${tab === t.value ? "is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* One always-mounted section so tab switches don't re-enter the
          scroll-reveal pipeline (freshly mounted .reveal nodes would never
          get observed). */}
      <section className="block reveal d-2">
        {tab === "preview" && (
          <>
            <div className="cv-toolbar">
              <div className="cv-cmdbar">
                <TerminalIcon className="size-3.5 shrink-0 text-[var(--text-3)]" />
                <CmdCopy cmd={cmd} />
                <PmDropdown pm={pm} onSelect={setPm} variant="bar" />
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <DeviceButton
                  active={device === "desktop"}
                  onClick={() => setDevice("desktop")}
                  label="Desktop width"
                >
                  <DesktopIcon />
                </DeviceButton>
                <DeviceButton
                  active={device === "tablet"}
                  onClick={() => setDevice("tablet")}
                  label="Tablet width"
                >
                  <TabletIcon />
                </DeviceButton>
                <DeviceButton
                  active={device === "mobile"}
                  onClick={() => setDevice("mobile")}
                  label="Mobile width"
                >
                  <MobileIcon />
                </DeviceButton>
              </div>
            </div>

            <div
              className="cv-stage"
              style={{ "--cv-stage-h": `${stageMinHeight}px` } as CSSProperties}
            >
              <GridBackground
                variant="dots"
                size={20}
                dotSize={3}
                color="var(--preview-grid)"
              />
              <div className="cv-stage-inner">
                <div
                  className="cv-device"
                  style={
                    {
                      "--device-w": deviceWidth ? `${deviceWidth}px` : "100%",
                    } as CSSProperties
                  }
                >
                  {view ? (
                    <LiveRender view={view} values={values} />
                  ) : (
                    <div className="flex w-full items-center justify-center">
                      <PreviewPlaceholder />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(controls || footer) && (
              <CustomizeSection
                controls={controls ?? []}
                values={values}
                onChange={setValue}
                onReset={reset}
                footer={footer}
              />
            )}

            {usageCode && (
              <div className="cv-usage-live">
                <h2 className="block-title cv-usage-title">Usage</h2>
                <CodeBlock code={usageCode} copyLabel="Copy usage">
                  <HighlightTsx source={usageCode} />
                </CodeBlock>
              </div>
            )}
          </>
        )}

        {tab === "props" && (
          <>
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
          </>
        )}

        {tab === "install" && (
          <div>
            <div className="cv-install-head">
              <div
                className="cv-seg cv-install-switch"
                role="tablist"
                aria-label="Install method"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={installMode === "cli"}
                  onClick={() => setInstallMode("cli")}
                  className={`cv-seg-chip ${installMode === "cli" ? "is-active" : ""}`}
                >
                  CLI
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={installMode === "manual"}
                  onClick={() => setInstallMode("manual")}
                  className={`cv-seg-chip ${installMode === "manual" ? "is-active" : ""}`}
                >
                  Manual
                </button>
              </div>
              <PmDropdown pm={pm} onSelect={setPm} />
            </div>

            {installMode === "cli" ? (
              <div className="cv-steps">
                <div className="cv-step">
                  <h3 className="cv-step-title">Run the following command</h3>
                  <CodeBlock code={cmd} copyLabel="Copy install command">
                    <HighlightTsx source={cmd} />
                  </CodeBlock>
                </div>
              </div>
            ) : (
              <div className="cv-steps">
                {hasDeps && (
                  <div className="cv-step">
                    <h3 className="cv-step-title">Install dependencies</h3>
                    <CodeBlock code={installDepsCmd} copyLabel="Copy command">
                      <HighlightTsx source={installDepsCmd} />
                    </CodeBlock>
                  </div>
                )}
                <div className="cv-step">
                  <h3 className="cv-step-title">Copy the source code</h3>
                  <CodeBlock
                    code={source}
                    chip={component.target}
                    copyLabel="Copy source"
                  >
                    <HighlightTsx source={source} />
                  </CodeBlock>
                </div>
                {hasExtras && (
                  <div className="cv-step">
                    <h3 className="cv-step-title">Add helper files</h3>
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
            )}
          </div>
        )}

        {tab === "credits" && credits && credits.length > 0 && (
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
        )}
      </section>
    </main>
  );
}

/**
 * Package-manager picker — shadcn dropdown over the shared `pm` state.
 * The menu content portals OUTSIDE the .lui-docs scope, so `.cv-menu`
 * re-declares its own theme vars (don't add the `lui-docs` class here —
 * it carries page-level layout styles).
 */
function PmDropdown({
  pm,
  onSelect,
  variant = "chip",
}: {
  pm: PmTab;
  onSelect: (pm: PmTab) => void;
  /** "bar" = borderless, separator-left — for use inside the command bar. */
  variant?: "chip" | "bar";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          variant === "bar" ? "cv-pm-trigger cv-pm-trigger-bar" : "cv-pm-trigger"
        }
        aria-label="Package manager"
      >
        {pm}
        <ChevronDownIcon className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="cv-menu">
        {PM_TABS.map((t) => (
          <DropdownMenuItem
            key={t}
            onSelect={() => onSelect(t)}
            className={`cv-menu-item ${t === pm ? "is-active" : ""}`}
          >
            {t}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * CodeBlock — the component-view code presentation: a file-path chip above a
 * headerless CodePreview with the copy button floating inside the block.
 * The Show all / Show less toggle is restyled into a floating pill via the
 * `.cv-main [data-code-preview]` rules in lui-docs.css.
 */
function CodeBlock({
  code,
  chip,
  copyLabel,
  children,
}: {
  code: string;
  chip?: ReactNode;
  copyLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="cv-code code-themed">
      {chip && <code className="cv-file-chip">{chip}</code>}
      <div className="cv-code-frame">
        <CodePreview code={code}>{children}</CodePreview>
        <span className="cv-code-copy">
          <CopyButton
            content={code}
            text={false}
            textAs="tooltip"
            label={copyLabel}
            iconAnimate="draw"
            className="text-[var(--text-3)] hover:text-[var(--text)]"
          />
        </span>
      </div>
    </div>
  );
}

/** The install command itself is the copy target — click the text, get a
 * tooltip confirming the copy. */
function CmdCopy({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const handleClick = async () => {
    if (copied) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — most likely a permission/secure-context denial
    }
  };
  return (
    <AnimateTooltip content={copied ? "Copied" : "Copy"}>
      <button type="button" onClick={handleClick} className="cv-cmd-text">
        {cmd}
      </button>
    </AnimateTooltip>
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
  // The stage inner provides equal padding on all four sides; frames stretch
  // to fill the remaining box so the margins stay even.
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
