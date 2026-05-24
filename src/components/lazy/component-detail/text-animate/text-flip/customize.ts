import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmtPx, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "trigger",
    "Trigger",
    [
      { value: "hover", label: "Hover" },
      { value: "mount", label: "Mount" },
      { value: "view", label: "In view" },
    ],
    "hover",
  ),
  select(
    "direction",
    "Direction",
    [
      { value: "top", label: "Top" },
      { value: "right", label: "Right" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
    ],
    "right",
  ),
  select(
    "staggerFrom",
    "Stagger from",
    [
      { value: "first", label: "First" },
      { value: "last", label: "Last" },
      { value: "center", label: "Center" },
    ],
    "first",
  ),
  slider("stagger", "Stagger (s)", {
    min: 0,
    max: 0.2,
    step: 0.01,
    defaultValue: 0.04,
    format: fmtSec2,
  }),
  slider("duration", "Duration (s)", {
    min: 0.2,
    max: 2,
    step: 0.05,
    defaultValue: 0.55,
    format: fmtSec2,
  }),
  slider("perspective", "Perspective (px)", {
    min: 200,
    max: 2400,
    step: 50,
    defaultValue: 1000,
    format: fmtPx,
  }),
];
