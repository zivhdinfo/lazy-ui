import type { CustomizeControl } from "../../../customize";
import { slider, toggle } from "../../controls";
import { fmt2, fmtPx, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  slider("cursorSize", "Cursor size", {
    min: 60,
    max: 420,
    step: 10,
    defaultValue: 200,
    format: fmtPx,
  }),
  slider("mouseForce", "Mouse force", {
    min: 10,
    max: 120,
    step: 1,
    defaultValue: 60,
    format: (n) => `${Math.round(n)}`,
  }),
  slider("resolution", "Resolution", {
    min: 0.25,
    max: 1,
    step: 0.05,
    defaultValue: 0.5,
    format: fmtX,
  }),
  slider("viscous", "Viscosity", {
    min: 0,
    max: 80,
    step: 1,
    defaultValue: 42,
    format: (n) => `${Math.round(n)}`,
  }),
  slider("revealStrength", "Reveal strength", {
    min: 0.2,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("revealSoftness", "Reveal softness", {
    min: 0.1,
    max: 2,
    step: 0.05,
    defaultValue: 0.85,
    format: fmt2,
  }),
  slider("autoSpeed", "Auto speed", {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 0.5,
    format: (n) => `${n.toFixed(2)}`,
  }),
  toggle("autoDemo", "Auto demo", true),
];
