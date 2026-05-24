import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  select(
    "variant",
    "Variant",
    [
      { value: "default", label: "Default" },
      { value: "star", label: "Star" },
      { value: "ghost", label: "Ghost" },
      { value: "solid", label: "Solid" },
      { value: "silver", label: "Silver" },
    ],
    "default",
  ),
  select(
    "displayFormat",
    "Format",
    [
      { value: "compact", label: "14k" },
      { value: "full", label: "14,021" },
      { value: "plus", label: "14000+" },
    ],
    "compact",
  ),
  select(
    "counterEffect",
    "Counter",
    [
      { value: "3d", label: "3D" },
      { value: "fade", label: "Fade" },
      { value: "smooth", label: "Smooth" },
      { value: "wheel", label: "Wheel" },
      { value: "simple", label: "Simple" },
    ],
    "3d",
  ),
  select(
    "hoverMode",
    "Hover",
    [
      { value: "none", label: "None" },
      { value: "label", label: "Label" },
      { value: "full", label: "Full" },
    ],
    "none",
  ),
  slider("hoverDuration", "Hover duration", {
    min: 100,
    max: 1200,
    step: 50,
    defaultValue: 300,
    format: (n) => `${n}ms`,
  }),
  toggle("showCount", "Count", true),
  toggle("fetchStars", "Auto fetch", true),
];
