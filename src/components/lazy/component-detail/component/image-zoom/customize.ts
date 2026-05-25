import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  slider("zoomScale", "Scale", {
    min: 1.2,
    max: 4,
    step: 0.1,
    defaultValue: 2.6,
    format: (n) => `${n.toFixed(1)}x`,
  }),
  slider("duration", "Duration", {
    min: 120,
    max: 900,
    step: 20,
    defaultValue: 420,
    format: (n) => `${Math.round(n)}ms`,
  }),
  slider("edgeBlurAmount", "Blur", {
    min: 0,
    max: 24,
    step: 1,
    defaultValue: 10,
    format: (n) => `${Math.round(n)}px`,
  }),
  slider("focusRadius", "Radius", {
    min: 18,
    max: 72,
    step: 1,
    defaultValue: 42,
    format: (n) => `${Math.round(n)}%`,
  }),
  toggle("edgeBlur", "Edge blur", true),
  toggle("zoomOnHover", "Hover", true),
  toggle("zoomOnClick", "Click", true),
];
