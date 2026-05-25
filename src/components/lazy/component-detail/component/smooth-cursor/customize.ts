import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtPx, fmt2 } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "trigger",
    "Trigger",
    [
      { value: "hover", label: "Hover" },
      { value: "press", label: "Press" },
      { value: "always", label: "Always" },
    ],
    "hover",
  ),
  select(
    "color",
    "Color",
    [
      { value: "#f97316", label: "Ember" },
      { value: "#10b981", label: "Mint" },
      { value: "#38bdf8", label: "Sky" },
      { value: "#fb7185", label: "Rose" },
    ],
    "#f97316",
  ),
  slider("size", "Size", {
    min: 20,
    max: 44,
    step: 1,
    defaultValue: 28,
    format: fmtPx,
  }),
  slider("tiltStrength", "Tilt", {
    min: 0,
    max: 22,
    step: 1,
    defaultValue: 12,
    format: (n) => `${Math.round(n)}deg`,
  }),
  slider("pressScale", "Press scale", {
    min: 0.82,
    max: 1,
    step: 0.01,
    defaultValue: 0.92,
    format: fmt2,
  }),
  toggle("showLabel", "Show label", true),
];
