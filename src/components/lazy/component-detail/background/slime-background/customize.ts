import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "palette",
    "Palette",
    [
      { value: "toxic", label: "Toxic" },
      { value: "magma", label: "Magma" },
      { value: "azure", label: "Azure" },
      { value: "amber", label: "Amber" },
      { value: "silver", label: "Silver" },
    ],
    "toxic",
  ),
  toggle("showContent", "Show content", true),
  slider("speed", "Speed", {
    min: 0,
    max: 1.5,
    step: 0.05,
    defaultValue: 0.35,
    format: fmtX,
  }),
  slider("viscosity", "Viscosity", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 0.85,
    format: fmt2,
  }),
  slider("shine", "Shine", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("roughness", "Roughness", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.35,
    format: fmt2,
  }),
  slider("detail", "Detail", {
    min: 0.2,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("contrast", "Contrast", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.5,
    format: fmt2,
  }),
  slider("grain", "Grain", {
    min: 0,
    max: 0.2,
    step: 0.005,
    defaultValue: 0.04,
    format: fmt3,
  }),
  slider("mouseInfluence", "Mouse press", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.6,
    format: fmt2,
  }),
  toggle("mouseFollow", "Mouse follow", true),
];
