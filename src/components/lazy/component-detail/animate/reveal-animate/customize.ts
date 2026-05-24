import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtMs } from "../../format";

export const customize: CustomizeControl[] = [
  toggle("trigger", "Trigger", true),
  select(
    "from",
    "From",
    [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
    "left",
  ),
  slider("duration", "Duration (ms)", {
    min: 100,
    max: 2000,
    step: 50,
    defaultValue: 450,
    format: fmtMs,
  }),
];
