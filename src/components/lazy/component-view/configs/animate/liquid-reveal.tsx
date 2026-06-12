import { LiquidReveal } from "@/components/lazy-ui/liquid-reveal";
import { slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtPx, fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/liquid-reveal"),
  export: "LiquidReveal",
  stageMinHeight: 560,
  render: (v) => {
    const cursorSize = (v.cursorSize ?? 200) as number;
    const mouseForce = (v.mouseForce ?? 60) as number;
    const resolution = (v.resolution ?? 0.5) as number;
    const viscous = (v.viscous ?? 42) as number;
    const revealStrength = (v.revealStrength ?? 1) as number;
    const revealSoftness = (v.revealSoftness ?? 0.85) as number;
    const autoDemo = (v.autoDemo ?? true) as boolean;
    const autoSpeed = (v.autoSpeed ?? 0.5) as number;
    return (
      <div className="relative h-full min-h-[520px] w-full self-stretch overflow-hidden rounded-xl bg-black">
        <LiquidReveal
          frontImage="/images/armor.png"
          backImage="/images/human.png"
          cursorSize={cursorSize}
          mouseForce={mouseForce}
          resolution={resolution}
          viscous={viscous}
          revealStrength={revealStrength}
          revealSoftness={revealSoftness}
          autoDemo={autoDemo}
          autoSpeed={autoSpeed}
        />
      </div>
    );
  },
  controls: [
    slider("cursorSize", "Cursor size", {
      min: 60,
      max: 420,
      step: 10,
      defaultValue: 200,
      format: fmtPx,
    }),
    slider("mouseForce", "Mouse force", {
      min: 10,
      max: 120,
      step: 1,
      defaultValue: 60,
      format: (n) => `${Math.round(n)}`,
    }),
    slider("resolution", "Resolution", {
      min: 0.25,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
      format: fmtX,
    }),
    slider("viscous", "Viscosity", {
      min: 0,
      max: 80,
      step: 1,
      defaultValue: 42,
      format: (n) => `${Math.round(n)}`,
    }),
    slider("revealStrength", "Reveal strength", {
      min: 0.2,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("revealSoftness", "Reveal softness", {
      min: 0.1,
      max: 2,
      step: 0.05,
      defaultValue: 0.85,
      format: fmt2,
    }),
    slider("autoSpeed", "Auto speed", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 0.5,
      format: (n) => `${n.toFixed(2)}`,
    }),
    toggle("autoDemo", "Auto demo", true),
  ],
};
