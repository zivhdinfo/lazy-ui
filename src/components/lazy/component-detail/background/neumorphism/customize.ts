import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmtCount, fmtPx } from "../../format";

export const customize: CustomizeControl[] = [
  // Row 1 — Palette + Glow color + Show content (selects fill space, toggle
  // sits at the right with its narrower max-width).
  select(
    "palette",
    "Palette",
    [
      { value: "pearl", label: "Pearl" },
      { value: "bone", label: "Bone" },
      { value: "silver", label: "Silver" },
      { value: "graphite", label: "Graphite" },
      { value: "obsidian", label: "Obsidian" },
      { value: "moonlight", label: "Moonlight" },
    ],
    "pearl",
  ),
  select(
    "glowColor",
    "Glow color",
    [
      { value: "default", label: "Palette default" },
      { value: "#a8c5ff", label: "Sky" },
      { value: "#ffb87a", label: "Amber" },
      { value: "#b6a6ff", label: "Iris" },
      { value: "#ff8db5", label: "Rose" },
      { value: "#7be0c4", label: "Mint" },
      { value: "#ffffff", label: "White" },
    ],
    "default",
  ),
  toggle("showContent", "Show content", true),
  // Rows 2–5 — sliders, 2 per row (wide:true → flex-basis 50%).
  slider("layers", "Layers", {
    min: 1,
    max: 12,
    step: 1,
    defaultValue: 5,
    format: fmtCount,
    wide: true,
  }),
  slider("spread", "Spread", {
    min: 8,
    max: 120,
    step: 1,
    defaultValue: 93,
    format: fmtPx,
    wide: true,
  }),
  slider("radius", "Radius", {
    min: 0,
    max: 200,
    step: 2,
    defaultValue: 42,
    format: fmtPx,
    wide: true,
  }),
  slider("angle", "Angle", {
    min: 0,
    max: 360,
    step: 5,
    defaultValue: 205,
    format: (n) => `${Math.round(n)}°`,
    wide: true,
  }),
  slider("softness", "Softness", {
    min: 4,
    max: 120,
    step: 1,
    defaultValue: 67,
    format: fmtPx,
    wide: true,
  }),
  slider("depth", "Depth", {
    min: 0.2,
    max: 4,
    step: 0.05,
    defaultValue: 2.9,
    format: fmt2,
    wide: true,
  }),
  slider("glow", "Glow", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1.55,
    format: fmt2,
    wide: true,
  }),
  slider("speed", "Speed", {
    min: 0,
    max: 1.5,
    step: 0.05,
    defaultValue: 0.7,
    format: fmt2,
    wide: true,
  }),
  // Row 6 — 4 corner toggles. Turning a toggle off renders that corner as a
  // sharp 90°.
  toggle("cornerTL", "Round TL", true),
  toggle("cornerTR", "Round TR", false),
  toggle("cornerBR", "Round BR", true),
  toggle("cornerBL", "Round BL", true),
];
