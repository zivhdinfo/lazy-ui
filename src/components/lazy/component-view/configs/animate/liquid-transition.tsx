import {
  LiquidTransition,
  type LiquidTransitionDirection,
} from "@/components/lazy-ui/liquid-transition";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt1, fmt2, fmt3, fmtMs } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/liquid-transition"),
  export: "LiquidTransition",
  stageMinHeight: 560,
  render: (v) => {
    const duration = (v.duration ?? 2400) as number;
    const hold = (v.hold ?? 1200) as number;
    const distortion = (v.distortion ?? 0.08) as number;
    const softness = (v.softness ?? 0.18) as number;
    const noiseScale = (v.noiseScale ?? 2.4) as number;
    const drip = (v.drip ?? 0.55) as number;
    const direction = (v.direction ?? "noise") as LiquidTransitionDirection;
    const autoPlay = (v.autoPlay ?? true) as boolean;
    const loop = (v.loop ?? true) as boolean;
    // Remount when loop toggles off so the user can replay the one-shot.
    const replayKey = `${direction}-${loop ? 1 : 0}-${autoPlay ? 1 : 0}`;
    return (
      <div className="relative h-full min-h-[520px] w-full self-stretch overflow-hidden rounded-xl bg-black">
        <LiquidTransition
          key={replayKey}
          imageA="/images/liqid-hole-dark.png"
          imageB="/images/liqid-hole-light.png"
          duration={duration}
          hold={hold}
          distortion={distortion}
          softness={softness}
          noiseScale={noiseScale}
          drip={drip}
          direction={direction}
          autoPlay={autoPlay}
          loop={loop}
        />
      </div>
    );
  },
  controls: [
    slider("duration", "Duration", {
      min: 500,
      max: 5000,
      step: 50,
      defaultValue: 2400,
      format: fmtMs,
    }),
    slider("hold", "Hold", {
      min: 0,
      max: 3000,
      step: 50,
      defaultValue: 1200,
      format: fmtMs,
    }),
    slider("distortion", "Distortion", {
      min: 0,
      max: 0.25,
      step: 0.005,
      defaultValue: 0.08,
      format: fmt3,
    }),
    slider("softness", "Softness", {
      min: 0.02,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.18,
      format: fmt2,
    }),
    slider("noiseScale", "Noise scale", {
      min: 0.5,
      max: 6,
      step: 0.1,
      defaultValue: 2.4,
      format: fmt1,
    }),
    slider("drip", "Drip", {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.55,
      format: fmt2,
    }),
    select(
      "direction",
      "Direction",
      [
        { value: "noise", label: "Noise" },
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
        { value: "radial", label: "Radial" },
      ],
      "noise",
    ),
    toggle("autoPlay", "Auto play", true),
    toggle("loop", "Loop", true),
  ],
};
