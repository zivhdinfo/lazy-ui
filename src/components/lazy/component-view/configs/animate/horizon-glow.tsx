import {
  HorizonGlow,
  type HorizonGlowMode,
  type HorizonGlowPalette,
} from "@/components/lazy-ui/horizon-glow";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtX } from "@/components/lazy/component-detail/format";
import { HeroOverlay } from "@/components/lazy/component-detail/hero-overlay";
import type { ComponentView } from "@/components/lazy/component-view/types";

const ACCENTS: Record<HorizonGlowPalette, string> = {
  aurora: "#38bdf8",
  dawn: "#fde047",
  ice: "#e0f2fe",
  ember: "#fb923c",
  violet: "#c4b5fd",
  silver: "#f5f5f5",
};

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/horizon-glow"),
  export: "HorizonGlow",
  componentName: "HorizonGlow",
  importPath: "@/components/lazy-ui/horizon-glow",
  stageMinHeight: 560,
  render: (v) => {
    const palette = (v.palette ?? "aurora") as HorizonGlowPalette;
    const mode = (v.mode ?? "dark") as HorizonGlowMode;
    const speed = (v.speed ?? 0.35) as number;
    const intensity = (v.intensity ?? 1.15) as number;
    const rise = (v.rise ?? 0.48) as number;
    const rays = (v.rays ?? 0.85) as number;
    const softness = (v.softness ?? 0.58) as number;
    const mouseFollow = (v.mouseFollow ?? true) as boolean;
    const mouseInfluence = (v.mouseInfluence ?? 0.55) as number;
    const clickRipple = (v.clickRipple ?? true) as boolean;
    const rippleStrength = (v.rippleStrength ?? 0.65) as number;
    const showContent = (v.showContent ?? true) as boolean;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <HorizonGlow
          palette={palette}
          mode={mode}
          speed={speed}
          intensity={intensity}
          rise={rise}
          rays={rays}
          softness={softness}
          mouseFollow={mouseFollow}
          mouseInfluence={mouseInfluence}
          clickRipple={clickRipple}
          rippleStrength={rippleStrength}
          showContent={showContent}
          className="h-[480px] w-full rounded-2xl"
        >
          <HeroOverlay
            eyebrow="Hover and click the horizon"
            title={
              <>
                Light that
                <br />
                <span className="font-semibold italic">rises quietly.</span>
              </>
            }
            description="A transparent WebGL horizon arc with drifting color, hover-reactive rays, click ripples, and a reduced-motion static fallback."
            accent={ACCENTS[palette]}
            variant={mode === "light" ? "light" : "dark"}
          />
        </HorizonGlow>
      </div>
    );
  },
  controls: [
    select(
      "mode",
      "Mode",
      [
        { value: "dark", label: "Dark" },
        { value: "light", label: "Light" },
      ],
      "dark",
    ),
    select(
      "palette",
      "Palette",
      [
        { value: "aurora", label: "Aurora" },
        { value: "dawn", label: "Dawn" },
        { value: "ice", label: "Ice" },
        { value: "ember", label: "Ember" },
        { value: "violet", label: "Violet" },
        { value: "silver", label: "Silver" },
      ],
      "aurora",
    ),
    slider("speed", "Speed", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.35,
      format: fmtX,
    }),
    slider("intensity", "Intensity", {
      min: 0,
      max: 2,
      step: 0.05,
      defaultValue: 1.15,
      format: fmt2,
    }),
    slider("rise", "Rise", {
      min: 0,
      max: 1,
      step: 0.02,
      defaultValue: 0.48,
      format: fmt2,
    }),
    slider("rays", "Rays", {
      min: 0,
      max: 1.5,
      step: 0.05,
      defaultValue: 0.85,
      format: fmt2,
    }),
    slider("softness", "Softness", {
      min: 0,
      max: 1,
      step: 0.02,
      defaultValue: 0.58,
      format: fmt2,
    }),
    slider("mouseInfluence", "Mouse pull", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.55,
      format: fmt2,
    }),
    slider("rippleStrength", "Ripple strength", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.65,
      format: fmt2,
    }),
    toggle("mouseFollow", "Mouse follow", true),
    toggle("clickRipple", "Click effect", true),
  ],
  footer: {
    defaults: { showContent: true },
    render: (values, onChange) => {
      const showContent = (values.showContent ?? true) as boolean;

      return (
        <div className="flex flex-col gap-2">
          <span className="cv-control-label">Content</span>
          <div className="cv-seg" role="group" aria-label="Content">
            <button
              type="button"
              aria-pressed={showContent}
              onClick={() => onChange("showContent", true)}
              className={`cv-seg-chip ${showContent ? "is-active" : ""}`}
            >
              On
            </button>
            <button
              type="button"
              aria-pressed={!showContent}
              onClick={() => onChange("showContent", false)}
              className={`cv-seg-chip ${showContent ? "" : "is-active"}`}
            >
              Off
            </button>
          </div>
        </div>
      );
    },
  },
  api: [
    {
      name: "children",
      type: "ReactNode",
      default: "-",
      description:
        "Content rendered above the canvas inside a `relative z-10 h-full w-full` wrapper.",
    },
    {
      name: "palette",
      type: '"aurora" | "dawn" | "ice" | "ember" | "violet" | "silver"',
      default: '"aurora"',
      description: "Preset color set for the horizon glow.",
    },
    {
      name: "mode",
      type: '"dark" | "light"',
      default: '"dark"',
      description:
        "Surface mode. `light` uses a white surface with the sample-style transparent color glow and white rim highlights.",
    },
    {
      name: "colors",
      type: "string[]",
      default: "-",
      description:
        "Custom 2-6 stop palette. Stops drift from left to right across the arc and override `palette`.",
    },
    {
      name: "backgroundColor",
      type: "string",
      default: "mode background",
      description:
        "Solid fill behind the transparent glow and static fallback.",
    },
    {
      name: "speed",
      type: "number",
      default: "0.35",
      description: "Animation speed multiplier. Use `0` to freeze the glow.",
    },
    {
      name: "intensity",
      type: "number",
      default: "1.15",
      description: "Overall brightness multiplier, clamped between 0 and 2.",
    },
    {
      name: "rise",
      type: "number",
      default: "0.48",
      description:
        "Vertical height of the horizon arc, normalized 0-1. Higher lifts the arc into the frame.",
    },
    {
      name: "rays",
      type: "number",
      default: "0.85",
      description:
        "Strength of the upward light rays, clamped between 0 and 1.5.",
    },
    {
      name: "softness",
      type: "number",
      default: "0.58",
      description:
        "Halo spread around the arc, normalized 0-1. Higher values create a wider, softer glow.",
    },
    {
      name: "mouseFollow",
      type: "boolean",
      default: "true",
      description:
        "Cursor hover brightens the nearest horizon region and tints it toward the pointer position.",
    },
    {
      name: "mouseInfluence",
      type: "number",
      default: "0.55",
      description:
        "Hover strength, clamped between 0 and 1. Higher values create a stronger local bloom.",
    },
    {
      name: "clickRipple",
      type: "boolean",
      default: "true",
      description:
        "Pointer-down emits a temporary radial burst through the horizon glow.",
    },
    {
      name: "rippleStrength",
      type: "number",
      default: "0.65",
      description:
        "Click ripple strength, clamped between 0 and 1. Multiple clicks can overlap before each wave fades.",
    },
    {
      name: "showContent",
      type: "boolean",
      default: "true",
      description:
        "Render `children` above the glow. Disable it to use the animated surface by itself.",
    },
    {
      name: "className",
      type: "string",
      default: "-",
      description:
        "Extra class names merged onto the root container. Width and height are controlled here.",
    },
  ],
};
