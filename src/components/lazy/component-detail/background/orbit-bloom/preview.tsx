import {
  OrbitBloom,
  type OrbitBloomEffect,
} from "@/components/lazy-ui/orbit-bloom";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const effect = (values.effect ?? "ripple") as OrbitBloomEffect;
  const columns = (values.columns ?? 59) as number;
  const rows = (values.rows ?? 32) as number;
  const speed = (values.speed ?? 1) as number;
  const waveFrequency = (values.waveFrequency ?? 4) as number;
  const wavePower = (values.wavePower ?? 7) as number;
  const spiralArms = (values.spiralArms ?? 11) as number;
  const falloff = (values.falloff ?? 1.8) as number;
  const baseAlpha = (values.baseAlpha ?? 0.18) as number;
  const colorSpeed = (values.colorSpeed ?? 3.1) as number;
  const shape = (values.shape ?? 0.85) as number;
  const shapeShift = (values.shapeShift ?? 1) as number;
  const fillRatio = (values.fillRatio ?? 0.6) as number;
  const opacity = (values.opacity ?? 1) as number;
  const color1 = (values.color1 ?? "#7a1f3d") as string;
  const color2 = (values.color2 ?? "#93229D") as string;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <OrbitBloom
        effect={effect}
        columns={columns}
        rows={rows}
        speed={speed}
        waveFrequency={waveFrequency}
        wavePower={wavePower}
        spiralArms={spiralArms}
        falloff={falloff}
        baseAlpha={baseAlpha}
        colorSpeed={colorSpeed}
        shape={shape}
        shapeShift={shapeShift}
        fillRatio={fillRatio}
        opacity={opacity}
        color1={color1}
        color2={color2}
      />
      <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-200 backdrop-blur-sm">
          Background
        </span>
        <h3 className="text-4xl font-light text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          Build lazily.
        </h3>
        <p className="text-sm text-neutral-300">
          Shape-based sibling of Orbit Cipher — circles morph to squares as
          crests pass.
        </p>
      </div>
    </div>
  );
}
