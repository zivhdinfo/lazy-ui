import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtPct, fmtSec1 } from "../../format";

export const customize: CustomizeControl[] = [
  slider("duration", "Duration (s)", {
    min: 1,
    max: 12,
    step: 0.5,
    defaultValue: 5,
    format: fmtSec1,
  }),
  slider("intensity", "Intensity", {
    min: 0.05,
    max: 0.8,
    step: 0.05,
    defaultValue: 0.32,
    format: fmtPct,
  }),
  select(
    "variant",
    "Variant",
    [
      { value: "beam", label: "Beam" },
      { value: "glass", label: "Glass" },
    ],
    "beam",
  ),
  toggle("disabled", "Disabled", false),
];
