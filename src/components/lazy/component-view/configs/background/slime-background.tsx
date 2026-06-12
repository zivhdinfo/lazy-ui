import {
  SlimeBackground,
  type SlimePalette,
} from "@/components/lazy-ui/slime-background";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtX } from "@/components/lazy/component-detail/format";
import { HeroOverlay } from "@/components/lazy/component-detail/hero-overlay";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/slime-background"),
  export: "SlimeBackground",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "toxic") as SlimePalette;
    const speed = (v.speed ?? 0.35) as number;
    const viscosity = (v.viscosity ?? 0.85) as number;
    const shine = (v.shine ?? 1) as number;
    const roughness = (v.roughness ?? 0.35) as number;
    const detail = (v.detail ?? 1) as number;
    const contrast = (v.contrast ?? 0.5) as number;
    const grain = (v.grain ?? 0.04) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.6) as number;
    const showContent = (v.showContent ?? true) as boolean;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <SlimeBackground
          palette={palette}
          speed={speed}
          viscosity={viscosity}
          shine={shine}
          roughness={roughness}
          detail={detail}
          contrast={contrast}
          grain={grain}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          className="h-[480px] w-full rounded-2xl"
        >
          {showContent && (
            <HeroOverlay
              eyebrow="Press the surface"
              title={
                <>
                  Wet, slow,
                  <br />
                  <span className="font-semibold italic">alive.</span>
                </>
              }
              description="A double-warped FBM height field, lit by a single key light. Move the cursor — the slime dimples under the pointer."
            />
          )}
        </SlimeBackground>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "toxic", label: "Toxic" },
        { value: "magma", label: "Magma" },
        { value: "azure", label: "Azure" },
        { value: "amber", label: "Amber" },
        { value: "silver", label: "Silver" },
      ],
      "toxic",
    ),
    toggle("showContent", "Show content", true),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.35,
      format: fmtX,
    }),
    slider("viscosity", "Viscosity", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 0.85,
      format: fmt2,
    }),
    slider("shine", "Shine", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("roughness", "Roughness", {
      min: 0,
      max: 1,
      step: 0.02,
      defaultValue: 0.35,
      format: fmt2,
    }),
    slider("detail", "Detail", {
      min: 0.2,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("contrast", "Contrast", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
      format: fmt2,
    }),
    slider("grain", "Grain", {
      min: 0,
      max: 0.2,
      step: 0.005,
      defaultValue: 0.04,
      format: fmt3,
    }),
    slider("mouseInfluence", "Mouse press", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
      format: fmt2,
    }),
    toggle("mouseFollow", "Mouse follow", true),
  ],
};
