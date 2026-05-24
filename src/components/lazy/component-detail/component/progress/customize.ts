import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  slider("value", "Value", {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 60,
    format: (n) => `${Math.round(n)}%`,
  }),
  toggle("indeterminate", "Indeterminate", false),
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
      { value: "smooth", label: "Smooth" },
      { value: "wobble", label: "Wobble" },
    ],
    "spring",
  ),
  select(
    "effect",
    "Effect",
    [
      { value: "none", label: "None" },
      { value: "stripes", label: "Stripes" },
      { value: "glow", label: "Glow gradient" },
      { value: "pulse", label: "Pulse" },
    ],
    "glow",
  ),
  select(
    "glowPalette",
    "Glow palette",
    [
      { value: "default", label: "Default (2)" },
      { value: "rainbow", label: "Rainbow (7)" },
      { value: "warm", label: "Warm (3)" },
      { value: "cool", label: "Cool (3)" },
    ],
    "default",
  ),
  select(
    "valuePosition",
    "Value position",
    [
      { value: "hidden", label: "Hidden" },
      { value: "end", label: "End (above-right)" },
      { value: "above-leading", label: "Above leading" },
      { value: "inside-leading", label: "Inside leading" },
      { value: "edge-leading", label: "Edge leading" },
    ],
    "end",
  ),
];
