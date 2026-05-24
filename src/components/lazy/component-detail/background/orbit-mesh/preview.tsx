import {
  OrbitMesh,
  type OrbitMeshEffect,
} from "@/components/lazy-ui/orbit-mesh";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const effect = (values.effect ?? "wave") as OrbitMeshEffect;
  const speed = (values.speed ?? 0.5) as number;
  const scale = (values.scale ?? 0.4) as number;
  const colorLayers = (values.colorLayers ?? 3) as number;
  const spiralArms = (values.spiralArms ?? 5) as number;
  const waveIntensity = (values.waveIntensity ?? 0.22) as number;
  const spiralIntensity = (values.spiralIntensity ?? 2) as number;
  const lineThickness = (values.lineThickness ?? 0.13) as number;
  const falloff = (values.falloff ?? 1.65) as number;
  const brightness = (values.brightness ?? 3) as number;
  const colorTint = (values.colorTint ?? "#7c3aed") as string;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <OrbitMesh
        effect={effect}
        speed={speed}
        scale={scale}
        colorLayers={colorLayers}
        spiralArms={spiralArms}
        waveIntensity={waveIntensity}
        spiralIntensity={spiralIntensity}
        lineThickness={lineThickness}
        falloff={falloff}
        brightness={brightness}
        colorTint={colorTint}
      />
      <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-200 backdrop-blur-sm">
          Background
        </span>
        <h3 className="text-4xl font-light text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          Build lazily.
        </h3>
        <p className="text-sm text-neutral-300">
          Streaks of light woven through a smooth radial wave — switch
          between ripple, spiral, vortex, and pulse.
        </p>
      </div>
    </div>
  );
}
