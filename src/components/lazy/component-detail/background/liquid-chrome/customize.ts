import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2 } from "../../format";

export const customize: CustomizeControl[] = [
  // Row 1 — Palette select (wide).
  select(
    "palette",
    "Palette",
    [
      { value: "nightfire", label: "Nightfire" },
      { value: "aurora", label: "Aurora" },
      { value: "nebula", label: "Nebula" },
      { value: "ember", label: "Ember" },
      { value: "chrome", label: "Chrome" },
      { value: "mercury", label: "Mercury" },
    ],
    "nightfire",
  ),
  // Row 2 — content + cursor toggles.
  toggle("showContent", "Show content", true),
  toggle("mouseFollow", "Cursor stir", true),
  // Rows 3+ — sliders, two per row.
  slider("speed", "Speed", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 0.45,
    format: fmt2,
    wide: true,
  }),
  slider("scale", "Scale", {
    min: 0.3,
    max: 6,
    step: 0.05,
    defaultValue: 0.8,
    format: fmt2,
    wide: true,
  }),
  slider("warp", "Warp", {
    min: 0,
    max: 2.5,
    step: 0.05,
    defaultValue: 0.45,
    format: fmt2,
    wide: true,
  }),
  slider("relief", "Relief", {
    min: 0.2,
    max: 3.5,
    step: 0.05,
    defaultValue: 0.85,
    format: fmt2,
    wide: true,
  }),
  slider("tilt", "Tilt", {
    min: 0,
    max: 360,
    step: 5,
    defaultValue: 45,
    format: (n) => `${Math.round(n)}°`,
    wide: true,
  }),
  slider("highlight", "Highlight", {
    min: 0,
    max: 3,
    step: 0.05,
    defaultValue: 1.45,
    format: fmt2,
    wide: true,
  }),
  slider("roughness", "Roughness", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.58,
    format: fmt2,
    wide: true,
  }),
  slider("ambient", "Ambient", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.28,
    format: fmt2,
    wide: true,
  }),
  slider("mouseInfluence", "Stir strength", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.24,
    format: fmt2,
    wide: true,
  }),
];
