import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmtCount } from "../../format";

export const customize: CustomizeControl[] = [
  // Row 1 — Palette + Effect (two wide selects fill a row).
  select(
    "palette",
    "Palette",
    [
      { value: "pearl", label: "Pearl" },
      { value: "bone", label: "Bone" },
      { value: "linen", label: "Linen" },
      { value: "silver", label: "Silver" },
      { value: "mist", label: "Mist" },
      { value: "ocean", label: "Ocean" },
      { value: "graphite", label: "Graphite" },
      { value: "obsidian", label: "Obsidian" },
    ],
    "graphite",
  ),
  select(
    "effect",
    "Effect",
    [
      { value: "outward", label: "Outward" },
      { value: "inward", label: "Inward" },
      { value: "breathe", label: "Breathe" },
      { value: "drift", label: "Drift" },
    ],
    "drift",
  ),
  // Row 2 — content toggle.
  toggle("showContent", "Show content", true),
  // Rows 3–6 — sliders, two per row.
  slider("rings", "Rings", {
    min: 2,
    max: 24,
    step: 1,
    defaultValue: 4,
    format: fmtCount,
    wide: true,
  }),
  slider("sharpness", "Sharpness", {
    min: 0.3,
    max: 3,
    step: 0.05,
    defaultValue: 0.3,
    format: fmt2,
    wide: true,
  }),
  slider("depth", "Depth", {
    min: 0,
    max: 2.5,
    step: 0.05,
    defaultValue: 1.25,
    format: fmt2,
    wide: true,
  }),
  slider("speed", "Speed", {
    min: 0,
    max: 3,
    step: 0.05,
    defaultValue: 1.15,
    format: fmt2,
    wide: true,
  }),
  slider("lightAngle", "Light", {
    min: 0,
    max: 360,
    step: 5,
    defaultValue: 130,
    format: (n) => `${Math.round(n)}°`,
    wide: true,
  }),
  slider("centerGlow", "Center glow", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.62,
    format: fmt2,
    wide: true,
  }),
  slider("vignette", "Vignette", {
    min: 0,
    max: 1,
    step: 0.02,
    defaultValue: 0.3,
    format: fmt2,
    wide: true,
  }),
  slider("originX", "Origin X", {
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    format: fmt2,
    wide: true,
  }),
  slider("originY", "Origin Y", {
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    format: fmt2,
    wide: true,
  }),
];
