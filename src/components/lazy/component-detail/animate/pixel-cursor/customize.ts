import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmt1, fmtPct, fmtPx } from "../../format";

const colorOptions = [
  { value: "#ffffff", label: "White" },
  { value: "#d4d4d4", label: "Silver" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#34d399", label: "Mint" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#fb923c", label: "Orange" },
  { value: "#525252", label: "Dim" },
];

export const customize: CustomizeControl[] = [
  select("color", "Main color", colorOptions, "#22d3ee"),
  select("edgeColor1", "Edge 1", colorOptions, "#ffffff"),
  select("edgeColor2", "Edge 2", colorOptions, "#a78bfa"),
  slider("pixelSize", "Pixel size", {
    min: 4,
    max: 20,
    step: 1,
    defaultValue: 5,
    format: fmtPx,
  }),
  slider("spread", "Spread", {
    min: 5,
    max: 160,
    step: 5,
    defaultValue: 10,
    format: fmtPx,
  }),
  slider("density", "Density", {
    min: 0.1,
    max: 1,
    step: 0.05,
    defaultValue: 0.75,
    format: fmtPct,
  }),
  slider("persistence", "Trail", {
    min: 0.5,
    max: 4,
    step: 0.1,
    defaultValue: 2.9,
    format: fmt1,
  }),
  slider("lag", "Delay", {
    min: 0,
    max: 0.95,
    step: 0.05,
    defaultValue: 0.95,
    format: fmtPct,
  }),
];
