import {
  BlingTransition,
  type BlingPalette,
  type BlingTransitionDirection,
} from "@/components/lazy-ui/bling-transition";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtCount, fmtMs } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/bling-transition"),
  export: "BlingTransition",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "iris") as BlingPalette;
    const direction = (v.direction ?? "noise") as BlingTransitionDirection;
    const duration = (v.duration ?? 4200) as number;
    const hold = (v.hold ?? 1800) as number;
    const intensity = (v.intensity ?? 0.005) as number;
    const iterations = (v.iterations ?? 4) as number;
    const sparkleStrength = (v.sparkleStrength ?? 1) as number;
    const softness = (v.softness ?? 0.22) as number;
    const distortion = (v.distortion ?? 0.08) as number;
    const drip = (v.drip ?? 0.55) as number;
    const autoPlay = (v.autoPlay ?? true) as boolean;
    const loop = (v.loop ?? true) as boolean;
    // Remount on direction / loop / autoplay toggle so the sweep restarts.
    const replayKey = `${direction}-${loop ? 1 : 0}-${autoPlay ? 1 : 0}`;
    return (
      <div className="relative h-full min-h-[520px] w-full self-stretch overflow-hidden rounded-xl bg-black">
        <BlingTransition
          key={replayKey}
          imageA="/images/caitlyn.jpg"
          imageB="/images/no-caitlyn.jpg"
          palette={palette}
          direction={direction}
          duration={duration}
          hold={hold}
          intensity={intensity}
          iterations={iterations}
          sparkleStrength={sparkleStrength}
          softness={softness}
          distortion={distortion}
          drip={drip}
          autoPlay={autoPlay}
          loop={loop}
        />
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "iris", label: "Iris" },
        { value: "ember", label: "Ember" },
        { value: "ice", label: "Ice" },
        { value: "silver", label: "Silver" },
      ],
      "iris",
    ),
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
    slider("duration", "Duration", {
      min: 400,
      max: 8000,
      step: 100,
      defaultValue: 4200,
      format: fmtMs,
    }),
    slider("hold", "Hold", {
      min: 0,
      max: 4000,
      step: 100,
      defaultValue: 1800,
      format: fmtMs,
    }),
    slider("intensity", "Intensity", {
      min: 0.001,
      max: 0.02,
      step: 0.0005,
      defaultValue: 0.005,
      format: (n) => n.toFixed(4),
    }),
    slider("iterations", "Iterations", {
      min: 1,
      max: 6,
      step: 1,
      defaultValue: 4,
      format: fmtCount,
    }),
    slider("sparkleStrength", "Sparkle", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("softness", "Softness", {
      min: 0,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.22,
      format: fmt2,
    }),
    slider("distortion", "Distortion", {
      min: 0,
      max: 0.3,
      step: 0.005,
      defaultValue: 0.08,
      format: fmt3,
    }),
    slider("drip", "Drip", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.55,
      format: fmt2,
    }),
    toggle("autoPlay", "Auto play", true),
    toggle("loop", "Loop", true),
  ],
};
