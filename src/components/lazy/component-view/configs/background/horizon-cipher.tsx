import { HorizonCipher } from "@/components/lazy-ui/horizon-cipher";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt1, fmt2, fmtCount, fmtPct } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/horizon-cipher"),
  export: "HorizonCipher",
  stageMinHeight: 560,
  render: (v) => {
    const columns = (v.columns ?? 32) as number;
    const depthRows = (v.depthRows ?? 22) as number;
    const fontScale = (v.fontScale ?? 0.9) as number;
    const scrollSpeed = (v.scrollSpeed ?? 1) as number;
    const waveSpeed = (v.waveSpeed ?? 1) as number;
    const wavePower = (v.wavePower ?? 6) as number;
    const waveFrequency = (v.waveFrequency ?? 3) as number;
    const waveAmplitude = (v.waveAmplitude ?? 1.4) as number;
    const baseAlpha = (v.baseAlpha ?? 0.07) as number;
    const colorSpeed = (v.colorSpeed ?? 1) as number;
    const opacity = (v.opacity ?? 1) as number;
    const color1 = (v.color1 ?? "#290596") as string;
    const color2 = (v.color2 ?? "#93229D") as string;
    const characters = (v.characters ?? "0123456789ABCDEF") as string;

    return (
      <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--preview-bg)]">
        <HorizonCipher
          columns={columns}
          depthRows={depthRows}
          fontScale={fontScale}
          scrollSpeed={scrollSpeed}
          waveSpeed={waveSpeed}
          wavePower={wavePower}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          baseAlpha={baseAlpha}
          colorSpeed={colorSpeed}
          opacity={opacity}
          color1={color1}
          color2={color2}
          characters={characters}
        />
        <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--text-2)] backdrop-blur-sm">
            Background
          </span>
          <h3 className="text-4xl font-light text-[var(--text)]">
            Build lazily.
          </h3>
          <p className="text-sm text-[var(--text-2)]">
            Drop Horizon Cipher behind any hero, dashboard, or landing page.
          </p>
        </div>
      </div>
    );
  },
  controls: [
    slider("columns", "Columns", {
      min: 8,
      max: 96,
      step: 1,
      defaultValue: 32,
      format: fmtCount,
    }),
    slider("depthRows", "Depth rows", {
      min: 10,
      max: 48,
      step: 1,
      defaultValue: 22,
      format: fmtCount,
    }),
    slider("fontScale", "Font scale", {
      min: 0.3,
      max: 1.2,
      step: 0.05,
      defaultValue: 0.9,
      format: fmt2,
    }),
    slider("scrollSpeed", "Scroll speed", {
      min: 0,
      max: 4,
      step: 0.1,
      defaultValue: 1,
      format: fmt1,
    }),
    slider("waveSpeed", "Wave speed", {
      min: 0,
      max: 3,
      step: 0.1,
      defaultValue: 1,
      format: fmt1,
    }),
    slider("wavePower", "Wave power", {
      min: 1,
      max: 12,
      step: 0.5,
      defaultValue: 6,
      format: fmt1,
    }),
    slider("waveFrequency", "Wave count", {
      min: 1,
      max: 8,
      step: 0.5,
      defaultValue: 3,
      format: fmt1,
    }),
    slider("waveAmplitude", "Wobble", {
      min: 0,
      max: 4,
      step: 0.1,
      defaultValue: 1.4,
      format: fmt1,
    }),
    slider("baseAlpha", "Base alpha", {
      min: 0,
      max: 0.3,
      step: 0.01,
      defaultValue: 0.07,
      format: fmtPct,
    }),
    slider("colorSpeed", "Color cycle", {
      min: 0,
      max: 4,
      step: 0.1,
      defaultValue: 1,
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
      "color1",
      "Color 1",
      [
        { value: "#290596", label: "Indigo" },
        { value: "#0a4d6b", label: "Teal" },
        { value: "#7a1f3d", label: "Burgundy" },
        { value: "#d4d4d4", label: "Silver" },
        { value: "#1e8a3a", label: "Forest" },
        { value: "#003566", label: "Navy" },
      ],
      "#290596",
    ),
    select(
      "color2",
      "Color 2",
      [
        { value: "#93229D", label: "Magenta" },
        { value: "#f0abfc", label: "Pink" },
        { value: "#67e8f9", label: "Cyan" },
        { value: "#fcd34d", label: "Amber" },
        { value: "#de7343", label: "Ember" },
        { value: "#ffffff", label: "White" },
      ],
      "#93229D",
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
  ],
};
