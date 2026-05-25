import type { CustomizeControl } from "../../../customize";
import { select, slider } from "../../controls";
import { fmt2 } from "../../format";

export const customize: CustomizeControl[] = [
  select(
    "front",
    "Front",
    [
      { value: "Deploy", label: "Deploy" },
      { value: "Open docs", label: "Open docs" },
      { value: "Save draft", label: "Save draft" },
      { value: "Start build", label: "Start build" },
    ],
    "Deploy",
  ),
  select(
    "reveal",
    "Reveal",
    [
      { value: "Ship it", label: "Ship it" },
      { value: "Read now", label: "Read now" },
      { value: "Saved", label: "Saved" },
      { value: "Running", label: "Running" },
    ],
    "Ship it",
  ),
  select(
    "from",
    "From",
    [
      { value: "top", label: "Top" },
      { value: "bottom", label: "Bottom" },
    ],
    "top",
  ),
  select(
    "palette",
    "Palette",
    [
      { value: "sky", label: "Sky" },
      { value: "silver", label: "Silver" },
      { value: "graphite", label: "Graphite" },
      { value: "mint", label: "Mint" },
      { value: "violet", label: "Violet" },
    ],
    "silver",
  ),
  slider("tapScale", "Tap scale", {
    min: 0.9,
    max: 1,
    step: 0.01,
    defaultValue: 0.96,
    format: fmt2,
  }),
];
