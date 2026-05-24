import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtCount, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "palette",
    "Palette",
    [
      { value: "sunset", label: "Sunset" },
      { value: "electric", label: "Electric" },
      { value: "aurora", label: "Aurora" },
      { value: "ocean", label: "Ocean" },
      { value: "void", label: "Void" },
      { value: "silver", label: "Silver" },
    ],
    "sunset",
  ),
  slider("speed", "Speed", {
    min: 0,
    max: 1.5,
    step: 0.05,
    defaultValue: 0.5,
    format: fmtX,
  }),
  slider("density", "Density", {
    min: 4,
    max: 40,
    step: 1,
    defaultValue: 13,
    format: fmtCount,
  }),
  slider("flow", "Flow", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("glow", "Glow", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.55,
    format: fmt2,
  }),
  slider("vignette", "Vignette", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.55,
    format: fmt2,
  }),
  slider("grain", "Grain", {
    min: 0,
    max: 0.2,
    step: 0.005,
    defaultValue: 0.04,
    format: fmt3,
  }),
  slider("mouseInfluence", "Mouse pulse", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.5,
    format: fmt2,
  }),
  toggle("mouseFollow", "Mouse follow", true),
];
