import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtMs, fmtPx } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "side",
    "Side",
    [
      { value: "auto", label: "Auto (cursor)" },
      { value: "top", label: "Top" },
      { value: "right", label: "Right" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
    ],
    "top",
  ),
  slider("sideOffset", "Side Offset", {
    min: 0,
    max: 24,
    step: 1,
    defaultValue: 6,
    format: fmtPx,
  }),
  slider("delayDuration", "Delay (ms)", {
    min: 0,
    max: 1000,
    step: 50,
    defaultValue: 150,
    format: fmtMs,
  }),
  select(
    "followCursor",
    "Follow cursor",
    [
      { value: "off", label: "Off" },
      { value: "both", label: "Both axes" },
      { value: "x", label: "X only" },
      { value: "y", label: "Y only" },
    ],
    "off",
  ),
  toggle("arrow", "Arrow", false),
  toggle("slideBetween", "Slide between triggers", true),
];
