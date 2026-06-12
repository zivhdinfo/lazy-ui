import {
  Neumorphism,
  type NeumorphismCorner,
  type NeumorphismPalette,
} from "@/components/lazy-ui/neumorphism";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtCount, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/neumorphism"),
  export: "Neumorphism",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "pearl") as NeumorphismPalette;
    const glowColorRaw = (v.glowColor ?? "default") as string;
    const glowColor = glowColorRaw === "default" ? undefined : glowColorRaw;
    const layers = (v.layers ?? 5) as number;
    const spread = (v.spread ?? 93) as number;
    const radius = (v.radius ?? 42) as number;
    const angle = (v.angle ?? 205) as number;
    const softness = (v.softness ?? 67) as number;
    const depth = (v.depth ?? 2.9) as number;
    const glow = (v.glow ?? 1.55) as number;
    const speed = (v.speed ?? 0.7) as number;
    const showContent = (v.showContent ?? true) as boolean;

    const sharpCorners: NeumorphismCorner[] = [];
    if ((v.cornerTL ?? true) === false) sharpCorners.push("top-left");
    if ((v.cornerTR ?? false) === false) sharpCorners.push("top-right");
    if ((v.cornerBR ?? true) === false) sharpCorners.push("bottom-right");
    if ((v.cornerBL ?? true) === false) sharpCorners.push("bottom-left");

    const isDark =
      palette === "graphite" ||
      palette === "obsidian" ||
      palette === "moonlight";

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
        <Neumorphism
          palette={palette}
          glowColor={glowColor}
          layers={layers}
          spread={spread}
          radius={radius}
          angle={angle}
          softness={softness}
          depth={depth}
          glow={glow}
          speed={speed}
          sharpCorners={sharpCorners}
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
                  Soft UI
                </div>
                <h1
                  className="text-4xl leading-tight tracking-tight"
                  style={{
                    fontFamily:
                      "var(--font-instrument-serif), 'Instrument Serif', serif",
                  }}
                >
                  Build <span className="italic">softly.</span>
                </h1>
                <p
                  className={`mt-3 max-w-sm text-[11px] font-light leading-relaxed ${subColor}`}
                >
                  A cascade of soft plates lit by a glow that orbits the rim —
                  cursor steers the light and tilts the stack in 3D.
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
        </Neumorphism>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "pearl", label: "Pearl" },
        { value: "bone", label: "Bone" },
        { value: "silver", label: "Silver" },
        { value: "graphite", label: "Graphite" },
        { value: "obsidian", label: "Obsidian" },
        { value: "moonlight", label: "Moonlight" },
      ],
      "pearl",
    ),
    select(
      "glowColor",
      "Glow color",
      [
        { value: "default", label: "Palette default" },
        { value: "#a8c5ff", label: "Sky" },
        { value: "#ffb87a", label: "Amber" },
        { value: "#b6a6ff", label: "Iris" },
        { value: "#ff8db5", label: "Rose" },
        { value: "#7be0c4", label: "Mint" },
        { value: "#ffffff", label: "White" },
      ],
      "default",
    ),
    toggle("showContent", "Show content", true),
    slider("layers", "Layers", {
      min: 1,
      max: 12,
      step: 1,
      defaultValue: 5,
      format: fmtCount,
      wide: true,
    }),
    slider("spread", "Spread", {
      min: 8,
      max: 120,
      step: 1,
      defaultValue: 93,
      format: fmtPx,
      wide: true,
    }),
    slider("radius", "Radius", {
      min: 0,
      max: 200,
      step: 2,
      defaultValue: 42,
      format: fmtPx,
      wide: true,
    }),
    slider("angle", "Angle", {
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 205,
      format: (n) => `${Math.round(n)}°`,
      wide: true,
    }),
    slider("softness", "Softness", {
      min: 4,
      max: 120,
      step: 1,
      defaultValue: 67,
      format: fmtPx,
      wide: true,
    }),
    slider("depth", "Depth", {
      min: 0.2,
      max: 4,
      step: 0.05,
      defaultValue: 2.9,
      format: fmt2,
      wide: true,
    }),
    slider("glow", "Glow", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1.55,
      format: fmt2,
      wide: true,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.7,
      format: fmt2,
      wide: true,
    }),
    toggle("cornerTL", "Round TL", true),
    toggle("cornerTR", "Round TR", false),
    toggle("cornerBR", "Round BR", true),
    toggle("cornerBL", "Round BL", true),
  ],
};
