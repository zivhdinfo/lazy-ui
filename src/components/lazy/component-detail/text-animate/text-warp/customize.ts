import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";
import { fmtSec1, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("trigger", "Trigger", true),
  slider("wordStagger", "Word stagger (s)", {
    min: 0,
    max: 0.6,
    step: 0.02,
    defaultValue: 0.2,
    format: fmtSec2,
  }),
  slider("letterStagger", "Letter stagger (s)", {
    min: 0,
    max: 0.2,
    step: 0.01,
    defaultValue: 0.04,
    format: fmtSec2,
  }),
  slider("entryDuration", "Entry duration (s)", {
    min: 0.3,
    max: 3,
    step: 0.1,
    defaultValue: 1.2,
    format: fmtSec1,
  }),
  slider("exitDuration", "Exit duration (s)", {
    min: 0.3,
    max: 3,
    step: 0.1,
    defaultValue: 1.6,
    format: fmtSec1,
  }),
];
