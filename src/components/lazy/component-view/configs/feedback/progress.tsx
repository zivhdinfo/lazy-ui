import { Progress } from "@/components/lazy-ui/progress";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Theme-aware preview surface; the bar now follows the theme (ink fill on
// light, white fill on dark).
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/progress"),
  export: "Progress",
  stageMinHeight: 320,
  render: (v) => {
    const value = (v.value ?? 60) as number;
    const indeterminate = (v.indeterminate ?? false) as boolean;
    const size = (v.size ?? "md") as "sm" | "md" | "lg";
    const animation = (v.animation ?? "spring") as
      | "spring"
      | "smooth"
      | "wobble";
    const effect = (v.effect ?? "glow") as
      | "none"
      | "stripes"
      | "glow"
      | "pulse";
    const glowPalette = (v.glowPalette ?? "default") as
      | "default"
      | "rainbow"
      | "warm"
      | "cool";
    const valuePosition = (v.valuePosition ?? "end") as
      | "hidden"
      | "end"
      | "above-leading"
      | "inside-leading"
      | "edge-leading";
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex min-h-36 w-full max-w-md items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] px-8 py-10">
          <Progress
            value={indeterminate ? null : value}
            size={size}
            animation={animation}
            effect={effect}
            glowPalette={glowPalette}
            valuePosition={valuePosition}
            className="w-full"
          />
        </div>
      </div>
    );
  },
  controls: [
    slider("value", "Value", {
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 60,
      format: (n: number) => `${Math.round(n)}%`,
    }),
    toggle("indeterminate", "Indeterminate", false),
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
    select(
      "animation",
      "Animation",
      [
        { value: "spring", label: "Spring" },
        { value: "smooth", label: "Smooth" },
        { value: "wobble", label: "Wobble" },
      ],
      "spring",
    ),
    select(
      "effect",
      "Effect",
      [
        { value: "none", label: "None" },
        { value: "stripes", label: "Stripes" },
        { value: "glow", label: "Glow gradient" },
        { value: "pulse", label: "Pulse" },
      ],
      "glow",
    ),
    select(
      "glowPalette",
      "Glow palette",
      [
        { value: "default", label: "Default (2)" },
        { value: "rainbow", label: "Rainbow (7)" },
        { value: "warm", label: "Warm (3)" },
        { value: "cool", label: "Cool (3)" },
      ],
      "default",
    ),
    select(
      "valuePosition",
      "Value position",
      [
        { value: "hidden", label: "Hidden" },
        { value: "end", label: "End (above-right)" },
        { value: "above-leading", label: "Above leading" },
        { value: "inside-leading", label: "Inside leading" },
        { value: "edge-leading", label: "Edge leading" },
      ],
      "end",
    ),
  ],
};
