import type { CustomizeControl } from "../../../customize";
import { select, slider, text } from "../../controls";
import { fmt2, fmtPct, fmtPx, fmtSec1 } from "../../format";

export const customize: CustomizeControl[] = [
  text(
    "media",
    "Image URL",
    "/images/piano-girl.webp",
    "https://example.com/image.webp",
  ),
  select(
    "tone",
    "Tone",
    [
      { value: "ember", label: "Ember" },
      { value: "aqua", label: "Aqua" },
      { value: "violet", label: "Violet" },
      { value: "mono", label: "Mono" },
    ],
    "ember",
  ),
  slider("energy", "Energy", {
    min: 0,
    max: 1.5,
    step: 0.05,
    defaultValue: 1,
    format: fmt2,
  }),
  slider("restZoom", "Rest zoom", {
    min: 0,
    max: 0.16,
    step: 0.01,
    defaultValue: 0.08,
    format: fmtPct,
  }),
  slider("hoverZoom", "Zoom", {
    min: 0,
    max: 0.4,
    step: 0.01,
    defaultValue: 0.24,
    format: fmtPct,
  }),
  slider("spectrum", "Spectrum", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.7,
    format: fmt2,
  }),
  slider("displace", "Displace", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.85,
    format: fmt2,
  }),
  slider("gloss", "Gloss", {
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.45,
    format: fmt2,
  }),
  slider("tiltDepth", "Tilt", {
    min: 0,
    max: 18,
    step: 1,
    defaultValue: 10,
    format: fmt2,
  }),
  slider("floatRange", "Float", {
    min: 0,
    max: 24,
    step: 1,
    defaultValue: 10,
    format: fmtPx,
  }),
  slider("hoverDuration", "Hover time", {
    min: 0.2,
    max: 4,
    step: 0.1,
    defaultValue: 1.8,
    format: fmtSec1,
  }),
  slider("motionDuration", "Motion time", {
    min: 0.12,
    max: 1.2,
    step: 0.03,
    defaultValue: 0.45,
    format: fmtSec1,
  }),
];
