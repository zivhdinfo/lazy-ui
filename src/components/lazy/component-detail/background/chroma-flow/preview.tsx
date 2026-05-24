import {
  ChromaFlow,
  type ChromaPalette,
} from "@/components/lazy-ui/chroma-flow";

import type { CustomizeValues } from "../../../customize";
import { HeroOverlay } from "../../hero-overlay";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "sunset") as ChromaPalette;
  const speed = (values.speed ?? 0.5) as number;
  const density = (values.density ?? 13) as number;
  const flow = (values.flow ?? 1) as number;
  const glow = (values.glow ?? 0.55) as number;
  const vignette = (values.vignette ?? 0.55) as number;
  const grain = (values.grain ?? 0.04) as number;
  const mouseFollow = (values.mouseFollow ?? true) as boolean;
  const mouseInfluence = (values.mouseInfluence ?? 0.5) as number;

  return (
    <div className="flex min-h-[640px] w-full items-center justify-center p-4">
      <ChromaFlow
        palette={palette}
        speed={speed}
        density={density}
        flow={flow}
        glow={glow}
        vignette={vignette}
        grain={grain}
        mouseFollow={mouseFollow}
        mouseInfluence={mouseInfluence}
        className="h-[600px] w-full rounded-2xl"
      >
        <HeroOverlay
          eyebrow="Move the cursor — streaks orbit"
          title={
            <>
              Backgrounds that
              <br />
              <span className="font-semibold italic">bend with you.</span>
            </>
          }
          description="Vertical streaks ride a curl field, painted with a rainbow gradient. The cursor bends them into orbit around a ring — accretion disk, not hot point."
        />
      </ChromaFlow>
    </div>
  );
}
