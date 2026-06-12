import { PixelCursor } from "@/components/lazy-ui/pixel-cursor";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt1, fmtPct, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

const colorOptions = [
  { value: "#ffffff", label: "White" },
  { value: "#d4d4d4", label: "Silver" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#34d399", label: "Mint" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#fb923c", label: "Orange" },
  { value: "#525252", label: "Dim" },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/pixel-cursor"),
  export: "PixelCursor",
  stageMinHeight: 560,
  render: (v) => {
    const color = (v.color ?? "#22d3ee") as string;
    const edgeColor1 = (v.edgeColor1 ?? "#ffffff") as string;
    const edgeColor2 = (v.edgeColor2 ?? "#a78bfa") as string;
    const pixelSize = (v.pixelSize ?? 5) as number;
    const spread = (v.spread ?? 10) as number;
    const density = (v.density ?? 0.75) as number;
    const persistence = (v.persistence ?? 2.9) as number;
    const lag = (v.lag ?? 0.95) as number;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)]">
          <PixelCursor
            color={color}
            edgeColor1={edgeColor1}
            edgeColor2={edgeColor2}
            pixelSize={pixelSize}
            spread={spread}
            density={density}
            persistence={persistence}
            lag={lag}
            className="absolute inset-0"
          />
        </div>
      </div>
    );
  },
  controls: [
    select("color", "Main color", colorOptions, "#22d3ee"),
    select("edgeColor1", "Edge 1", colorOptions, "#ffffff"),
    select("edgeColor2", "Edge 2", colorOptions, "#a78bfa"),
    slider("pixelSize", "Pixel size", {
      min: 4,
      max: 20,
      step: 1,
      defaultValue: 5,
      format: fmtPx,
    }),
    slider("spread", "Spread", {
      min: 5,
      max: 160,
      step: 5,
      defaultValue: 10,
      format: fmtPx,
    }),
    slider("density", "Density", {
      min: 0.1,
      max: 1,
      step: 0.05,
      defaultValue: 0.75,
      format: fmtPct,
    }),
    slider("persistence", "Trail", {
      min: 0.5,
      max: 4,
      step: 0.1,
      defaultValue: 2.9,
      format: fmt1,
    }),
    slider("lag", "Delay", {
      min: 0,
      max: 0.95,
      step: 0.05,
      defaultValue: 0.95,
      format: fmtPct,
    }),
  ],
};
