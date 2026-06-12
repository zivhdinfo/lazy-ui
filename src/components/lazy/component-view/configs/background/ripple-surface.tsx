import {
  RippleSurface,
  type RippleSurfaceEffect,
  type RippleSurfacePalette,
} from "@/components/lazy-ui/ripple-surface";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtCount } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/ripple-surface"),
  export: "RippleSurface",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "pearl") as RippleSurfacePalette;
    const effect = (v.effect ?? "drift") as RippleSurfaceEffect;
    const rings = (v.rings ?? 4) as number;
    const sharpness = (v.sharpness ?? 0.3) as number;
    const depth = (v.depth ?? 1.25) as number;
    const speed = (v.speed ?? 1.15) as number;
    const lightAngle = (v.lightAngle ?? 130) as number;
    const centerGlow = (v.centerGlow ?? 0.62) as number;
    const vignette = (v.vignette ?? 0.3) as number;
    const originX = (v.originX ?? 0.5) as number;
    const originY = (v.originY ?? 0.5) as number;
    const showContent = (v.showContent ?? true) as boolean;

    const isDark = palette === "graphite" || palette === "obsidian";
    const titleColor = isDark ? "text-white" : "text-neutral-900";
    const subColor = isDark ? "text-white/70" : "text-neutral-700";
    const eyebrowChip = isDark
      ? "border-white/15 bg-white/10 text-white/80"
      : "border-black/10 bg-white/50 text-neutral-700";
    const ctaPrimary = isDark
      ? "bg-white text-black hover:bg-white/90"
      : "bg-neutral-900 text-white hover:bg-neutral-700";
    const ctaSecondary = isDark
      ? "border-white/25 text-white hover:bg-white/10"
      : "border-black/20 text-neutral-900 hover:bg-black/5";
    const dotBg = isDark ? "#ffffff" : "#1c1c1c";

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <RippleSurface
          palette={palette}
          effect={effect}
          rings={rings}
          sharpness={sharpness}
          depth={depth}
          speed={speed}
          lightAngle={lightAngle}
          centerGlow={centerGlow}
          vignette={vignette}
          originX={originX}
          originY={originY}
          className="h-[480px] w-full rounded-2xl"
        >
          {showContent && (
            <>
              <header
                className={`relative z-10 flex items-center justify-between p-5 ${titleColor}`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <span
                    className="inline-block h-5 w-5 rounded-md"
                    style={{
                      background:
                        "linear-gradient(180deg, #fff 0%, #d4d4d4 50%, #8a8a8a 100%)",
                    }}
                  />
                  Lazy-ui
                </div>
              </header>

              <main
                className={`relative z-10 max-w-md px-6 pt-12 pb-8 ${titleColor}`}
              >
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-light backdrop-blur-md ${eyebrowChip}`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: dotBg }}
                  />
                  Ripple
                </div>
                <h1
                  className="text-4xl leading-tight tracking-tight"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), 'Instrument Serif', serif",
                  }}
                >
                  Build <span className="italic">quietly.</span>
                </h1>
                <p
                  className={`mt-3 max-w-sm text-[11px] font-light leading-relaxed ${subColor}`}
                >
                  Concentric rings carved by a single directional light —
                  tanh-smoothed ridges and a faded core keep the surface clean
                  from edge to edge.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    className={`rounded-full border px-5 py-2 text-[11px] font-light transition-colors ${ctaSecondary}`}
                  >
                    Browse
                  </button>
                  <button
                    className={`rounded-full px-5 py-2 text-[11px] font-medium transition-colors ${ctaPrimary}`}
                  >
                    Get started
                  </button>
                </div>
              </main>
            </>
          )}
        </RippleSurface>
      </div>
    );
  },
  controls: [
    // Row 1 — Palette + Effect (two wide selects fill a row).
    select(
      "palette",
      "Palette",
      [
        { value: "pearl", label: "Pearl" },
        { value: "bone", label: "Bone" },
        { value: "linen", label: "Linen" },
        { value: "silver", label: "Silver" },
        { value: "mist", label: "Mist" },
        { value: "ocean", label: "Ocean" },
        { value: "graphite", label: "Graphite" },
        { value: "obsidian", label: "Obsidian" },
      ],
      "pearl",
    ),
    select(
      "effect",
      "Effect",
      [
        { value: "outward", label: "Outward" },
        { value: "inward", label: "Inward" },
        { value: "breathe", label: "Breathe" },
        { value: "drift", label: "Drift" },
      ],
      "drift",
    ),
    // Row 2 — content toggle.
    toggle("showContent", "Show content", true),
    // Rows 3–6 — sliders, two per row.
    slider("rings", "Rings", {
      min: 2,
      max: 24,
      step: 1,
      defaultValue: 4,
      format: fmtCount,
      wide: true,
    }),
    slider("sharpness", "Sharpness", {
      min: 0.3,
      max: 3,
      step: 0.05,
      defaultValue: 0.3,
      format: fmt2,
      wide: true,
    }),
    slider("depth", "Depth", {
      min: 0,
      max: 2.5,
      step: 0.05,
      defaultValue: 1.25,
      format: fmt2,
      wide: true,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 3,
      step: 0.05,
      defaultValue: 1.15,
      format: fmt2,
      wide: true,
    }),
    slider("lightAngle", "Light", {
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 130,
      format: (n) => `${Math.round(n)}°`,
      wide: true,
    }),
    slider("centerGlow", "Center glow", {
      min: 0,
      max: 1,
      step: 0.02,
      defaultValue: 0.62,
      format: fmt2,
      wide: true,
    }),
    slider("vignette", "Vignette", {
      min: 0,
      max: 1,
      step: 0.02,
      defaultValue: 0.3,
      format: fmt2,
      wide: true,
    }),
    slider("originX", "Origin X", {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      format: fmt2,
      wide: true,
    }),
    slider("originY", "Origin Y", {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      format: fmt2,
      wide: true,
    }),
  ],
};
