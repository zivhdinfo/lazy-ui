import {
  ChromaFlow,
  type ChromaPalette,
} from "@/components/lazy-ui/chroma-flow";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtCount, fmtX } from "@/components/lazy/component-detail/format";
import { HeroOverlay } from "@/components/lazy/component-detail/hero-overlay";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/chroma-flow"),
  export: "ChromaFlow",
  stageMinHeight: 680,
  render: (v) => {
    const palette = (v.palette ?? "sunset") as ChromaPalette;
    const speed = (v.speed ?? 0.5) as number;
    const density = (v.density ?? 13) as number;
    const flow = (v.flow ?? 1) as number;
    const glow = (v.glow ?? 0.55) as number;
    const vignette = (v.vignette ?? 0.55) as number;
    const grain = (v.grain ?? 0.04) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.5) as number;

    return (
      <div className="flex min-h-[640px] w-full items-center justify-center p-4">
        <ChromaFlow
          palette={palette}
          speed={speed}
          density={density}
          flow={flow}
          glow={glow}
          vignette={vignette}
          grain={grain}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          className="h-[600px] w-full rounded-2xl"
        >
          <HeroOverlay
            eyebrow="Move the cursor — streaks orbit"
            title={
              <>
                Backgrounds that
                <br />
                <span className="font-semibold italic">bend with you.</span>
              </>
            }
            description="Vertical streaks ride a curl field, painted with a rainbow gradient. The cursor bends them into orbit around a ring — accretion disk, not hot point."
          />
        </ChromaFlow>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "sunset", label: "Sunset" },
        { value: "electric", label: "Electric" },
        { value: "aurora", label: "Aurora" },
        { value: "ocean", label: "Ocean" },
        { value: "void", label: "Void" },
        { value: "silver", label: "Silver" },
      ],
      "sunset",
    ),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.5,
      format: fmtX,
    }),
    slider("density", "Density", {
      min: 4,
      max: 40,
      step: 1,
      defaultValue: 13,
      format: fmtCount,
    }),
    slider("flow", "Flow", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("glow", "Glow", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.55,
      format: fmt2,
    }),
    slider("vignette", "Vignette", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.55,
      format: fmt2,
    }),
    slider("grain", "Grain", {
      min: 0,
      max: 0.2,
      step: 0.005,
      defaultValue: 0.04,
      format: fmt3,
    }),
    slider("mouseInfluence", "Mouse pulse", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
      format: fmt2,
    }),
    toggle("mouseFollow", "Mouse follow", true),
  ],
};
