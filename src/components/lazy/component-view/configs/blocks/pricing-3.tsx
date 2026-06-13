import { slider } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/blocks/pricing-3"),
  export: "Pricing3",
  frame: "block",
  stageMinHeight: 920,
  mapProps: (v) => ({ featuredIndex: (v.featuredIndex ?? 1) as number }),
  controls: [
    slider("featuredIndex", "Featured tier", {
      min: 0,
      max: 2,
      step: 1,
      defaultValue: 1,
      format: (n) => ["1st", "2nd", "3rd"][n] ?? `${n + 1}`,
    }),
  ],
};
