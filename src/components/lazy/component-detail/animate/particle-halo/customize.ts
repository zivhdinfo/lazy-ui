import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmtCount, fmtPx, fmtSec1, fmtX } from "../../format";

const colorOptions = [
  { value: "#ffffff", label: "White" },
  { value: "#a3a3a3", label: "Silver" },
  { value: "#525252", label: "Dim" },
  { value: "#00adb5", label: "Teal" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#dc2626", label: "Crimson" },
  { value: "#fb923c", label: "Orange" },
  { value: "#10b981", label: "Emerald" },
  { value: "#ec4899", label: "Pink" },
];

export const customize: CustomizeControl[] = [
  select("color1", "Color 1", colorOptions, "#a3a3a3"),
  select("color2", "Color 2", colorOptions, "#ffffff"),
  select(
    "shape",
    "Shape",
    [
      { value: "circle", label: "Circle" },
      { value: "square", label: "Square" },
      { value: "line", label: "Line" },
      { value: "spark", label: "Spark" },
    ],
    "circle",
  ),
  select(
    "mode",
    "Mode",
    [
      { value: "wave", label: "Wave" },
      { value: "pulse", label: "Pulse" },
      { value: "spiral", label: "Spiral" },
      { value: "chaos", label: "Chaos" },
    ],
    "wave",
  ),
  slider("particleCount", "Particles", {
    min: 400,
    max: 3500,
    step: 50,
    defaultValue: 1800,
    format: fmtCount,
  }),
  slider("radius", "Radius", {
    min: 0.2,
    max: 1,
    step: 0.05,
    defaultValue: 0.7,
    format: fmt2,
  }),
  slider("intensity", "Intensity", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    format: fmtX,
  }),
  slider("duration", "Cycle", {
    min: 4,
    max: 32,
    step: 0.5,
    defaultValue: 16,
    format: fmtSec1,
  }),
  slider("trail", "Trail", {
    min: 0,
    max: 0.95,
    step: 0.05,
    defaultValue: 0,
    format: fmt2,
  }),
  slider("sizeMax", "Max size", {
    min: 3,
    max: 14,
    step: 1,
    defaultValue: 8,
    format: fmtPx,
  }),
  toggle("glow", "Glow", true),
];
