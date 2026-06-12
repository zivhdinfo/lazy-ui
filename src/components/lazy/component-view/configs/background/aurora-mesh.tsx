import { AuroraMesh } from "@/components/lazy-ui/aurora-mesh";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtX } from "@/components/lazy/component-detail/format";
import { HeroOverlay } from "@/components/lazy/component-detail/hero-overlay";
import type { ComponentView } from "@/components/lazy/component-view/types";

const AURORA_MESH_PALETTES: Record<string, string[]> = {
  silver: ["#050505", "#161616", "#525252", "#a3a3a3", "#f8f8f8"],
  violet: ["#0a0612", "#3b0764", "#7c3aed", "#c4b5fd", "#ffffff"],
  cyan: ["#020617", "#083344", "#0891b2", "#67e8f9", "#ecfeff"],
  amber: ["#0a0500", "#3f1d00", "#d97706", "#fcd34d", "#fffbeb"],
  ember: ["#0a0405", "#3a0a05", "#de4343", "#fdba74", "#ffffff"],
  midnight: ["#000000", "#0a0a1a", "#1e1b4b", "#4c1d95", "#ddd6fe"],
};

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/aurora-mesh"),
  export: "AuroraMesh",
  stageMinHeight: 560,
  render: (v) => {
    const paletteKey = (v.palette ?? "silver") as string;
    const colors =
      AURORA_MESH_PALETTES[paletteKey] ?? AURORA_MESH_PALETTES.silver;
    const speed = (v.speed ?? 0.3) as number;
    const grain = (v.grain ?? 0.06) as number;
    const wireframe = (v.wireframe ?? false) as boolean;
    const wireframeOpacity = (v.wireframeOpacity ?? 0.45) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.6) as number;
    const ripple = (v.ripple ?? true) as boolean;
    const rippleStrength = (v.rippleStrength ?? 0.06) as number;

    const accent = colors[colors.length - 1] ?? "#ffffff";

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <AuroraMesh
          colors={colors}
          speed={speed}
          grain={grain}
          wireframe={wireframe}
          wireframeOpacity={wireframeOpacity}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          ripple={ripple}
          rippleStrength={rippleStrength}
          className="h-[480px] w-full rounded-2xl"
        >
          <HeroOverlay
            eyebrow="Move, click — aurora reacts"
            title={
              <>
                <span className="italic">Beautiful</span> backgrounds
                <br />
                <span className="font-semibold">that follow you.</span>
              </>
            }
            description="A flowing mesh gradient. The brightest anchor tracks your cursor; click anywhere to send a ripple through the field."
            accent={accent}
          />
        </AuroraMesh>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Palette",
      [
        { value: "silver", label: "Silver" },
        { value: "violet", label: "Violet" },
        { value: "cyan", label: "Cyan" },
        { value: "amber", label: "Amber" },
        { value: "ember", label: "Ember" },
        { value: "midnight", label: "Midnight" },
      ],
      "silver",
    ),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.3,
      format: fmtX,
    }),
    slider("mouseInfluence", "Mouse pull", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
      format: fmt2,
    }),
    slider("rippleStrength", "Ripple", {
      min: 0,
      max: 0.15,
      step: 0.005,
      defaultValue: 0.06,
      format: fmt3,
    }),
    slider("grain", "Grain", {
      min: 0,
      max: 0.2,
      step: 0.005,
      defaultValue: 0.06,
      format: fmt3,
    }),
    slider("wireframeOpacity", "Wireframe opacity", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.45,
      format: fmt2,
    }),
    toggle("mouseFollow", "Mouse follow", true),
    toggle("ripple", "Click ripple", true),
    toggle("wireframe", "Wireframe", false),
  ],
};
