import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";
import { fmtSec1 } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("reverse", "Counter-clockwise", false),
  slider("radius", "Radius (ch)", {
    min: 3,
    max: 10,
    step: 0.5,
    defaultValue: 5,
    format: (n) => `${n.toFixed(1)}ch`,
  }),
  slider("duration", "Duration (s)", {
    min: 2,
    max: 30,
    step: 0.5,
    defaultValue: 14,
    format: fmtSec1,
  }),
];
