import {
  OrbitCipher,
  type OrbitCipherEffect,
} from "@/components/lazy-ui/orbit-cipher";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const effect = (values.effect ?? "spiral") as OrbitCipherEffect;
  const columns = (values.columns ?? 36) as number;
  const rows = (values.rows ?? 22) as number;
  const speed = (values.speed ?? 1) as number;
  const waveFrequency = (values.waveFrequency ?? 1) as number;
  const wavePower = (values.wavePower ?? 4) as number;
  const spiralArms = (values.spiralArms ?? 3) as number;
  const falloff = (values.falloff ?? 1.5) as number;
  const baseAlpha = (values.baseAlpha ?? 0.05) as number;
  const colorSpeed = (values.colorSpeed ?? 1) as number;
  const opacity = (values.opacity ?? 1) as number;
  const color1 = (values.color1 ?? "#7c3aed") as string;
  const color2 = (values.color2 ?? "#f0abfc") as string;
  const characters = (values.characters ?? "0123456789ABCDEF") as string;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <OrbitCipher
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
        opacity={opacity}
        color1={color1}
        color2={color2}
        characters={characters}
      />
      <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-200 backdrop-blur-sm">
          Background
        </span>
        <h3 className="text-4xl font-light text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          Build lazily.
        </h3>
        <p className="text-sm text-neutral-300">
          Four effect modes, configurable center, falloff, and two-tone palette.
        </p>
      </div>
    </div>
  );
}
