import type {
  ShinyButtonSize,
  ShinyButtonTone,
} from "@/components/lazy-ui/shiny-button";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtCount, fmtPct, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/shiny-button"),
  export: "ShinyButton",
  frame: "center",
  // Roomy stage on purpose: the shine answers the approach, so the pointer
  // needs somewhere to approach from.
  stageMinHeight: 460,
  mapProps: (v) => ({
    children: v.label,
    tone: v.tone as ShinyButtonTone,
    size: v.size as ShinyButtonSize,
    proximity: v.proximity,
    shine: v.shine,
    slashWidth: v.slashWidth,
    tilt: v.tilt,
    glow: v.glow,
  }),
  controls: [
    select(
      "label",
      "Label",
      [
        { value: "Continue with Discord", label: "Continue with Discord" },
        { value: "Sign in", label: "Sign in" },
        { value: "Create account", label: "Create account" },
        { value: "Deploy now", label: "Deploy now" },
      ],
      "Continue with Discord",
    ),
    select(
      "tone",
      "Tone",
      [
        { value: "ink", label: "Ink (theme-aware)" },
        { value: "midnight", label: "Midnight" },
        { value: "violet", label: "Violet" },
        { value: "glass", label: "Glass" },
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
    slider("proximity", "Proximity", {
      min: 0,
      max: 400,
      step: 10,
      defaultValue: 140,
      format: fmtPx,
    }),
    slider("shine", "Shine", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.65,
      format: fmtPct,
    }),
    slider("slashWidth", "Slash width", {
      min: 16,
      max: 200,
      step: 4,
      defaultValue: 56,
      format: fmtPx,
    }),
    slider("tilt", "Tilt", {
      min: -45,
      max: 45,
      step: 1,
      defaultValue: 18,
      format: fmtCount,
    }),
    toggle("glow", "Hover glow", true),
  ],
};
