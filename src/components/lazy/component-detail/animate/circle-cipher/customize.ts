import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmt1, fmtPct, fmtPx } from "../../format";

export const customize: CustomizeControl[] = [
  slider("size", "Cell size (px)", {
    min: 8,
    max: 64,
    step: 1,
    defaultValue: 12,
    format: fmtPx,
  }),
  slider("spread", "Spread (px)", {
    min: 20,
    max: 240,
    step: 1,
    defaultValue: 142,
    format: fmtPx,
  }),
  slider("persistence", "Persistence", {
    min: 0.2,
    max: 6,
    step: 0.1,
    defaultValue: 1.8,
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
      { value: "#de7343", label: "Orange" },
      { value: "#67e8f9", label: "Cyan" },
      { value: "#f0abfc", label: "Magenta" },
      { value: "#ffffff", label: "White" },
    ],
    "#d4d4d4",
  ),
  select(
    "characters",
    "Charset",
    [
      { value: "0123456789ABCDEF", label: "Hex" },
      { value: "✶✤↣⌧✷*.;:", label: "Glyph" },
      { value: "01", label: "Binary" },
      { value: ".:-=+*#%@", label: "Density" },
      { value: "⌧✶✷✤☉ϟ", label: "Stars" },
    ],
    "0123456789ABCDEF",
  ),
  toggle("enableFade", "Fade trail", true),
];
