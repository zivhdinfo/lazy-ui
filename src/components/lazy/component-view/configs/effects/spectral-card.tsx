import {
  SpectralCard,
  type SpectralCardTone,
} from "@/components/lazy-ui/spectral-card";
import { select, slider, text } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtPct, fmtPx, fmtSec1 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/spectral-card"),
  export: "SpectralCard",
  stageMinHeight: 720,
  render: (v) => {
    const media = ((v.media as string | undefined)?.trim() ||
      "/images/piano-girl.webp") as string;
    const tone = (v.tone ?? "ember") as SpectralCardTone;
    const energy = (v.energy ?? 1) as number;
    const restZoom = (v.restZoom ?? 0.08) as number;
    const hoverZoom = (v.hoverZoom ?? 0.24) as number;
    const spectrum = (v.spectrum ?? 0.7) as number;
    const displace = (v.displace ?? 0.85) as number;
    const gloss = (v.gloss ?? 0.45) as number;
    const tiltDepth = (v.tiltDepth ?? 10) as number;
    const floatRange = (v.floatRange ?? 10) as number;
    const hoverDuration = (v.hoverDuration ?? 1.8) as number;
    const motionDuration = (v.motionDuration ?? 0.45) as number;

    return (
      <div className="flex min-h-[680px] w-full items-center justify-center p-4">
        <SpectralCard
          media={media}
          mediaLabel="Spectral card preview"
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
  },
  controls: [
    text(
      "media",
      "Image URL",
      "/images/piano-girl.webp",
      "https://example.com/image.webp",
    ),
    select(
      "tone",
      "Tone",
      [
        { value: "ember", label: "Ember" },
        { value: "aqua", label: "Aqua" },
        { value: "violet", label: "Violet" },
        { value: "mono", label: "Mono" },
      ],
      "ember",
    ),
    slider("energy", "Energy", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 1,
      format: fmt2,
    }),
    slider("restZoom", "Rest zoom", {
      min: 0,
      max: 0.16,
      step: 0.01,
      defaultValue: 0.08,
      format: fmtPct,
    }),
    slider("hoverZoom", "Zoom", {
      min: 0,
      max: 0.4,
      step: 0.01,
      defaultValue: 0.24,
      format: fmtPct,
    }),
    slider("spectrum", "Spectrum", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.7,
      format: fmt2,
    }),
    slider("displace", "Displace", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.85,
      format: fmt2,
    }),
    slider("gloss", "Gloss", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.45,
      format: fmt2,
    }),
    slider("tiltDepth", "Tilt", {
      min: 0,
      max: 18,
      step: 1,
      defaultValue: 10,
      format: fmt2,
    }),
    slider("floatRange", "Float", {
      min: 0,
      max: 24,
      step: 1,
      defaultValue: 10,
      format: fmtPx,
    }),
    slider("hoverDuration", "Hover time", {
      min: 0.2,
      max: 4,
      step: 0.1,
      defaultValue: 1.8,
      format: fmtSec1,
    }),
    slider("motionDuration", "Motion time", {
      min: 0.12,
      max: 1.2,
      step: 0.03,
      defaultValue: 0.45,
      format: fmtSec1,
    }),
  ],
};
