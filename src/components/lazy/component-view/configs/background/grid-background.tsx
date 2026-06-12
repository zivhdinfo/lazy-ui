import {
  GridBackground,
  type GridBackgroundFade,
  type GridBackgroundVariant,
} from "@/components/lazy-ui/grid-background";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmtCount, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/grid-background"),
  export: "GridBackground",
  stageMinHeight: 560,
  render: (v) => {
    const variant = (v.variant ?? "dots") as GridBackgroundVariant;
    const fade = (v.fade ?? "edges") as GridBackgroundFade;
    const color = (v.color ?? "var(--preview-grid)") as string;
    const size = (v.size ?? 24) as number;
    const lineWidth = (v.lineWidth ?? 1) as number;
    const dotSize = (v.dotSize ?? 3) as number;
    const dashLength = (v.dashLength ?? 3) as number;
    const dashGap = (v.dashGap ?? 5) as number;
    const crossSize = (v.crossSize ?? 5) as number;
    const fadeStrength = (v.fadeStrength ?? 1) as number;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)]">
          <GridBackground
            variant={variant}
            size={size}
            lineWidth={lineWidth}
            dotSize={dotSize}
            dashLength={dashLength}
            dashGap={dashGap}
            crossSize={crossSize}
            color={color}
            fade={fade}
            fadeStrength={fadeStrength}
          />
        </div>
      </div>
    );
  },
  controls: [
    select(
      "variant",
      "Variant",
      [
        { value: "dots", label: "Dots" },
        { value: "lines", label: "Lines" },
        { value: "dashed", label: "Dashed" },
        { value: "crosshair", label: "Crosshair" },
      ],
      "dots",
    ),
    select(
      "fade",
      "Fade",
      [
        { value: "none", label: "None" },
        { value: "edges", label: "Edges" },
        { value: "center", label: "Center" },
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
      ],
      "edges",
    ),
    select(
      "color",
      "Color",
      [
        { value: "var(--preview-grid)", label: "Theme" },
        { value: "rgba(255,255,255,0.08)", label: "Soft white" },
        { value: "rgba(255,255,255,0.16)", label: "Bright white" },
        { value: "rgba(255,255,255,0.32)", label: "Stark white" },
        { value: "rgba(0,0,0,0.20)", label: "Soft black" },
      ],
      "var(--preview-grid)",
    ),
    slider("size", "Cell size", {
      min: 8,
      max: 80,
      step: 1,
      defaultValue: 24,
      format: fmtPx,
    }),
    slider("lineWidth", "Line width", {
      min: 1,
      max: 4,
      step: 1,
      defaultValue: 1,
      format: fmtCount,
    }),
    slider("dotSize", "Dot size", {
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 3,
      format: fmtPx,
    }),
    slider("dashLength", "Dash length", {
      min: 1,
      max: 12,
      step: 1,
      defaultValue: 3,
      format: fmtPx,
    }),
    slider("dashGap", "Dash gap", {
      min: 1,
      max: 16,
      step: 1,
      defaultValue: 5,
      format: fmtPx,
    }),
    slider("crossSize", "Cross size", {
      min: 2,
      max: 12,
      step: 1,
      defaultValue: 5,
      format: fmtPx,
    }),
    slider("fadeStrength", "Fade strength", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 1,
      format: (n) => `${Math.round(n * 100)}%`,
    }),
  ],
};
