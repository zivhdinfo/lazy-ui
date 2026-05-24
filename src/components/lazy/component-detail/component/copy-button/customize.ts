import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtMs } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("text", "Text", true),
  select(
    "textAs",
    "Text As",
    [
      { value: "inline", label: "Inline" },
      { value: "tooltip", label: "Tooltip" },
    ],
    "inline",
  ),
  toggle("revealAnimate", "Reveal Animate", true),
  select(
    "iconAnimate",
    "Icon Animate",
    [
      { value: "blur", label: "Blur" },
      { value: "draw", label: "Draw" },
      { value: "reveal", label: "Reveal" },
    ],
    "blur",
  ),
  slider("delay", "Delay (ms)", {
    min: 500,
    max: 10000,
    step: 100,
    defaultValue: 4000,
    format: fmtMs,
  }),
];
