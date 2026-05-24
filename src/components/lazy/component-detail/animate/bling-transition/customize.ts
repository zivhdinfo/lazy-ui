import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt2, fmt3, fmtCount, fmtMs } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "palette",
    "Palette",
    [
      { value: "iris", label: "Iris" },
      { value: "ember", label: "Ember" },
      { value: "ice", label: "Ice" },
      { value: "silver", label: "Silver" },
    ],
    "iris",
  ),
  select(
    "direction",
    "Direction",
    [
      { value: "noise", label: "Noise" },
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
      { value: "radial", label: "Radial" },
    ],
    "noise",
  ),
  slider("duration", "Duration", {
    min: 400,
    max: 8000,
    step: 100,
    defaultValue: 4200,
    format: fmtMs,
  }),
  slider("hold", "Hold", {
    min: 0,
    max: 4000,
    step: 100,
    defaultValue: 1800,
    format: fmtMs,
  }),
  slider("intensity", "Intensity", {
    min: 0.001,
    max: 0.02,
    step: 0.0005,
    defaultValue: 0.005,
    format: (n) => n.toFixed(4),
  }),
  slider("iterations", "Iterations", {
    min: 1,
    max: 6,
    step: 1,
    defaultValue: 4,
    format: fmtCount,
  }),
  slider("sparkleStrength", "Sparkle", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("softness", "Softness", {
    min: 0,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.22,
    format: fmt2,
  }),
  slider("distortion", "Distortion", {
    min: 0,
    max: 0.3,
    step: 0.005,
    defaultValue: 0.08,
    format: fmt3,
  }),
  slider("drip", "Drip", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.55,
    format: fmt2,
  }),
  toggle("autoPlay", "Auto play", true),
  toggle("loop", "Loop", true),
];
