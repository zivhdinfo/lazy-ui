import type {
  ShimmerButtonSize,
  ShimmerButtonTone,
} from "@/components/lazy-ui/shimmer-button";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtSec1 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/shimmer-button"),
  export: "ShimmerButton",
  frame: "center",
  stageMinHeight: 420,
  mapProps: (v) => ({
    children: v.label,
    tone: v.tone as ShimmerButtonTone,
    size: v.size as ShimmerButtonSize,
    speed: v.speed,
    shimmer: v.shimmer,
    glow: v.glow,
  }),
  controls: [
    select(
      "label",
      "Label",
      [
        { value: "Get the desktop app", label: "Get the desktop app" },
        { value: "Download for Windows", label: "Download for Windows" },
        { value: "Start free trial", label: "Start free trial" },
        { value: "Deploy now", label: "Deploy now" },
      ],
      "Get the desktop app",
    ),
    select(
      "tone",
      "Tone",
      [
        { value: "ink", label: "Ink (theme-aware)" },
        { value: "violet", label: "Violet" },
        { value: "azure", label: "Azure" },
        { value: "ember", label: "Ember" },
      ],
      "ink",
    ),
    select(
      "size",
      "Size",
      [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      "md",
    ),
    slider("speed", "Cycle", {
      min: 1,
      max: 8,
      step: 0.2,
      defaultValue: 3.4,
      format: fmtSec1,
    }),
    toggle("shimmer", "Shimmer", true),
    toggle("glow", "Glow", true),
  ],
};
