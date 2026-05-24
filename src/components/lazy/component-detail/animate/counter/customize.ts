import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmtMs } from "../../format";

export const customize: CustomizeControl[] = [
  slider("value", "Value", {
    min: 0,
    max: 25000,
    step: 1,
    defaultValue: 12848,
    format: (n) => Math.round(n).toLocaleString("en-US"),
  }),
  slider("speed", "Speed (ms)", {
    min: 100,
    max: 2400,
    step: 50,
    defaultValue: 1000,
    format: fmtMs,
  }),
  select(
    "effect",
    "Effect",
    [
      { value: "simple", label: "Simple" },
      { value: "wheel", label: "Wheel" },
      { value: "smooth", label: "Smooth" },
      { value: "fade", label: "Fade" },
      { value: "3d", label: "3D" },
    ],
    "3d",
  ),
  select(
    "easing",
    "Easing",
    [
      { value: "linear", label: "Linear" },
      { value: "ease-out", label: "Ease out" },
      { value: "ease-in-out", label: "Ease in out" },
    ],
    "ease-out",
  ),
  slider("decimals", "Decimals", {
    min: 0,
    max: 2,
    step: 1,
    defaultValue: 0,
    format: (n) => `${Math.round(n)}`,
  }),
];
