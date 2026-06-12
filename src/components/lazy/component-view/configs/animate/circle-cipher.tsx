import { CircleCipher } from "@/components/lazy-ui/circle-cipher";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt1, fmtPct, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Theme-aware preview surface. The glyphs use the configurable `color` (silver
// by default, tuned for dark) — pick a darker color for light mode.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/circle-cipher"),
  export: "CircleCipher",
  stageMinHeight: 560,
  render: (v) => {
    const characters = (v.characters ?? "0123456789ABCDEF") as string;
    const size = (v.size ?? 12) as number;
    const color = (v.color ?? "#d4d4d4") as string;
    const spread = (v.spread ?? 142) as number;
    const persistence = (v.persistence ?? 1.8) as number;
    const enableFade = (v.enableFade ?? true) as boolean;
    const opacity = (v.opacity ?? 1) as number;
    return (
      <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--preview-bg)]">
        <CircleCipher
          characters={characters}
          size={size}
          color={color}
          spread={spread}
          persistence={persistence}
          enableFade={enableFade}
          opacity={opacity}
        />
        <p className="pointer-events-none text-[11px] uppercase tracking-[0.22em] text-[var(--text-3)]">
          Move your cursor
        </p>
      </div>
    );
  },
  controls: [
    slider("size", "Cell size (px)", {
      min: 8,
      max: 64,
      step: 1,
      defaultValue: 12,
      format: fmtPx,
    }),
    slider("spread", "Spread (px)", {
      min: 20,
      max: 240,
      step: 1,
      defaultValue: 142,
      format: fmtPx,
    }),
    slider("persistence", "Persistence", {
      min: 0.2,
      max: 6,
      step: 0.1,
      defaultValue: 1.8,
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
        { value: "#de7343", label: "Orange" },
        { value: "#67e8f9", label: "Cyan" },
        { value: "#f0abfc", label: "Magenta" },
        { value: "#ffffff", label: "White" },
      ],
      "#d4d4d4",
    ),
    select(
      "characters",
      "Charset",
      [
        { value: "0123456789ABCDEF", label: "Hex" },
        { value: "✶✤↣⌧✷*.;:", label: "Glyph" },
        { value: "01", label: "Binary" },
        { value: ".:-=+*#%@", label: "Density" },
        { value: "⌧✶✷✤☉ϟ", label: "Stars" },
      ],
      "0123456789ABCDEF",
    ),
    toggle("enableFade", "Fade trail", true),
  ],
};
