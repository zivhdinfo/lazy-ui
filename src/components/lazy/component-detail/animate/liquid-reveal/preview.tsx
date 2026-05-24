import { LiquidReveal } from "@/components/lazy-ui/liquid-reveal";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const cursorSize = (values.cursorSize ?? 200) as number;
  const mouseForce = (values.mouseForce ?? 60) as number;
  const resolution = (values.resolution ?? 0.5) as number;
  const viscous = (values.viscous ?? 42) as number;
  const revealStrength = (values.revealStrength ?? 1) as number;
  const revealSoftness = (values.revealSoftness ?? 0.85) as number;
  const autoDemo = (values.autoDemo ?? true) as boolean;
  const autoSpeed = (values.autoSpeed ?? 0.5) as number;
  return (
    <div className="relative h-full min-h-[520px] w-full self-stretch overflow-hidden rounded-xl bg-black">
      <LiquidReveal
        frontImage="/images/caitlyn.jpg"
        backImage="/images/no-caitlyn.jpg"
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
}
