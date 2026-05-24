import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";
import { fmtSec1, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("trigger", "Trigger", true),
  slider("wordStagger", "Word stagger (s)", {
    min: 0,
    max: 0.5,
    step: 0.02,
    defaultValue: 0.14,
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
    min: 0.2,
    max: 2,
    step: 0.1,
    defaultValue: 0.8,
    format: fmtSec1,
  }),
  slider("exitDuration", "Exit duration (s)", {
    min: 0.2,
    max: 2,
    step: 0.1,
    defaultValue: 0.6,
    format: fmtSec1,
  }),
];
