import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmt3 } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "label",
    "Label",
    [
      { value: "Enter the void", label: "Enter the void" },
      { value: "Get started", label: "Get started" },
      { value: "Sign in", label: "Sign in" },
      { value: "Browse the docs", label: "Browse the docs" },
    ],
    "Enter the void",
  ),
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
    "tint",
    "Tint",
    [
      { value: "cool", label: "Cool" },
      { value: "warm", label: "Warm" },
      { value: "none", label: "None" },
    ],
    "cool",
  ),
  slider("distortion", "Distortion", {
    min: 0,
    max: 24,
    step: 0.5,
    defaultValue: 10,
    format: (n) => `${n.toFixed(1)}px`,
  }),
  slider("frequency", "Frequency", {
    min: 0.005,
    max: 0.08,
    step: 0.001,
    defaultValue: 0.014,
    format: fmt3,
  }),
];
