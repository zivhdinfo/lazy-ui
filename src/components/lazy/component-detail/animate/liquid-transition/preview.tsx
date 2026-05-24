import {
  LiquidTransition,
  type LiquidTransitionDirection,
} from "@/components/lazy-ui/liquid-transition";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const duration = (values.duration ?? 2400) as number;
  const hold = (values.hold ?? 1200) as number;
  const distortion = (values.distortion ?? 0.08) as number;
  const softness = (values.softness ?? 0.18) as number;
  const noiseScale = (values.noiseScale ?? 2.4) as number;
  const drip = (values.drip ?? 0.55) as number;
  const direction = (values.direction ?? "noise") as LiquidTransitionDirection;
  const autoPlay = (values.autoPlay ?? true) as boolean;
  const loop = (values.loop ?? true) as boolean;
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
}
