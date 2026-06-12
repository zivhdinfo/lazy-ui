import { ParticleHalo } from "@/components/lazy-ui/particle-halo";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtCount, fmtPx, fmtSec1, fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

const colorOptions = [
  { value: "#ffffff", label: "White" },
  { value: "#a3a3a3", label: "Silver" },
  { value: "#525252", label: "Dim" },
  { value: "#00adb5", label: "Teal" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#dc2626", label: "Crimson" },
  { value: "#fb923c", label: "Orange" },
  { value: "#10b981", label: "Emerald" },
  { value: "#ec4899", label: "Pink" },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/particle-halo"),
  export: "ParticleHalo",
  stageMinHeight: 560,
  render: (v) => {
    const color1 = (v.color1 ?? "#a3a3a3") as string;
    const color2 = (v.color2 ?? "#ffffff") as string;
    const colors = [color1, color2];
    const shape = (v.shape ?? "circle") as
      | "circle"
      | "square"
      | "line"
      | "spark";
    const mode = (v.mode ?? "wave") as "wave" | "pulse" | "spiral" | "chaos";
    const particleCount = (v.particleCount ?? 1800) as number;
    const radius = (v.radius ?? 0.7) as number;
    const intensity = (v.intensity ?? 1) as number;
    const duration = (v.duration ?? 16) as number;
    const trail = (v.trail ?? 0) as number;
    const sizeMax = (v.sizeMax ?? 8) as number;
    const glow = (v.glow ?? true) as boolean;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)]">
          <ParticleHalo
            colors={colors}
            particleCount={Math.round(particleCount)}
            radius={radius}
            intensity={intensity}
            duration={duration}
            shape={shape}
            mode={mode}
            trail={trail}
            particleSize={[2, Math.round(sizeMax)]}
            glow={glow}
            glowColor={color2}
            className="absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-[10px] font-medium tracking-[0.22em] text-[var(--text-3)] uppercase">
              Particle halo
            </span>
            <h3 className="mt-3 text-6xl leading-none font-semibold tracking-tighter text-[var(--text)]">
              Build <span className="italic font-normal">lazily.</span>
            </h3>
            <p className="mt-4 max-w-sm text-xs font-light text-[var(--text-3)]">
              Move your cursor around the ring to sweep the wave.
            </p>
          </div>
        </div>
      </div>
    );
  },
  controls: [
    select("color1", "Color 1", colorOptions, "#a3a3a3"),
    select("color2", "Color 2", colorOptions, "#ffffff"),
    select(
      "shape",
      "Shape",
      [
        { value: "circle", label: "Circle" },
        { value: "square", label: "Square" },
        { value: "line", label: "Line" },
        { value: "spark", label: "Spark" },
      ],
      "circle",
    ),
    select(
      "mode",
      "Mode",
      [
        { value: "wave", label: "Wave" },
        { value: "pulse", label: "Pulse" },
        { value: "spiral", label: "Spiral" },
        { value: "chaos", label: "Chaos" },
      ],
      "wave",
    ),
    slider("particleCount", "Particles", {
      min: 400,
      max: 3500,
      step: 50,
      defaultValue: 1800,
      format: fmtCount,
    }),
    slider("radius", "Radius", {
      min: 0.2,
      max: 1,
      step: 0.05,
      defaultValue: 0.7,
      format: fmt2,
    }),
    slider("intensity", "Intensity", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1,
      format: fmtX,
    }),
    slider("duration", "Cycle", {
      min: 4,
      max: 32,
      step: 0.5,
      defaultValue: 16,
      format: fmtSec1,
    }),
    slider("trail", "Trail", {
      min: 0,
      max: 0.95,
      step: 0.05,
      defaultValue: 0,
      format: fmt2,
    }),
    slider("sizeMax", "Max size", {
      min: 3,
      max: 14,
      step: 1,
      defaultValue: 8,
      format: fmtPx,
    }),
    toggle("glow", "Glow", true),
  ],
};
