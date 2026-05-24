import {
  BlingTransition,
  type BlingPalette,
  type BlingTransitionDirection,
} from "@/components/lazy-ui/bling-transition";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "iris") as BlingPalette;
  const direction = (values.direction ?? "noise") as BlingTransitionDirection;
  const duration = (values.duration ?? 4200) as number;
  const hold = (values.hold ?? 1800) as number;
  const intensity = (values.intensity ?? 0.005) as number;
  const iterations = (values.iterations ?? 4) as number;
  const sparkleStrength = (values.sparkleStrength ?? 1) as number;
  const softness = (values.softness ?? 0.22) as number;
  const distortion = (values.distortion ?? 0.08) as number;
  const drip = (values.drip ?? 0.55) as number;
  const autoPlay = (values.autoPlay ?? true) as boolean;
  const loop = (values.loop ?? true) as boolean;
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
}
