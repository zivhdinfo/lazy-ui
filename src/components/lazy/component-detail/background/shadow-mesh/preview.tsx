import { ShadowMesh } from "@/components/lazy-ui/shadow-mesh";

import type { CustomizeValues } from "../../../customize";
import { HeroOverlay } from "../../hero-overlay";

const SHADOW_MESH_PALETTES: Record<string, string> = {
  ink: "#050505",
  smoke: "#1c1c1c",
  ash: "#525252",
  bone: "#f8f8f8",
};

export function Preview({ values }: { values: CustomizeValues }) {
  const paletteKey = (values.palette ?? "ink") as string;
  const color = SHADOW_MESH_PALETTES[paletteKey] ?? SHADOW_MESH_PALETTES.ink;
  const scale = (values.scale ?? 0.55) as number;
  const speed = (values.speed ?? 0.3) as number;
  const feather = (values.feather ?? 0.45) as number;
  const turbulence = (values.turbulence ?? 0.3) as number;
  const noise = (values.noise ?? 0.06) as number;
  const mouseFollow = (values.mouseFollow ?? true) as boolean;
  const mouseInfluence = (values.mouseInfluence ?? 0.6) as number;

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
}
