import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  toggle("defaultChecked", "Default checked", false),
  select(
    "size",
    "Size",
    [
      { value: "sm", label: "Small" },
      { value: "md", label: "Medium" },
      { value: "lg", label: "Large" },
    ],
    "md",
  ),
  select(
    "animation",
    "Animation",
    [
      { value: "spring", label: "Spring" },
      { value: "wobble", label: "Wobble" },
      { value: "smooth", label: "Smooth" },
      { value: "stretch", label: "Stretch" },
    ],
    "spring",
  ),
  toggle("disableDrag", "Disable drag", false),
  slider("flickVelocity", "Flick velocity", {
    min: 0.05,
    max: 1,
    step: 0.05,
    defaultValue: 0.35,
    format: (n) => `${n.toFixed(2)} px/ms`,
  }),
  toggle("disabled", "Disabled", false),
];
