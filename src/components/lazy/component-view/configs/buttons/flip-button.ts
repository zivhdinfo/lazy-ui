import type {
  FlipButtonDirection,
  FlipButtonPalette,
} from "@/components/lazy-ui/flip-button";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmt2 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Declarative path: no JSX. Control values map straight to props, the button
// is centered on the stage, and Props/Usage come from component-content.ts.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/flip-button"),
  export: "FlipButton",
  frame: "center",
  stageMinHeight: 440,
  staticProps: { className: "h-11 min-w-40" },
  mapProps: (v) => ({
    front: v.front,
    reveal: v.reveal,
    from: v.from as FlipButtonDirection,
    palette: v.palette as FlipButtonPalette,
    tapScale: v.tapScale,
  }),
  controls: [
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
  ],
};
