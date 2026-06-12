import {
  SmoothCursor,
  type SmoothCursorTrigger,
} from "@/components/lazy-ui/smooth-cursor";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

const LABELS: Record<string, { text: string; label: string }> = {
  "#f97316": { text: "#fff7ed", label: "Ember" },
  "#10b981": { text: "#ecfdf5", label: "Mint" },
  "#38bdf8": { text: "#082f49", label: "Sky" },
  "#fb7185": { text: "#fff1f2", label: "Rose" },
};

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/smooth-cursor"),
  export: "SmoothCursor",
  stageMinHeight: 500,
  render: (v) => {
    const trigger = (v.trigger ?? "hover") as SmoothCursorTrigger;
    const color = (v.color ?? "#f97316") as string;
    const size = (v.size ?? 28) as number;
    const tiltStrength = (v.tiltStrength ?? 12) as number;
    const pressScale = (v.pressScale ?? 0.92) as number;
    const showLabel = (v.showLabel ?? true) as boolean;
    const theme = LABELS[color] ?? LABELS["#f97316"];

    return (
      <div className="flex min-h-[460px] w-full items-center justify-center bg-[var(--preview-bg)] p-5">
        <SmoothCursor
          label={theme.label}
          color={color}
          textColor={theme.text}
          trigger={trigger}
          size={size}
          tiltStrength={tiltStrength}
          pressScale={pressScale}
          showLabel={showLabel}
          className="grid w-full max-w-[720px] gap-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            {["Prototype", "Motion", "Review"].map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-[var(--border-2)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--text-3)] hover:bg-[var(--panel-2)]"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Timeline", "Assets", "Launch"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-[var(--border-2)] bg-[var(--panel)] p-4 text-sm text-[var(--text-2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </SmoothCursor>
      </div>
    );
  },
  controls: [
    select(
      "trigger",
      "Trigger",
      [
        { value: "hover", label: "Hover" },
        { value: "press", label: "Press" },
        { value: "always", label: "Always" },
      ],
      "hover",
    ),
    select(
      "color",
      "Color",
      [
        { value: "#f97316", label: "Ember" },
        { value: "#10b981", label: "Mint" },
        { value: "#38bdf8", label: "Sky" },
        { value: "#fb7185", label: "Rose" },
      ],
      "#f97316",
    ),
    slider("size", "Size", {
      min: 20,
      max: 44,
      step: 1,
      defaultValue: 28,
      format: fmtPx,
    }),
    slider("tiltStrength", "Tilt", {
      min: 0,
      max: 22,
      step: 1,
      defaultValue: 12,
      format: (n) => `${Math.round(n)}deg`,
    }),
    slider("pressScale", "Press scale", {
      min: 0.82,
      max: 1,
      step: 0.01,
      defaultValue: 0.92,
      format: fmt2,
    }),
    toggle("showLabel", "Show label", true),
  ],
};
