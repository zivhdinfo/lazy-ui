import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmt2, fmt3, fmtCount, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "effect",
    "Effect",
    [
      { value: "wave", label: "Wave" },
      { value: "spiral", label: "Spiral" },
      { value: "ripple", label: "Ripple" },
      { value: "vortex", label: "Vortex" },
      { value: "pulse", label: "Pulse" },
      { value: "bloom", label: "Bloom" },
    ],
    "wave",
  ),
  slider("scale", "Scale", {
    min: 0.2,
    max: 3,
    step: 0.05,
    defaultValue: 0.4,
    format: fmtX,
  }),
  slider("colorLayers", "Color layers", {
    min: 1,
    max: 6,
    step: 1,
    defaultValue: 3,
    format: fmtCount,
  }),
  slider("spiralArms", "Arms", {
    min: 0,
    max: 12,
    step: 1,
    defaultValue: 5,
    format: fmtCount,
  }),
  slider("waveIntensity", "Wave", {
    min: 0,
    max: 0.6,
    step: 0.01,
    defaultValue: 0.22,
    format: fmt2,
  }),
  slider("spiralIntensity", "Spiral", {
    min: 0,
    max: 3,
    step: 0.05,
    defaultValue: 2,
    format: fmt2,
  }),
  slider("lineThickness", "Thickness", {
    min: 0.01,
    max: 0.3,
    step: 0.005,
    defaultValue: 0.13,
    format: fmt3,
  }),
  slider("falloff", "Falloff", {
    min: 0.1,
    max: 3,
    step: 0.05,
    defaultValue: 1.65,
    format: fmt2,
  }),
  slider("brightness", "Brightness", {
    min: 0.1,
    max: 3,
    step: 0.05,
    defaultValue: 3,
    format: fmt2,
  }),
  slider("speed", "Speed", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 0.5,
    format: fmtX,
  }),
  select(
    "colorTint",
    "Color tint",
    [
      { value: "#7c3aed", label: "Violet" },
      { value: "#c084fc", label: "Lavender" },
      { value: "#f0abfc", label: "Pink" },
      { value: "#22d3ee", label: "Cyan" },
      { value: "#fcd34d", label: "Amber" },
      { value: "#de7343", label: "Ember" },
    ],
    "#7c3aed",
  ),
];
