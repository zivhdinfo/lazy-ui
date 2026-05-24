import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmtMs } from "../../format";

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
    "easing",
    "Easing",
    [
      { value: "linear", label: "Linear" },
      { value: "ease-in", label: "Ease in" },
      { value: "ease-out", label: "Ease out" },
      { value: "ease-in-out", label: "Ease in-out" },
    ],
    "linear",
  ),
  select(
    "charset",
    "Charset",
    [
      { value: "X$@aHzo0y#?*01+", label: "Mixed (default)" },
      { value: "01", label: "Binary" },
      { value: "0123456789ABCDEF", label: "Hex" },
      { value: "abcdefghijklmnopqrstuvwxyz", label: "Lowercase" },
    ],
    "X$@aHzo0y#?*01+",
  ),
  slider("duration", "Duration (ms)", {
    min: 200,
    max: 3000,
    step: 50,
    defaultValue: 800,
    format: fmtMs,
  }),
  slider("tickMs", "Tick (ms)", {
    min: 10,
    max: 120,
    step: 5,
    defaultValue: 30,
    format: fmtMs,
  }),
];
