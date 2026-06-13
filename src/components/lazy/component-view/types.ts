import type { ReactNode } from "react";

import type { CustomizeControl, CustomizeValues } from "../customize";

/** One row in the props/API reference table. */
export type PropRow = {
  name: string;
  type: string;
  /** Omit (or `"—"`) for required props. */
  default?: string;
  description: string;
};

export type CreditLink = {
  label: string;
  href: string;
  description: string;
};

/** Rare free-text controls (e.g. owner/repo for github-stars-button). */
export type CustomFooter = {
  defaults: Record<string, number | string | boolean>;
  render: (
    values: CustomizeValues,
    onChange: (key: string, value: number | string | boolean) => void,
  ) => ReactNode;
};

/** How the declarative (`mapProps`) preview is framed on the stage. */
export type ViewFrame = "center" | "fill" | "card" | "block";

/**
 * The single declarative description of a component's detail page. One file per
 * component under `component-view/configs/<type>/<slug>`, registered with one
 * line in `registry.ts`. Everything the frame needs to render the live preview,
 * customize panel, and docs comes from here.
 *
 * `api` / `usageCode` / `credits` / `componentName` are OPTIONAL: when omitted
 * the frame falls back to the slug's entry in `component-content.ts`, so a
 * config only needs the preview to light up a page that already has Code,
 * Install, Props, and Usage.
 */
export type ComponentView = {
  /** Co-located lazy import of the component's barrel — no central import map. */
  load: () => Promise<Record<string, unknown>>;
  /** Export name pulled from the module, e.g. `"MatrixGrid"`. */
  export: string;

  /** Overrides — fall back to `component-content.ts` when absent. */
  componentName?: string;
  importPath?: string;
  usageCode?: string;
  api?: PropRow[];
  credits?: CreditLink[];

  /** Customize panel. Omit for a component with nothing to tweak. */
  controls?: CustomizeControl[];
  footer?: CustomFooter;

  /** Show device-width presets + drag-to-resize. Defaults to blocks only. */
  responsive?: boolean;

  /** Force the record button on for a canvas-less preview (records via screen
   * capture). Canvas previews always offer record without this. */
  record?: boolean;

  // ── Declarative path (no JSX) — covers buttons / forms / switches ──
  /** Map current control values to component props. */
  mapProps?: (values: CustomizeValues) => Record<string, unknown>;
  /** Props always merged in (className, fixed demo props). */
  staticProps?: Record<string, unknown>;
  /** Stage wrapper. @default "center" */
  frame?: ViewFrame;
  /** Stage min-height in px. @default 500 */
  stageMinHeight?: number;

  // ── Escape hatch — canvas / WebGL / overlay-heavy previews ──
  /** When set, `mapProps`/`frame`/`staticProps` are ignored. */
  render?: (values: CustomizeValues) => ReactNode;
  /** Optional remount key. See CLAUDE.md Turbopack `insertBefore` caveat. */
  replayKey?: (values: CustomizeValues) => string;
};
