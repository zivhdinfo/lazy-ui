import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt1, fmtCount, fmtPx } from "../../format";
import { DEFAULT_PALETTE, PALETTE_OPTIONS } from "./palettes";

const degFmt = (n: number) => `${Math.round(n)}°`;

export const customize: CustomizeControl[] = [
  select(
    "mode",
    "Mode",
    [
      { value: "auto", label: "Auto sweep" },
      { value: "cursor", label: "Cursor proximity" },
      { value: "hover", label: "Hover only" },
    ],
    "cursor",
  ),
  select("palette", "Palette", PALETTE_OPTIONS, DEFAULT_PALETTE),
  slider("thickness", "Thickness", {
    min: 1,
    max: 6,
    step: 0.5,
    defaultValue: 2,
    format: fmtPx,
  }),
  slider("radius", "Radius", {
    min: 0,
    max: 40,
    step: 1,
    defaultValue: 20,
    format: fmtPx,
  }),
  slider("coneSpread", "Arc width", {
    min: 16,
    max: 140,
    step: 2,
    defaultValue: 20,
    format: degFmt,
  }),
  slider("glowSize", "Glow", {
    min: 0,
    max: 60,
    step: 2,
    defaultValue: 22,
    format: fmtPx,
  }),
  slider("intensity", "Intensity", {
    min: 0.2,
    max: 1.5,
    step: 0.1,
    defaultValue: 1,
    format: fmt1,
  }),
  slider("speed", "Sweep speed", {
    min: 0.2,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    format: fmt1,
  }),
  slider("cursorRadius", "Cursor radius", {
    min: 80,
    max: 400,
    step: 10,
    defaultValue: 100,
    format: fmtPx,
  }),
  slider("sparkleCount", "Sparkles", {
    min: 0,
    max: 16,
    step: 1,
    defaultValue: 15,
    format: fmtCount,
  }),
  toggle("bling", "Bling", true),
];
