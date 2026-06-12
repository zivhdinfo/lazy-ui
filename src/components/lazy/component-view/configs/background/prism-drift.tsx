import {
  PrismDrift,
  type PrismLayout,
  type PrismPalette,
} from "@/components/lazy-ui/prism-drift";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/prism-drift"),
  export: "PrismDrift",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "ember") as PrismPalette;
    const layout = (v.layout ?? "diagonal") as PrismLayout;
    const softness = (v.softness ?? 0.76) as number;
    const intensity = (v.intensity ?? 1.1) as number;
    const grain = (v.grain ?? 0.2) as number;
    const speed = (v.speed ?? 0.6) as number;
    const drift = (v.drift ?? 0.05) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.4) as number;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <PrismDrift
          palette={palette}
          layout={layout}
          softness={softness}
          intensity={intensity}
          grain={grain}
          speed={speed}
          drift={drift}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          className="h-[480px] w-full rounded-2xl"
        >
          <main className="relative z-10 flex h-full items-center justify-center px-6">
            <h1 className="text-center text-balance text-5xl font-light tracking-tight text-white">
              Backgrounds are awesome :)
            </h1>
          </main>
        </PrismDrift>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "ember", label: "Ember" },
        { value: "iris", label: "Iris" },
        { value: "ocean", label: "Ocean" },
        { value: "candy", label: "Candy" },
        { value: "void", label: "Void" },
        { value: "silver", label: "Silver" },
      ],
      "ember",
    ),
    select(
      "layout",
      "Layout",
      [
        { value: "diagonal", label: "Diagonal" },
        { value: "anti-diagonal", label: "Anti-diagonal" },
        { value: "corners", label: "All corners" },
      ],
      "diagonal",
    ),
    slider("softness", "Softness", {
      min: 0.2,
      max: 1,
      step: 0.02,
      defaultValue: 0.76,
      format: fmt2,
    }),
    slider("intensity", "Intensity", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1.1,
      format: fmt2,
    }),
    slider("grain", "Grain", {
      min: 0,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.2,
      format: fmt2,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.6,
      format: fmtX,
    }),
    slider("drift", "Drift", {
      min: 0,
      max: 0.2,
      step: 0.005,
      defaultValue: 0.05,
      format: fmt3,
    }),
    slider("mouseInfluence", "Mouse pull", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.4,
      format: fmt2,
    }),
    toggle("mouseFollow", "Mouse follow", true),
  ],
};
