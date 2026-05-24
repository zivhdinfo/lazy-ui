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
  /** Total tick marks across the track (major). @default 5 */
  majorTicks?: number;
  /** Minor ticks between each pair of major ticks. @default 4 */
  minorPerMajor?: number;
  /** Format function for the displayed value. */
  format?: (value: number) => string;
};

/**
 * Scrubber — chunky "ruler" slider with two-tier tick marks (long majors,
 * short minors) like a real ruler. Fill bar and thumb position transition
 * smoothly when value changes via keyboard / external state, and snap
 * instantly while the user is dragging.
 *
 * Internal helper for the docs site's Customize panel — not a registry item.
 */
export function Scrubber({
  label,
  min,
  max,
  step = (max - min) / 100,
  value,
  onChange,
  disabled = false,
  majorTicks = 5,
  minorPerMajor = 4,
  format,
}: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Pre-compute the tick positions: `majorTicks` interior majors, each with
  // `minorPerMajor` minors between it and the next.
  const ticks: Array<{ left: number; major: boolean }> = [];
  const segments = majorTicks + 1;
  const totalMinor = segments * minorPerMajor;
  const totalSteps = majorTicks + totalMinor;
  for (let i = 1; i < totalSteps; i++) {
    const pos = (i / totalSteps) * 100;
    // Major positions are those at multiples of (minorPerMajor + 1)
    const major = i % (minorPerMajor + 1) === 0;
    ticks.push({ left: pos, major });
  }

  return (
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
      data-disabled={disabled || undefined}
      data-active={isHovered || isDragging || undefined}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={onKeyDown}
      className={[
        "relative h-full min-h-12 select-none overflow-hidden rounded-lg border border-white/10 bg-neutral-900/80",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-ew-resize",
        "transition-colors hover:border-white/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300/40",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-y-0 left-0 bg-white/[0.06]",
          // Animate the fill width except while the user is actively dragging
          // (where transitions would lag behind the cursor).
          isDragging
            ? ""
            : "transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
        {ticks.map((t, i) => (
          <div
            key={i}
            className={[
              "absolute top-1/2 w-px -translate-y-1/2",
              t.major ? "h-4 bg-white/25" : "h-1.5 bg-white/10",
            ].join(" ")}
            style={{ left: `${t.left}%` }}
          />
        ))}
      </div>
      <div
        className={[
          "pointer-events-none absolute inset-y-1",
          isDragging
            ? ""
            : "transition-[left] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ left: `${pct}%` }}
      >
        <div className="absolute -left-px top-0 h-full w-0.5 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </div>
      <div className="pointer-events-none absolute left-3 top-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="pointer-events-none absolute right-3 top-1.5 font-mono text-[11px] text-neutral-200">
        {formatted}
      </div>
    </div>
  );
}

function prettify(value: number): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.?0+$/, "");
}
