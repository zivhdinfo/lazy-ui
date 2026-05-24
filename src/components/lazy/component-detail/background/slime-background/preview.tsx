import {
  SlimeBackground,
  type SlimePalette,
} from "@/components/lazy-ui/slime-background";

import type { CustomizeValues } from "../../../customize";
import { HeroOverlay } from "../../hero-overlay";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "toxic") as SlimePalette;
  const speed = (values.speed ?? 0.35) as number;
  const viscosity = (values.viscosity ?? 0.85) as number;
  const shine = (values.shine ?? 1) as number;
  const roughness = (values.roughness ?? 0.35) as number;
  const detail = (values.detail ?? 1) as number;
  const contrast = (values.contrast ?? 0.5) as number;
  const grain = (values.grain ?? 0.04) as number;
  const mouseFollow = (values.mouseFollow ?? true) as boolean;
  const mouseInfluence = (values.mouseInfluence ?? 0.6) as number;
  const showContent = (values.showContent ?? true) as boolean;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <SlimeBackground
        palette={palette}
        speed={speed}
        viscosity={viscosity}
        shine={shine}
        roughness={roughness}
        detail={detail}
        contrast={contrast}
        grain={grain}
        mouseFollow={mouseFollow}
        mouseInfluence={mouseInfluence}
        className="h-[480px] w-full rounded-2xl"
      >
        {showContent && (
          <HeroOverlay
            eyebrow="Press the surface"
            title={
              <>
                Wet, slow,
                <br />
                <span className="font-semibold italic">alive.</span>
              </>
            }
            description="A double-warped FBM height field, lit by a single key light. Move the cursor — the slime dimples under the pointer."
          />
        )}
      </SlimeBackground>
    </div>
  );
}
