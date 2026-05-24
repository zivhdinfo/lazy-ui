import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
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
];
