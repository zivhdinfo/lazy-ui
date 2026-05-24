import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmtCount, fmtPx } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "variant",
    "Variant",
    [
      { value: "dots", label: "Dots" },
      { value: "lines", label: "Lines" },
      { value: "dashed", label: "Dashed" },
      { value: "crosshair", label: "Crosshair" },
    ],
    "dots",
  ),
  select(
    "fade",
    "Fade",
    [
      { value: "none", label: "None" },
      { value: "edges", label: "Edges" },
      { value: "center", label: "Center" },
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
    ],
    "edges",
  ),
  select(
    "color",
    "Color",
    [
      { value: "rgba(255,255,255,0.08)", label: "Soft white" },
      { value: "rgba(255,255,255,0.16)", label: "Bright white" },
      { value: "rgba(255,255,255,0.32)", label: "Stark white" },
      { value: "rgba(0,0,0,0.20)", label: "Soft black" },
    ],
    "rgba(255,255,255,0.16)",
  ),
  slider("size", "Cell size", {
    min: 8,
    max: 80,
    step: 1,
    defaultValue: 24,
    format: fmtPx,
  }),
  slider("lineWidth", "Line width", {
    min: 1,
    max: 4,
    step: 1,
    defaultValue: 1,
    format: fmtCount,
  }),
  slider("dotSize", "Dot size", {
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 3,
    format: fmtPx,
  }),
  slider("dashLength", "Dash length", {
    min: 1,
    max: 12,
    step: 1,
    defaultValue: 3,
    format: fmtPx,
  }),
  slider("dashGap", "Dash gap", {
    min: 1,
    max: 16,
    step: 1,
    defaultValue: 5,
    format: fmtPx,
  }),
  slider("crossSize", "Cross size", {
    min: 2,
    max: 12,
    step: 1,
    defaultValue: 5,
    format: fmtPx,
  }),
  slider("fadeStrength", "Fade strength", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 1,
    format: (n) => `${Math.round(n * 100)}%`,
  }),
];
