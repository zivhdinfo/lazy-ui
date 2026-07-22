import {
  PixelDither,
  type PixelDitherColorMode,
  type PixelDitherIntroFrom,
  type PixelDitherShape,
} from "@/components/lazy-ui/pixel-dither";
import {
  select,
  slider,
  text,
  toggle,
} from "@/components/lazy/component-detail/controls";
import {
  fmtPct,
  fmtPx,
  fmtSec1,
} from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

const DEFAULT_SRC = "/logo.png";

const toneOptions = [
  { value: "#09090b", label: "Ink" },
  { value: "#000000", label: "Black" },
  { value: "#f4f4f5", label: "Paper" },
  { value: "#ffffff", label: "White" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/pixel-dither"),
  export: "PixelDither",
  stageMinHeight: 440,
  render: (v) => {
    const src = ((v.src as string | undefined)?.trim() || DEFAULT_SRC) as string;
    const colorMode = (v.colorMode ?? "mono") as PixelDitherColorMode;
    const darkColor = (v.darkColor ?? "#09090b") as string;
    const lightColor = (v.lightColor ?? "#f4f4f5") as string;
    const shape = (v.shape ?? "square") as PixelDitherShape;
    const introFrom = (v.introFrom ?? "random") as PixelDitherIntroFrom;
    const pixelSize = (v.pixelSize ?? 2) as number;
    const gap = (v.gap ?? 0) as number;
    const density = (v.density ?? 1) as number;
    const interactionRadius = (v.interactionRadius ?? 110) as number;
    const strength = (v.strength ?? 26) as number;
    const introDuration = (v.introDuration ?? 1.4) as number;
    const interactive = (v.interactive ?? true) as boolean;
    const introEnabled = (v.intro ?? true) as boolean;

    return (
      <div className="flex min-h-[480px] w-full items-center justify-center p-4">
        <div className="relative h-[320px] w-[320px] overflow-hidden ">
          <PixelDither
            src={src}
            colorMode={colorMode}
            darkColor={darkColor}
            lightColor={lightColor}
            shape={shape}
            introFrom={introFrom}
            pixelSize={pixelSize}
            gap={gap}
            density={density}
            interactionRadius={interactionRadius}
            strength={strength}
            introDuration={introDuration}
            interactive={interactive}
            intro={introEnabled}
            className="absolute inset-0"
          />
        </div>
      </div>
    );
  },
  controls: [
    text("src", "Image URL", DEFAULT_SRC, "https://…/photo.jpg"),
    select(
      "colorMode",
      "Color mode",
      [
        { value: "original", label: "Original" },
        { value: "mono", label: "Mono" },
      ],
      "mono",
    ),
    select("darkColor", "Dark tone", toneOptions, "#09090b"),
    select("lightColor", "Light tone", toneOptions, "#f4f4f5"),
    select(
      "shape",
      "Shape",
      [
        { value: "square", label: "Square" },
        { value: "circle", label: "Circle" },
      ],
      "square",
    ),
    select(
      "introFrom",
      "Intro from",
      [
        { value: "random", label: "Random" },
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
        { value: "center", label: "Center" },
      ],
      "random",
    ),
    slider("pixelSize", "Pixel size", {
      min: 2,
      max: 20,
      step: 1,
      defaultValue: 2,
      format: fmtPx,
    }),
    slider("gap", "Gap", { min: 0, max: 10, step: 1, defaultValue: 0, format: fmtPx }),
    slider("density", "Density", {
      min: 0.1,
      max: 1,
      step: 0.05,
      defaultValue: 1,
      format: fmtPct,
    }),
    slider("interactionRadius", "Radius", {
      min: 20,
      max: 300,
      step: 10,
      defaultValue: 110,
      format: fmtPx,
    }),
    slider("strength", "Strength", {
      min: 0,
      max: 80,
      step: 2,
      defaultValue: 26,
      format: fmtPx,
    }),
    slider("introDuration", "Intro duration", {
      min: 0.4,
      max: 3,
      step: 0.1,
      defaultValue: 1.4,
      format: fmtSec1,
    }),
    toggle("interactive", "Interactive", true),
    toggle("intro", "Intro", true),
  ],
};
