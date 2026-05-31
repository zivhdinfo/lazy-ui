import type { CustomizeControl } from "../../../customize";
import { select, slider, text, toggle } from "../../controls";
import { fmt2, fmtPx, fmtSec2 } from "../../format";

export const customize: CustomizeControl[] = [
  text(
    "image1",
    "Icon 1 URL",
    "/images/loading/1.png",
    "/images/loading/1.png",
  ),
  text(
    "image2",
    "Icon 2 URL",
    "/images/loading/2.png",
    "/images/loading/2.png",
  ),
  text(
    "image3",
    "Icon 3 URL",
    "/images/loading/3.png",
    "/images/loading/3.png",
  ),
  toggle("autoPreview", "Loading", true),
  slider("size", "Size", {
    min: 32,
    max: 96,
    step: 1,
    defaultValue: 56,
    format: fmtPx,
  }),
  slider("bounceHeight", "Bounce", {
    min: 28,
    max: 120,
    step: 1,
    defaultValue: 68,
    format: fmtPx,
  }),
  slider("gravity", "Gravity", {
    min: 900,
    max: 2600,
    step: 50,
    defaultValue: 1550,
    format: (n) => `${Math.round(n)}`,
  }),
  select(
    "iconTransition",
    "Icon swap",
    [
      { value: "blur", label: "Blur fade" },
      { value: "fade", label: "Fade" },
      { value: "none", label: "None" },
    ],
    "blur",
  ),
  slider("squash", "Squash", {
    min: 0,
    max: 0.26,
    step: 0.01,
    defaultValue: 0.12,
    format: fmt2,
  }),
  slider("stretch", "Stretch", {
    min: 0,
    max: 0.18,
    step: 0.01,
    defaultValue: 0.1,
    format: fmt2,
  }),
  slider("tilt", "Tilt", {
    min: 0,
    max: 14,
    step: 1,
    defaultValue: 7,
    format: (n) => `${Math.round(n)}deg`,
  }),
  slider("impactHold", "Ground hold", {
    min: 0.03,
    max: 0.18,
    step: 0.01,
    defaultValue: 0.09,
    format: fmtSec2,
  }),
  text("shadowColor", "Shadow color", "#94a3b8", "#94a3b8"),
  slider("shadowOpacity", "Shadow opacity", {
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.46,
    format: fmt2,
  }),
];
