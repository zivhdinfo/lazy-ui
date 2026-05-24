import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt1, fmt2, fmt3, fmtMs } from "../../format";

export const customize: CustomizeControl[] = [
  slider("duration", "Duration", {
    min: 500,
    max: 5000,
    step: 50,
    defaultValue: 2400,
    format: fmtMs,
  }),
  slider("hold", "Hold", {
    min: 0,
    max: 3000,
    step: 50,
    defaultValue: 1200,
    format: fmtMs,
  }),
  slider("distortion", "Distortion", {
    min: 0,
    max: 0.25,
    step: 0.005,
    defaultValue: 0.08,
    format: fmt3,
  }),
  slider("softness", "Softness", {
    min: 0.02,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.18,
    format: fmt2,
  }),
  slider("noiseScale", "Noise scale", {
    min: 0.5,
    max: 6,
    step: 0.1,
    defaultValue: 2.4,
    format: fmt1,
  }),
  slider("drip", "Drip", {
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.55,
    format: fmt2,
  }),
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
  toggle("autoPlay", "Auto play", true),
  toggle("loop", "Loop", true),
];
