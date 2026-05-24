import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
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
];
