import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";
import { fmtSec1, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("trigger", "Trigger", true),
  slider("wordStagger", "Word stagger (s)", {
    min: 0,
    max: 0.4,
    step: 0.02,
    defaultValue: 0.12,
    format: fmtSec2,
  }),
  slider("letterStagger", "Letter stagger (s)", {
    min: 0,
    max: 0.15,
    step: 0.005,
    defaultValue: 0.035,
    format: (n) => `${n.toFixed(3)}s`,
  }),
  slider("entryDuration", "Entry duration (s)", {
    min: 0.2,
    max: 2,
    step: 0.1,
    defaultValue: 0.7,
    format: fmtSec1,
  }),
  slider("exitDuration", "Exit duration (s)", {
    min: 0.2,
    max: 2,
    step: 0.1,
    defaultValue: 0.5,
    format: fmtSec1,
  }),
];
