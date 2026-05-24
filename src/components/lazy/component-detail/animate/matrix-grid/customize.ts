import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtCount, fmtPct, fmtPx, fmtSec1, fmtX } from "../../format";

const colorOptions = [
  { value: "#d4d4d4", label: "Silver" },
  { value: "#ffffff", label: "White" },
  { value: "#a3a3a3", label: "Mid silver" },
  { value: "#525252", label: "Dim" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#34d399", label: "Mint" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#fb923c", label: "Orange" },
];

const angleFmt = (n: number) => `${Math.round(n)}°`;

export const customize: CustomizeControl[] = [
  select(
    "trigger",
    "Trigger",
    [
      { value: "instant", label: "Instant" },
      { value: "mount", label: "Mount" },
      { value: "hover", label: "Hover" },
      { value: "click", label: "Click" },
    ],
    "instant",
  ),
  select(
    "animateName",
    "Animate",
    [
      { value: "none", label: "None" },
      { value: "ripple", label: "Ripple" },
      { value: "diagonal", label: "Diagonal" },
      { value: "sparkle", label: "Sparkle" },
    ],
    "ripple",
  ),
  select("color1", "Color 1", colorOptions, "#d4d4d4"),
  select("color2", "Color 2", colorOptions, "#ffffff"),
  slider("revealAngle", "Reveal angle", {
    min: 0,
    max: 360,
    step: 15,
    defaultValue: 0,
    format: angleFmt,
  }),
  slider("coverage", "Coverage", {
    min: 0.1,
    max: 1,
    step: 0.05,
    defaultValue: 1,
    format: fmtPct,
  }),
  slider("dotSize", "Dot size", {
    min: 1,
    max: 8,
    step: 1,
    defaultValue: 3,
    format: fmtPx,
  }),
  slider("gap", "Gap", {
    min: 1,
    max: 12,
    step: 1,
    defaultValue: 4,
    format: fmtPx,
  }),
  slider("speed", "Speed", {
    min: 0.2,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    format: fmtX,
  }),
  slider("animateDuration", "Animate cycle", {
    min: 1,
    max: 8,
    step: 0.5,
    defaultValue: 3,
    format: fmtSec1,
  }),
  slider("animateIntensity", "Animate intensity", {
    min: 0,
    max: 24,
    step: 1,
    defaultValue: 10,
    format: fmtPx,
  }),
  slider("fps", "FPS cap", {
    min: 24,
    max: 60,
    step: 6,
    defaultValue: 60,
    format: fmtCount,
  }),
  toggle("flicker", "Flicker", false),
  toggle("animateLoop", "Loop animate", true),
];
