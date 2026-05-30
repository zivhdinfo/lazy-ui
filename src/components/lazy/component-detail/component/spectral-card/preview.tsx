import {
  SpectralCard,
  type SpectralCardTone,
} from "@/components/lazy-ui/spectral-card";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const tone = (values.tone ?? "ember") as SpectralCardTone;
  const energy = (values.energy ?? 1) as number;
  const restZoom = (values.restZoom ?? 0.08) as number;
  const hoverZoom = (values.hoverZoom ?? 0.24) as number;
  const spectrum = (values.spectrum ?? 0.7) as number;
  const displace = (values.displace ?? 0.85) as number;
  const gloss = (values.gloss ?? 0.45) as number;
  const tiltDepth = (values.tiltDepth ?? 10) as number;
  const floatRange = (values.floatRange ?? 10) as number;
  const hoverDuration = (values.hoverDuration ?? 1.8) as number;
  const motionDuration = (values.motionDuration ?? 0.45) as number;

  return (
    <div className="flex min-h-[680px] w-full items-center justify-center p-4">
      <SpectralCard
        media="/images/piano-girl.webp"
        mediaLabel="Piano girl"
        width={360}
        height={640}
        tone={tone}
        energy={energy}
        restZoom={restZoom}
        hoverZoom={hoverZoom}
        spectrum={spectrum}
        displace={displace}
        gloss={gloss}
        tiltDepth={tiltDepth}
        floatRange={floatRange}
        hoverDuration={hoverDuration}
        motionDuration={motionDuration}
        className="max-h-full max-w-full shadow-2xl shadow-black/35"
      >
        <div className="flex h-full items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-white">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
              Portrait 09
            </p>
            <h3 className="mt-2 text-4xl font-light tracking-normal">
              Spectral Card
            </h3>
          </div>
        </div>
      </SpectralCard>
    </div>
  );
}
