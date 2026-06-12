import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmtPx, fmtSec2 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/text-flip"),
  export: "TextFlip",
  frame: "center",
  stageMinHeight: 340,
  staticProps: {
    text: "Hover to flip.",
    className: "text-5xl font-light text-[var(--text)]",
  },
  mapProps: (v) => ({
    trigger: (v.trigger ?? "hover") as string,
    direction: (v.direction ?? "right") as string,
    staggerFrom: (v.staggerFrom ?? "first") as string,
    stagger: v.stagger ?? 0.04,
    duration: v.duration ?? 0.55,
    perspective: v.perspective ?? 1000,
  }),
  controls: [
    select(
      "trigger",
      "Trigger",
      [
        { value: "hover", label: "Hover" },
        { value: "mount", label: "Mount" },
        { value: "view", label: "In view" },
      ],
      "hover",
    ),
    select(
      "direction",
      "Direction",
      [
        { value: "top", label: "Top" },
        { value: "right", label: "Right" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
      ],
      "right",
    ),
    select(
      "staggerFrom",
      "Stagger from",
      [
        { value: "first", label: "First" },
        { value: "last", label: "Last" },
        { value: "center", label: "Center" },
      ],
      "first",
    ),
    slider("stagger", "Stagger (s)", {
      min: 0,
      max: 0.2,
      step: 0.01,
      defaultValue: 0.04,
      format: fmtSec2,
    }),
    slider("duration", "Duration (s)", {
      min: 0.2,
      max: 2,
      step: 0.05,
      defaultValue: 0.55,
      format: fmtSec2,
    }),
    slider("perspective", "Perspective (px)", {
      min: 200,
      max: 2400,
      step: 50,
      defaultValue: 1000,
      format: fmtPx,
    }),
  ],
};
