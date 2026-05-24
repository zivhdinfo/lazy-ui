"use client";

import { useState, type ReactNode } from "react";

import { CodePreview } from "@/components/lazy-ui/code-preview";
import { CopyButton } from "@/components/lazy-ui/copy-button";

import { Scrubber } from "./scrubber";
import { HighlightTsx } from "./syntax-highlight";

type Base = {
  /** Field key; also the prop name passed to the preview render-prop. */
  key: string;
  /** Label shown next to the control. */
  label: string;
};

type SliderControl = Base & {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  format?: (v: number) => string;
  /**
   * When true, the slider takes ~50% of the row width, forcing a strict
   * 2-per-row layout regardless of viewport. Default is the normal 280px
   * basis that flex-wraps to 2–3 per row depending on space.
   */
  wide?: boolean;
};

type SelectControl<T extends string = string> = Base & {
  type: "select";
  options: Array<{ value: T; label: string }>;
  defaultValue: T;
};

type ToggleControl = Base & {
  type: "toggle";
  defaultValue: boolean;
};

export type CustomizeControl = SliderControl | SelectControl | ToggleControl;

export type CustomizeValues = Record<string, number | string | boolean>;

/** Build the initial values map from a list of controls. */
export function initialValues(controls: CustomizeControl[]): CustomizeValues {
  return Object.fromEntries(controls.map((c) => [c.key, c.defaultValue]));
}

type CustomizePanelProps = {
  /** Control definitions. Order = render order. */
  controls: CustomizeControl[];
  /** Current values (controlled). */
  values: CustomizeValues;
  /** Update a single value by key. */
  onChange: (key: string, value: number | string | boolean) => void;
  /** Title shown in the panel header. @default "Customize" */
  title?: string;
  /** Class names merged onto the wrapper. */
  className?: string;
  /**
   * Component name (e.g. "CopyButton"). When provided, shows a "Usage code"
   * button that exports the current values as a JSX snippet.
   */
  componentName?: string;
  /**
   * Import path used in the generated usage snippet (e.g.
   * `@/components/lazy-ui/copy-button`). Optional — when omitted, the
   * import line is skipped.
   */
  importPath?: string;
};

/** Serialize a single prop value into its JSX literal form. */
function formatPropValue(value: number | string | boolean): string {
  if (typeof value === "boolean") return value ? "{true}" : "{false}";
  if (typeof value === "number") return `{${value}}`;
  return `"${value.replace(/"/g, '\\"')}"`;
}

/** Build the JSX usage snippet from controls + current values. */
function buildUsageCode(
  componentName: string,
  importPath: string | undefined,
  controls: CustomizeControl[],
  values: CustomizeValues,
): string {
  const importLine = importPath
    ? `import { ${componentName} } from "${importPath}";\n\n`
    : "";
  const propLines = controls
    .filter((c) => values[c.key] !== undefined)
    .map((c) => `  ${c.key}=${formatPropValue(values[c.key])}`);
  const body =
    propLines.length === 0
      ? `<${componentName} />`
      : `<${componentName}\n${propLines.join("\n")}\n/>`;
  return `${importLine}${body}`;
}

/**
 * CustomizePanel — controlled controls UI. Renders sliders, segmented
 * selects, and toggles in a wrapping flex layout.
 */
export function CustomizePanel({
  controls,
  values,
  onChange,
  title = "Customize",
  className,
  componentName,
  importPath,
}: CustomizePanelProps) {
  const [showUsage, setShowUsage] = useState(false);
  const canExport = Boolean(componentName);
  const usageCode = canExport
    ? buildUsageCode(componentName!, importPath, controls, values)
    : "";

  return (
    <div
      className={[
        "flex flex-col gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        {canExport && (
          <button
            type="button"
            onClick={() => setShowUsage((v) => !v)}
            aria-expanded={showUsage}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-neutral-900/80 px-2.5 py-1 text-[10.5px] font-medium text-neutral-200 transition-colors hover:border-white/20 hover:bg-neutral-800/80"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Usage code
          </button>
        )}
      </div>
      <ControlGrid controls={controls} values={values} setValue={onChange} />
      {canExport && showUsage && (
        <CodePreview
          code={usageCode}
          title="usage.tsx"
          meta={
            <CopyButton
              content={usageCode}
              text
              textAs="tooltip"
              label="Copy usage"
              iconAnimate="draw"
            />
          }
        >
          <HighlightTsx source={usageCode} />
        </CodePreview>
      )}
    </div>
  );
}

type CustomizeProps = {
  /** Title shown above the controls. @default "Customize" */
  title?: string;
  /** Control definitions. Order = render order. */
  controls: CustomizeControl[];
  /** Render the preview given the current values. Re-runs on every change. */
  children: (values: CustomizeValues) => ReactNode;
  /** Class names merged onto the outer wrapper. */
  className?: string;
  /** See {@link CustomizePanelProps.componentName}. */
  componentName?: string;
  /** See {@link CustomizePanelProps.importPath}. */
  importPath?: string;
};

/**
 * Customize — convenience wrapper: stacks the preview on top of a
 * CustomizePanel and manages the values internally. Use CustomizePanel
 * directly when you need the controls and the preview to live in different
 * parts of the page (state lifted to the parent).
 */
export function Customize({
  title = "Customize",
  controls,
  children,
  className,
  componentName,
  importPath,
}: CustomizeProps) {
  const [values, setValues] = useState<CustomizeValues>(() =>
    initialValues(controls),
  );

  const setValue = (key: string, value: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
    >
      <div>{children(values)}</div>
      <CustomizePanel
        controls={controls}
        values={values}
        onChange={setValue}
        title={title}
        componentName={componentName}
        importPath={importPath}
      />
    </div>
  );
}

/**
 * Renders controls in a wrapping flex layout with equal card sizing. Dense
 * select groups scroll horizontally instead of wrapping individual buttons.
 */
function ControlGrid({
  controls,
  values,
  setValue,
}: {
  controls: CustomizeControl[];
  values: CustomizeValues;
  setValue: (key: string, value: number | string | boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {controls.map((c) => (
        <div
          key={c.key}
          className={controlItemClass(c)}
        >
          {renderControl(c, values, setValue)}
        </div>
      ))}
    </div>
  );
}

function controlItemClass(c: CustomizeControl): string {
  if (c.type === "slider") {
    return c.wide
      ? "min-w-0 flex-[1_1_calc(50%-4px)]"
      : "min-w-0 flex-[1_1_280px]";
  }
  if (c.type === "toggle") return "min-w-0 max-w-[260px] flex-[1_1_160px]";
  return "min-w-0 flex-[1_1_280px]";
}

function renderControl(
  c: CustomizeControl,
  values: CustomizeValues,
  setValue: (key: string, value: number | string | boolean) => void,
) {
  if (c.type === "slider") {
    return (
      <Scrubber
        key={c.key}
        label={c.label}
        min={c.min}
        max={c.max}
        step={c.step}
        value={values[c.key] as number}
        onChange={(v) => setValue(c.key, v)}
        format={c.format}
      />
    );
  }
  if (c.type === "select") {
    return (
      <SelectRow
        key={c.key}
        label={c.label}
        value={values[c.key] as string}
        options={c.options}
        onChange={(v) => setValue(c.key, v)}
      />
    );
  }
  return (
    <ToggleRow
      key={c.key}
      label={c.label}
      value={values[c.key] as boolean}
      onChange={(v) => setValue(c.key, v)}
    />
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-full min-h-12 items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <div className="flex min-w-0 max-w-full flex-nowrap gap-0.5 overflow-x-auto rounded-md border border-white/[0.06] bg-black/30 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={[
                "shrink-0 whitespace-nowrap rounded px-2 py-1 text-[11px] leading-tight transition-colors",
                active
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-neutral-200",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex h-full min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 transition-colors hover:border-white/20"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span
        className={[
          "relative h-5 w-9 rounded-full transition-colors",
          value ? "bg-white" : "bg-neutral-700",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 size-4 rounded-full bg-neutral-950 shadow transition-[left] duration-200 ease-out",
            value ? "left-[18px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
