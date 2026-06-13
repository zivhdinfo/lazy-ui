import { select } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/blocks/pricing-2"),
  export: "Pricing2",
  frame: "block",
  stageMinHeight: 880,
  mapProps: (v) => ({ period: (v.period ?? "yearly") as string }),
  controls: [
    select(
      "period",
      "Billing",
      [
        { value: "yearly", label: "Annual" },
        { value: "monthly", label: "Monthly" },
      ],
      "yearly",
    ),
  ],
};
