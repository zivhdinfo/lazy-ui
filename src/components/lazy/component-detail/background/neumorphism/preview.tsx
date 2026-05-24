import {
  Neumorphism,
  type NeumorphismCorner,
  type NeumorphismPalette,
} from "@/components/lazy-ui/neumorphism";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "pearl") as NeumorphismPalette;
  const glowColorRaw = (values.glowColor ?? "default") as string;
  const glowColor = glowColorRaw === "default" ? undefined : glowColorRaw;
  const layers = (values.layers ?? 5) as number;
  const spread = (values.spread ?? 93) as number;
  const radius = (values.radius ?? 42) as number;
  const angle = (values.angle ?? 205) as number;
  const softness = (values.softness ?? 67) as number;
  const depth = (values.depth ?? 2.9) as number;
  const glow = (values.glow ?? 1.55) as number;
  const speed = (values.speed ?? 0.7) as number;
  const showContent = (values.showContent ?? true) as boolean;

  const sharpCorners: NeumorphismCorner[] = [];
  if ((values.cornerTL ?? true) === false) sharpCorners.push("top-left");
  if ((values.cornerTR ?? false) === false) sharpCorners.push("top-right");
  if ((values.cornerBR ?? true) === false) sharpCorners.push("bottom-right");
  if ((values.cornerBL ?? true) === false) sharpCorners.push("bottom-left");

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
}
