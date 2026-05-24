import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";
import { fmtCount, fmtMs, fmtPx, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "animation",
    "Animation",
    [
      { value: "blur", label: "Blur" },
      { value: "scale", label: "Scale" },
      { value: "bounce", label: "Bounce" },
    ],
    "blur",
  ),
  select(
    "enterFrom",
    "Enter from",
    [
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ],
    "top",
  ),
  select(
    "hoverEffect",
    "Hover effect",
    [
      { value: "none", label: "None" },
      { value: "scale", label: "Scale" },
      { value: "lift", label: "Lift" },
    ],
    "lift",
  ),
  select(
    "clickEffect",
    "Click effect",
    [
      { value: "none", label: "None" },
      { value: "ripple", label: "Ripple" },
      { value: "press", label: "Press" },
    ],
    "ripple",
  ),
  slider("duration", "Duration", {
    min: 0.2,
    max: 1.4,
    step: 0.05,
    defaultValue: 0.65,
    format: fmtSec2,
  }),
  slider("autoInsertDelay", "Auto-insert delay", {
    min: 0,
    max: 6000,
    step: 100,
    defaultValue: 2200,
    format: fmtMs,
  }),
  slider("maxItems", "Max items", {
    min: 2,
    max: 10,
    step: 1,
    defaultValue: 5,
    format: fmtCount,
  }),
  slider("gap", "Gap", {
    min: 0,
    max: 32,
    step: 1,
    defaultValue: 12,
    format: fmtPx,
  }),
  slider("stackDepth", "Stack depth", {
    min: 2,
    max: 5,
    step: 1,
    defaultValue: 3,
    format: fmtCount,
  }),
  toggle("stack", "Stack mode", false),
  toggle("pauseOnHover", "Pause on hover", true),
  toggle("dismissOnSwipe", "Swipe to dismiss", true),
];
