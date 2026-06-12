import { GlassButton } from "@/components/lazy-ui/glass-button";
import { OrbitMesh } from "@/components/lazy-ui/orbit-mesh";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt3 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Dark-first: the glass refraction needs a colorful field beneath it, so the
// button sits above an OrbitMesh canvas on a black stage — legible in both
// light and dark page themes.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/glass-button"),
  export: "GlassButton",
  stageMinHeight: 460,
  render: (v) => {
    const label = (v.label ?? "Enter the void") as string;
    const size = (v.size ?? "md") as "sm" | "md" | "lg";
    const tint = (v.tint ?? "cool") as "cool" | "warm" | "none";
    const distortion = (v.distortion ?? 10) as number;
    const frequency = (v.frequency ?? 0.014) as number;
    return (
      <div className="flex w-full">
        <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
          <OrbitMesh
            effect="spiral"
            speed={0.5}
            scale={0.45}
            colorLayers={3}
            spiralArms={5}
            waveIntensity={0.22}
            spiralIntensity={1.6}
            lineThickness={0.13}
            falloff={1.6}
            brightness={2.6}
            colorTint="#7c3aed"
          />
          <div className="relative z-10">
            <GlassButton
              size={size}
              tint={tint}
              distortion={distortion}
              frequency={frequency}
            >
              {label}
            </GlassButton>
          </div>
        </div>
      </div>
    );
  },
  controls: [
    select(
      "label",
      "Label",
      [
        { value: "Enter the void", label: "Enter the void" },
        { value: "Get started", label: "Get started" },
        { value: "Sign in", label: "Sign in" },
        { value: "Browse the docs", label: "Browse the docs" },
      ],
      "Enter the void",
    ),
    select(
      "size",
      "Size",
      [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      "md",
    ),
    select(
      "tint",
      "Tint",
      [
        { value: "cool", label: "Cool" },
        { value: "warm", label: "Warm" },
        { value: "none", label: "None" },
      ],
      "cool",
    ),
    slider("distortion", "Distortion", {
      min: 0,
      max: 24,
      step: 0.5,
      defaultValue: 10,
      format: (n: number) => `${n.toFixed(1)}px`,
    }),
    slider("frequency", "Frequency", {
      min: 0.005,
      max: 0.08,
      step: 0.001,
      defaultValue: 0.014,
      format: fmt3,
    }),
  ],
};
