import {
  OrbitMesh,
  type OrbitMeshEffect,
} from "@/components/lazy-ui/orbit-mesh";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtCount, fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/orbit-mesh"),
  export: "OrbitMesh",
  stageMinHeight: 560,
  render: (v) => {
    const effect = (v.effect ?? "wave") as OrbitMeshEffect;
    const speed = (v.speed ?? 0.5) as number;
    const scale = (v.scale ?? 0.4) as number;
    const colorLayers = (v.colorLayers ?? 3) as number;
    const spiralArms = (v.spiralArms ?? 5) as number;
    const waveIntensity = (v.waveIntensity ?? 0.22) as number;
    const spiralIntensity = (v.spiralIntensity ?? 2) as number;
    const lineThickness = (v.lineThickness ?? 0.13) as number;
    const falloff = (v.falloff ?? 1.65) as number;
    const brightness = (v.brightness ?? 3) as number;
    const colorTint = (v.colorTint ?? "#7c3aed") as string;
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
  },
  controls: [
    select(
      "effect",
      "Effect",
      [
        { value: "wave", label: "Wave" },
        { value: "spiral", label: "Spiral" },
        { value: "ripple", label: "Ripple" },
        { value: "vortex", label: "Vortex" },
        { value: "pulse", label: "Pulse" },
        { value: "bloom", label: "Bloom" },
      ],
      "wave",
    ),
    slider("scale", "Scale", {
      min: 0.2,
      max: 3,
      step: 0.05,
      defaultValue: 0.4,
      format: fmtX,
    }),
    slider("colorLayers", "Color layers", {
      min: 1,
      max: 6,
      step: 1,
      defaultValue: 3,
      format: fmtCount,
    }),
    slider("spiralArms", "Arms", {
      min: 0,
      max: 12,
      step: 1,
      defaultValue: 5,
      format: fmtCount,
    }),
    slider("waveIntensity", "Wave", {
      min: 0,
      max: 0.6,
      step: 0.01,
      defaultValue: 0.22,
      format: fmt2,
    }),
    slider("spiralIntensity", "Spiral", {
      min: 0,
      max: 3,
      step: 0.05,
      defaultValue: 2,
      format: fmt2,
    }),
    slider("lineThickness", "Thickness", {
      min: 0.01,
      max: 0.3,
      step: 0.005,
      defaultValue: 0.13,
      format: fmt3,
    }),
    slider("falloff", "Falloff", {
      min: 0.1,
      max: 3,
      step: 0.05,
      defaultValue: 1.65,
      format: fmt2,
    }),
    slider("brightness", "Brightness", {
      min: 0.1,
      max: 3,
      step: 0.05,
      defaultValue: 3,
      format: fmt2,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 0.5,
      format: fmtX,
    }),
    select(
      "colorTint",
      "Color tint",
      [
        { value: "#7c3aed", label: "Violet" },
        { value: "#c084fc", label: "Lavender" },
        { value: "#f0abfc", label: "Pink" },
        { value: "#22d3ee", label: "Cyan" },
        { value: "#fcd34d", label: "Amber" },
        { value: "#de7343", label: "Ember" },
      ],
      "#7c3aed",
    ),
  ],
};
