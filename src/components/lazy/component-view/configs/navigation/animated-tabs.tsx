import { type AnimateMode } from "@/components/lazy-ui/animated-tabs";
import { AnimatedTabsDemo } from "@/components/lazy/animated-tabs-demo";
import { select } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Theme-aware preview surface. AnimatedTabs ships dark-only (translucent
// white-on-dark), so it keeps lower contrast on the light surface by design.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/animated-tabs"),
  export: "AnimatedTabs",
  stageMinHeight: 460,
  render: (v) => (
    <div className="flex w-full items-center justify-center">
      <div className="flex w-full max-w-sm items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] p-6">
        <AnimatedTabsDemo
          animate={(v.animate ?? "basic") as AnimateMode}
          className="w-full"
        />
      </div>
    </div>
  ),
  controls: [
    select(
      "animate",
      "Animate",
      [
        { value: "basic", label: "Basic" },
        { value: "blur", label: "Blur" },
      ],
      "basic",
    ),
  ],
};
