import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/blocks/pricing-4"),
  export: "Pricing4",
  frame: "block",
  stageMinHeight: 1100,
};
