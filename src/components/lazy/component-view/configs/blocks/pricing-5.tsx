import { slider } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/blocks/pricing-5"),
  export: "Pricing5",
  frame: "block",
  stageMinHeight: 880,
  mapProps: (v) => ({ defaultTier: (v.defaultTier ?? 2) as number }),
  controls: [
    slider("defaultTier", "Starting tier", {
      min: 0,
      max: 5,
      step: 1,
      defaultValue: 2,
      format: (n) =>
        ["Free", "Starter", "Team", "Scale", "Business", "Enterprise"][n] ??
        `${n}`,
    }),
  ],
};
