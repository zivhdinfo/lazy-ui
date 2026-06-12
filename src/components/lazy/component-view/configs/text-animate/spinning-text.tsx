import { SpinningText } from "@/components/lazy-ui/text-animate/spinning-text";
import { slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtSec1 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/spinning-text"),
  export: "SpinningText",
  stageMinHeight: 380,
  render: (v) => {
    const reverse = (v.reverse ?? false) as boolean;
    const radius = (v.radius ?? 5) as number;
    const duration = (v.duration ?? 14) as number;

    return (
      <div className="flex min-h-64 items-center justify-center px-6 py-6">
        <SpinningText
          duration={duration}
          radius={radius}
          reverse={reverse}
          center={<span className="text-2xl text-[var(--text)]">★</span>}
          className="text-[12px] tracking-[0.18em] text-[var(--text)]"
        >
          BUILD LAZILY • BUILD LAZILY •
        </SpinningText>
      </div>
    );
  },
  controls: [
    toggle("reverse", "Counter-clockwise", false),
    slider("radius", "Radius (ch)", {
      min: 3,
      max: 10,
      step: 0.5,
      defaultValue: 5,
      format: (n) => `${n.toFixed(1)}ch`,
    }),
    slider("duration", "Duration (s)", {
      min: 2,
      max: 30,
      step: 0.5,
      defaultValue: 14,
      format: fmtSec1,
    }),
  ],
};
