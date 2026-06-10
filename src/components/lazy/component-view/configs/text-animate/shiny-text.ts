import type { ShinyTextVariant } from "@/components/lazy-ui/text-animate/shiny-text";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtPct, fmtSec1 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/shiny-text"),
  export: "ShinyText",
  frame: "center",
  stageMinHeight: 340,
  staticProps: {
    children: "Shiny Text",
    className: "text-5xl font-semibold text-[var(--text)]",
  },
  mapProps: (v) => ({
    duration: v.duration ?? 5,
    intensity: v.intensity ?? 0.32,
    variant: (v.variant ?? "beam") as ShinyTextVariant,
    disabled: v.disabled ?? false,
  }),
  controls: [
    slider("duration", "Duration (s)", {
      min: 1,
      max: 12,
      step: 0.5,
      defaultValue: 5,
      format: fmtSec1,
    }),
    slider("intensity", "Intensity", {
      min: 0.05,
      max: 0.8,
      step: 0.05,
      defaultValue: 0.32,
      format: fmtPct,
    }),
    select(
      "variant",
      "Variant",
      [
        { value: "beam", label: "Beam" },
        { value: "glass", label: "Glass" },
      ],
      "beam",
    ),
    toggle("disabled", "Disabled", false),
  ],
};
