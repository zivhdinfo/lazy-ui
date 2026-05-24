import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "palette",
    "Palette",
    [
      { value: "ember", label: "Ember" },
      { value: "iris", label: "Iris" },
      { value: "ocean", label: "Ocean" },
      { value: "candy", label: "Candy" },
      { value: "void", label: "Void" },
      { value: "silver", label: "Silver" },
    ],
    "ember",
  ),
  select(
    "layout",
    "Layout",
    [
      { value: "diagonal", label: "Diagonal" },
      { value: "anti-diagonal", label: "Anti-diagonal" },
      { value: "corners", label: "All corners" },
    ],
    "diagonal",
  ),
  slider("softness", "Softness", {
    min: 0.2,
    max: 1,
    step: 0.02,
    defaultValue: 0.76,
    format: fmt2,
  }),
  slider("intensity", "Intensity", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1.1,
    format: fmt2,
  }),
  slider("grain", "Grain", {
    min: 0,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.2,
    format: fmt2,
  }),
  slider("speed", "Speed", {
    min: 0,
    max: 1.5,
    step: 0.05,
    defaultValue: 0.6,
    format: fmtX,
  }),
  slider("drift", "Drift", {
    min: 0,
    max: 0.2,
    step: 0.005,
    defaultValue: 0.05,
    format: fmt3,
  }),
  slider("mouseInfluence", "Mouse pull", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.4,
    format: fmt2,
  }),
  toggle("mouseFollow", "Mouse follow", true),
];
