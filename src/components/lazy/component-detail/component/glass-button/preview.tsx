import { GlassButton } from "@/components/lazy-ui/glass-button";
import { OrbitMesh } from "@/components/lazy-ui/orbit-mesh";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const label = (values.label ?? "Enter the void") as string;
  const size = (values.size ?? "md") as "sm" | "md" | "lg";
  const tint = (values.tint ?? "cool") as "cool" | "warm" | "none";
  const distortion = (values.distortion ?? 10) as number;
  const frequency = (values.frequency ?? 0.014) as number;

  // OrbitMesh paints a colorful flowing field so the glass refraction has
  // something to bend. The button sits dead center, above the canvas.
  return (
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
  );
}
