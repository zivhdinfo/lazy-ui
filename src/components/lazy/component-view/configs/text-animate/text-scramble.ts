import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmtMs } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/text-scramble"),
  export: "TextScramble",
  frame: "center",
  stageMinHeight: 340,
  staticProps: {
    text: "Hover to decode.",
    className: "text-3xl font-mono text-[var(--text)]",
  },
  mapProps: (v) => ({
    trigger: (v.trigger ?? "hover") as string,
    easing: (v.easing ?? "linear") as string,
    charset: (v.charset ?? "X$@aHzo0y#?*01+") as string,
    duration: v.duration ?? 800,
    tickMs: v.tickMs ?? 30,
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
      "easing",
      "Easing",
      [
        { value: "linear", label: "Linear" },
        { value: "ease-in", label: "Ease in" },
        { value: "ease-out", label: "Ease out" },
        { value: "ease-in-out", label: "Ease in-out" },
      ],
      "linear",
    ),
    select(
      "charset",
      "Charset",
      [
        { value: "X$@aHzo0y#?*01+", label: "Mixed (default)" },
        { value: "01", label: "Binary" },
        { value: "0123456789ABCDEF", label: "Hex" },
        { value: "abcdefghijklmnopqrstuvwxyz", label: "Lowercase" },
      ],
      "X$@aHzo0y#?*01+",
    ),
    slider("duration", "Duration (ms)", {
      min: 200,
      max: 3000,
      step: 50,
      defaultValue: 800,
      format: fmtMs,
    }),
    slider("tickMs", "Tick (ms)", {
      min: 10,
      max: 120,
      step: 5,
      defaultValue: 30,
      format: fmtMs,
    }),
  ],
};
