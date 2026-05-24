import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt1, fmtCount, fmtPct, fmtPx, fmtX } from "../../format";

export const customize: CustomizeControl[] = [
  slider("columns", "Columns", {
    min: 1,
    max: 12,
    step: 1,
    defaultValue: 3,
    format: fmtCount,
  }),
  slider("bandWidth", "Band width", {
    min: 0.1,
    max: 1,
    step: 0.05,
    defaultValue: 0.6,
    format: fmtPct,
  }),
  slider("size", "Cell size (px)", {
    min: 8,
    max: 40,
    step: 1,
    defaultValue: 16,
    format: fmtPx,
  }),
  slider("speed", "Speed", {
    min: 0,
    max: 2.5,
    step: 0.05,
    defaultValue: 0.8,
    format: fmtX,
  }),
  slider("noisePower", "Crest power", {
    min: 0.5,
    max: 5,
    step: 0.1,
    defaultValue: 2,
    format: fmt1,
  }),
  slider("glyphChurn", "Glyph churn", {
    min: 0,
    max: 4,
    step: 0.1,
    defaultValue: 0.6,
    format: fmt1,
  }),
  slider("opacity", "Opacity", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 1,
    format: fmtPct,
  }),
  select(
    "color",
    "Color",
    [
      { value: "#d4d4d4", label: "Silver" },
      { value: "#00ff00", label: "Matrix" },
      { value: "#67e8f9", label: "Cyan" },
      { value: "#f0abfc", label: "Magenta" },
      { value: "#de7343", label: "Ember" },
      { value: "#ffffff", label: "White" },
    ],
    "#d4d4d4",
  ),
  select(
    "characters",
    "Charset",
    [
      { value: "0123456789ABCDEF", label: "Hex" },
      { value: "01", label: "Binary" },
      { value: "✶✤↣⌧✷*.;:", label: "Glyph" },
      { value: ".:-=+*#%@", label: "Density" },
      { value: "⌧✶✷✤☉ϟ", label: "Stars" },
    ],
    "0123456789ABCDEF",
  ),
  toggle("invertColumns", "Invert columns", true),
];
