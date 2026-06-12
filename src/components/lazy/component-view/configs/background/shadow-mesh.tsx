import { ShadowMesh } from "@/components/lazy-ui/shadow-mesh";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmt3, fmtX } from "@/components/lazy/component-detail/format";
import { HeroOverlay } from "@/components/lazy/component-detail/hero-overlay";
import type { ComponentView } from "@/components/lazy/component-view/types";

const SHADOW_MESH_PALETTES: Record<string, string> = {
  ink: "#050505",
  smoke: "#1c1c1c",
  ash: "#525252",
  bone: "#f8f8f8",
};

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/shadow-mesh"),
  export: "ShadowMesh",
  stageMinHeight: 560,
  render: (v) => {
    const paletteKey = (v.palette ?? "ink") as string;
    const color = SHADOW_MESH_PALETTES[paletteKey] ?? SHADOW_MESH_PALETTES.ink;
    const scale = (v.scale ?? 0.55) as number;
    const speed = (v.speed ?? 0.3) as number;
    const feather = (v.feather ?? 0.45) as number;
    const turbulence = (v.turbulence ?? 0.3) as number;
    const noise = (v.noise ?? 0.06) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.6) as number;

    // Light surface behind the plume so the dark mass reads against something —
    // when palette = bone (white) the inverted contrast still works.
    const isBone = paletteKey === "bone";
    const surfaceBg = isBone
      ? "linear-gradient(180deg, #0a0a0a 0%, #161616 100%)"
      : "linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 60%, #a3a3a3 100%)";

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <ShadowMesh
          color={color}
          backgroundColor="transparent"
          scale={scale}
          speed={speed}
          feather={feather}
          turbulence={turbulence}
          noise={noise}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          className="h-[480px] w-full rounded-2xl"
          style={{ background: surfaceBg }}
        >
          <HeroOverlay
            variant={isBone ? "dark" : "light"}
            eyebrow="Three plumes, drifting"
            title={
              <>
                <span className="italic">Quiet</span> backgrounds
                <br />
                <span className="font-semibold">that breathe slowly.</span>
              </>
            }
            description="Three radial masses warped by FBM bleed into one another. The primary plume tracks your cursor through honey — move and the shadow follows."
          />
        </ShadowMesh>
      </div>
    );
  },
  controls: [
    select(
      "palette",
      "Color",
      [
        { value: "ink", label: "Ink" },
        { value: "smoke", label: "Smoke" },
        { value: "ash", label: "Ash" },
        { value: "bone", label: "Bone" },
      ],
      "ink",
    ),
    slider("scale", "Scale", {
      min: 0.1,
      max: 0.9,
      step: 0.02,
      defaultValue: 0.55,
      format: fmt2,
    }),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.3,
      format: fmtX,
    }),
    slider("feather", "Feather", {
      min: 0.05,
      max: 0.9,
      step: 0.05,
      defaultValue: 0.45,
      format: fmt2,
    }),
    slider("turbulence", "Turbulence", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.3,
      format: fmt2,
    }),
    slider("mouseInfluence", "Mouse pull", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
      format: fmt2,
    }),
    slider("noise", "Grain", {
      min: 0,
      max: 0.2,
      step: 0.005,
      defaultValue: 0.06,
      format: fmt3,
    }),
    toggle("mouseFollow", "Mouse follow", true),
  ],
};
