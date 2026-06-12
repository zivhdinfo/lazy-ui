import {
  OrbitBloom,
  type OrbitBloomEffect,
} from "@/components/lazy-ui/orbit-bloom";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt1, fmt2, fmtCount, fmtPct, fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/orbit-bloom"),
  export: "OrbitBloom",
  stageMinHeight: 560,
  render: (v) => {
    const effect = (v.effect ?? "ripple") as OrbitBloomEffect;
    const columns = (v.columns ?? 59) as number;
    const rows = (v.rows ?? 32) as number;
    const speed = (v.speed ?? 1) as number;
    const waveFrequency = (v.waveFrequency ?? 4) as number;
    const wavePower = (v.wavePower ?? 7) as number;
    const spiralArms = (v.spiralArms ?? 11) as number;
    const falloff = (v.falloff ?? 1.8) as number;
    const baseAlpha = (v.baseAlpha ?? 0.18) as number;
    const colorSpeed = (v.colorSpeed ?? 3.1) as number;
    const shape = (v.shape ?? 0.85) as number;
    const shapeShift = (v.shapeShift ?? 1) as number;
    const fillRatio = (v.fillRatio ?? 0.6) as number;
    const opacity = (v.opacity ?? 1) as number;
    const color1 = (v.color1 ?? "#7a1f3d") as string;
    const color2 = (v.color2 ?? "#93229D") as string;
    return (
      <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--preview-bg)]">
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
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--text-2)] backdrop-blur-sm">
            Background
          </span>
          <h3 className="text-4xl font-light text-[var(--text)]">
            Build lazily.
          </h3>
          <p className="text-sm text-[var(--text-2)]">
            Shape-based sibling of Orbit Cipher — circles morph to squares as
            crests pass.
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
        { value: "spiral", label: "Spiral" },
        { value: "ripple", label: "Ripple" },
        { value: "vortex", label: "Vortex" },
        { value: "pulse", label: "Pulse" },
      ],
      "ripple",
    ),
    slider("shape", "Shape", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.85,
      format: (n) => (n < 0.34 ? "Circle" : n < 0.67 ? "Squircle" : "Square"),
    }),
    slider("shapeShift", "Shape shift", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("fillRatio", "Fill ratio", {
      min: 0.2,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
      format: fmtPct,
    }),
    slider("columns", "Columns", {
      min: 10,
      max: 80,
      step: 1,
      defaultValue: 59,
      format: fmtCount,
    }),
    slider("rows", "Rows", {
      min: 8,
      max: 56,
      step: 1,
      defaultValue: 32,
      format: fmtCount,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 3,
      step: 0.05,
      defaultValue: 1,
      format: fmtX,
    }),
    slider("waveFrequency", "Wave frequency", {
      min: 0.3,
      max: 4,
      step: 0.1,
      defaultValue: 4,
      format: fmt1,
    }),
    slider("wavePower", "Wave power", {
      min: 1,
      max: 10,
      step: 0.5,
      defaultValue: 7,
      format: fmt1,
    }),
    slider("spiralArms", "Arms", {
      min: 0,
      max: 12,
      step: 1,
      defaultValue: 11,
      format: fmtCount,
    }),
    slider("falloff", "Falloff", {
      min: 0.3,
      max: 4,
      step: 0.1,
      defaultValue: 1.8,
      format: fmt1,
    }),
    slider("baseAlpha", "Base alpha", {
      min: 0,
      max: 0.3,
      step: 0.01,
      defaultValue: 0.18,
      format: fmtPct,
    }),
    slider("colorSpeed", "Color cycle", {
      min: 0,
      max: 4,
      step: 0.1,
      defaultValue: 3.1,
      format: fmt1,
    }),
    slider("opacity", "Opacity", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 1,
      format: fmtPct,
    }),
    select(
      "color1",
      "Color 1",
      [
        { value: "#7c3aed", label: "Violet" },
        { value: "#0a4d6b", label: "Teal" },
        { value: "#7a1f3d", label: "Burgundy" },
        { value: "#d4d4d4", label: "Silver" },
        { value: "#1e8a3a", label: "Forest" },
        { value: "#003566", label: "Navy" },
      ],
      "#7a1f3d",
    ),
    select(
      "color2",
      "Color 2",
      [
        { value: "#f0abfc", label: "Pink" },
        { value: "#22d3ee", label: "Cyan" },
        { value: "#fcd34d", label: "Amber" },
        { value: "#de7343", label: "Ember" },
        { value: "#93229D", label: "Magenta" },
        { value: "#ffffff", label: "White" },
      ],
      "#93229D",
    ),
  ],
};
