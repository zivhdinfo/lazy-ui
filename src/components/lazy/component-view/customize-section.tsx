"use client";

import { type CSSProperties } from "react";
import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Scrubber } from "../scrubber";
import type { CustomizeControl, CustomizeValues } from "../customize";
import { RefreshIcon } from "../component-detail/icons";
import type { CustomFooter } from "./types";

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** input[type=color] only accepts #rrggbb. */
function toHex6(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return (
      "#" +
      value
        .slice(1)
        .split("")
        .map((ch) => ch + ch)
        .join("")
    );
  }
  return "#ffffff";
}

type ControlChange = (key: string, value: number | string | boolean) => void;

/**
 * CustomizeSection — the customize block under the preview stage. Plain
 * section title (not a card header) over ONE card that holds a uniform grid:
 * every control sits in an identically sized cell so sliders, selects, and
 * toggles align. Hex-valued selects render as a swatch palette plus a free
 * color picker; selects with many or long options collapse to a dropdown.
 * Separate from CustomizePanel on purpose — that one is the wide chip grid
 * still used by the blocks detail page.
 */
export function CustomizeSection({
  controls,
  values,
  onChange,
  onReset,
  footer,
}: {
  controls: CustomizeControl[];
  values: CustomizeValues;
  onChange: ControlChange;
  onReset: () => void;
  footer?: CustomFooter;
}) {
  return (
    <div className="cv-customize">
      <div className="cv-customize-head">
        <h2 className="block-title cv-customize-title">Customize</h2>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset controls"
          title="Reset"
          className="cv-icon-btn"
        >
          <RefreshIcon />
        </button>
      </div>
      <div className="cv-customize-card">
        <div className="cv-controls">
          {controls.map((control) => (
            <div key={control.key} className="cv-control-card">
              <ControlCell control={control} values={values} onChange={onChange} />
            </div>
          ))}
          {footer && (
            <div className="cv-control-card cv-control-wide">
              {footer.render(values, onChange)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlCell({
  control,
  values,
  onChange,
}: {
  control: CustomizeControl;
  values: CustomizeValues;
  onChange: ControlChange;
}) {
  if (control.type === "slider") {
    return (
      <Scrubber
        variant="bare"
        label={control.label}
        min={control.min}
        max={control.max}
        step={control.step}
        value={(values[control.key] as number) ?? control.defaultValue}
        onChange={(v) => onChange(control.key, v)}
        format={control.format}
      />
    );
  }

  if (control.type === "select") {
    const current = (values[control.key] as string) ?? control.defaultValue;
    const isPalette = control.options.every((o) => HEX_RE.test(o.value));
    if (isPalette) {
      const isCustom = !control.options.some((o) => o.value === current);
      return (
        <div className="flex flex-col gap-2">
          <span className="cv-control-label">{control.label}</span>
          <div className="cv-swatches" role="group" aria-label={control.label}>
            {control.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={opt.value === current}
                aria-label={opt.label}
                title={opt.label}
                onClick={() => onChange(control.key, opt.value)}
                className={`cv-swatch ${opt.value === current ? "is-active" : ""}`}
                style={{ background: opt.value }}
              />
            ))}
            <label
              className={`cv-swatch cv-swatch-pick ${isCustom ? "is-active" : ""}`}
              title="Custom color"
              style={
                isCustom
                  ? ({ "--pick-color": current } as CSSProperties)
                  : undefined
              }
            >
              <input
                type="color"
                aria-label={`${control.label} — custom color`}
                value={toHex6(current)}
                onChange={(e) => onChange(control.key, e.target.value)}
              />
            </label>
          </div>
        </div>
      );
    }
    // Segmented chips read well up to a handful of short labels; anything
    // longer (e.g. charsets) collapses to a dropdown.
    const compact =
      control.options.length > 4 ||
      control.options.some((o) => o.label.length > 10);
    if (compact) {
      const currentLabel =
        control.options.find((o) => o.value === current)?.label ?? current;
      return (
        <div className="flex flex-col gap-2">
          <span className="cv-control-label">{control.label}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cv-select-trigger"
              aria-label={control.label}
            >
              <span className="min-w-0 truncate">{currentLabel}</span>
              <ChevronDownIcon className="size-3.5 shrink-0 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="cv-menu">
              {control.options.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => onChange(control.key, opt.value)}
                  className={`cv-menu-item ${opt.value === current ? "is-active" : ""}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <span className="cv-control-label">{control.label}</span>
        <div className="cv-seg" role="group" aria-label={control.label}>
          {control.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={opt.value === current}
              onClick={() => onChange(control.key, opt.value)}
              className={`cv-seg-chip ${opt.value === current ? "is-active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (control.type === "toggle") {
    const on = (values[control.key] as boolean) ?? control.defaultValue;
    return (
      <div className="flex flex-col gap-2">
        <span className="cv-control-label">{control.label}</span>
        <div className="cv-seg" role="group" aria-label={control.label}>
          <button
            type="button"
            aria-pressed={on}
            onClick={() => onChange(control.key, true)}
            className={`cv-seg-chip ${on ? "is-active" : ""}`}
          >
            On
          </button>
          <button
            type="button"
            aria-pressed={!on}
            onClick={() => onChange(control.key, false)}
            className={`cv-seg-chip ${on ? "" : "is-active"}`}
          >
            Off
          </button>
        </div>
      </div>
    );
  }

  const text = (values[control.key] as string) ?? control.defaultValue;
  return (
    <div className="flex flex-col gap-2">
      <span className="cv-control-label">{control.label}</span>
      <input
        type="text"
        value={text}
        placeholder={control.placeholder}
        onChange={(e) => onChange(control.key, e.target.value)}
        className="w-full rounded-lg border border-[var(--border-2)] bg-[var(--panel)] px-2.5 py-1.5 text-[12px] text-[var(--text)] placeholder:text-[var(--text-3)] focus:border-[var(--text-3)] focus:outline-none"
      />
    </div>
  );
}
