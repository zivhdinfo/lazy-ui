import {
  PrismDrift,
  type PrismLayout,
  type PrismPalette,
} from "@/components/lazy-ui/prism-drift";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "ember") as PrismPalette;
  const layout = (values.layout ?? "diagonal") as PrismLayout;
  const softness = (values.softness ?? 0.76) as number;
  const intensity = (values.intensity ?? 1.1) as number;
  const grain = (values.grain ?? 0.2) as number;
  const speed = (values.speed ?? 0.6) as number;
  const drift = (values.drift ?? 0.05) as number;
  const mouseFollow = (values.mouseFollow ?? true) as boolean;
  const mouseInfluence = (values.mouseInfluence ?? 0.4) as number;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <PrismDrift
        palette={palette}
        layout={layout}
        softness={softness}
        intensity={intensity}
        grain={grain}
        speed={speed}
        drift={drift}
        mouseFollow={mouseFollow}
        mouseInfluence={mouseInfluence}
        className="h-[480px] w-full rounded-2xl"
      >
        <main className="relative z-10 flex h-full items-center justify-center px-6">
          <h1 className="text-center text-balance text-5xl font-light tracking-tight text-white">
            Backgrounds are awesome :)
          </h1>
        </main>
      </PrismDrift>
    </div>
  );
}
