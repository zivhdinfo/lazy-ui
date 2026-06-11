import { WaveCipher } from "@/components/lazy-ui/wave-cipher";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import {
  fmt1,
  fmtCount,
  fmtPct,
  fmtPx,
  fmtX,
} from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Escape-hatch path: a background canvas under overlay copy. WaveCipher reads
// its props through an internal paramsRef, so fresh props each render never
// restart the canvas.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/wave-cipher"),
  export: "WaveCipher",
  stageMinHeight: 560,
  render: (v) => (
    <div className="flex w-full">
      <div className="relative min-h-[260px] w-full overflow-hidden rounded-xl bg-black">
        <WaveCipher
          columns={(v.columns ?? 3) as number}
          invertColumns={(v.invertColumns ?? true) as boolean}
          bandWidth={(v.bandWidth ?? 0.6) as number}
          characters={(v.characters ?? "0123456789ABCDEF") as string}
          color={(v.color ?? "#d4d4d4") as string}
          speed={(v.speed ?? 0.8) as number}
          size={(v.size ?? 16) as number}
          noisePower={(v.noisePower ?? 2) as number}
          glyphChurn={(v.glyphChurn ?? 0.6) as number}
          opacity={(v.opacity ?? 1) as number}
        />
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-4 text-center sm:px-8">
          <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-300 backdrop-blur-sm">
            Background
          </span>
          <h3 className="text-3xl font-light text-white sm:text-4xl">
            Build lazily.
          </h3>
          <p className="max-w-md text-sm text-neutral-300">
            Drop Wave Cipher behind any hero, dashboard, or auth screen.
          </p>
        </div>
      </div>
    </div>
  ),
  controls: [
    slider("columns", "Columns", {
      min: 1,
      max: 12,
      step: 1,
      defaultValue: 3,
      format: fmtCount,
    }),
    slider("bandWidth", "Band width", {
      min: 0.1,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
      format: fmtPct,
    }),
    slider("size", "Cell size (px)", {
      min: 8,
      max: 40,
      step: 1,
      defaultValue: 16,
      format: fmtPx,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 2.5,
      step: 0.05,
      defaultValue: 0.8,
      format: fmtX,
    }),
    slider("noisePower", "Crest power", {
      min: 0.5,
      max: 5,
      step: 0.1,
      defaultValue: 2,
      format: fmt1,
    }),
    slider("glyphChurn", "Glyph churn", {
      min: 0,
      max: 4,
      step: 0.1,
      defaultValue: 0.6,
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
      "color",
      "Color",
      [
        { value: "#d4d4d4", label: "Silver" },
        { value: "#00ff00", label: "Matrix" },
        { value: "#67e8f9", label: "Cyan" },
        { value: "#f0abfc", label: "Magenta" },
        { value: "#de7343", label: "Ember" },
        { value: "#ffffff", label: "White" },
      ],
      "#d4d4d4",
    ),
    select(
      "characters",
      "Charset",
      [
        { value: "0123456789ABCDEF", label: "Hex" },
        { value: "01", label: "Binary" },
        { value: "✶✤↣⌧✷*.;:", label: "Glyph" },
        { value: ".:-=+*#%@", label: "Density" },
        { value: "⌧✶✷✤☉ϟ", label: "Stars" },
      ],
      "0123456789ABCDEF",
    ),
    toggle("invertColumns", "Invert columns", true),
  ],
};
