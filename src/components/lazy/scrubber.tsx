"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

type ScrubberProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Format function for the displayed value. */
  format?: (value: number) => string;
};

/**
 * Scrubber — a minimal, compact slider for the docs Customize panel: a label +
 * value header over a thin track with an ink fill and a small thumb. Drag,
 * click-to-set, and keyboard (arrows / shift-arrows / Home / End) are all
 * supported. Internal helper — not a registry item.
 */
export function Scrubber({
  label,
  min,
  max,
  step = (max - min) / 100,
  value,
  onChange,
  disabled = false,
  format,
}: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pct = ((value - min) / (max - min)) * 100;
  const formatted = format ? format(value) : prettify(value);

  const clamp = useCallback(
    (raw: number) => Math.max(min, Math.min(max, raw)),
    [min, max],
  );

  const setFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(snapped));
    },
    [min, max, step, onChange, clamp],
  );

  const onMouseDown = (e: MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setFromClientX(e.clientX);
    (e.currentTarget as HTMLDivElement).focus();
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: globalThis.MouseEvent) => setFromClientX(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, setFromClientX]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    const stepSize = e.shiftKey ? step * 10 : step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(clamp(value + stepSize));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(clamp(value - stepSize));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  const ease = isDragging
    ? ""
    : "transition-[width,left] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div
      className={[
        "flex h-full min-h-12 flex-col justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5",
        disabled ? "opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-[var(--text)]">
          {formatted}
        </span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-dragging={isDragging || undefined}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        className={[
          "relative flex h-3 items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          disabled ? "cursor-not-allowed" : "cursor-ew-resize",
        ].join(" ")}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--panel-2)]" />
        <div
          className={`absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--ink)] ${ease}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className={`pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)] shadow-sm ring-2 ring-[var(--surface)] ${ease}`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function prettify(value: number): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.?0+$/, "");
}
