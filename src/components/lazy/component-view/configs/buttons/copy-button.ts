import type {
  CopyButtonVariant,
  IconAnimate,
} from "@/components/lazy-ui/copy-button";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtMs } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/copy-button"),
  export: "CopyButton",
  frame: "center",
  stageMinHeight: 360,
  staticProps: {
    content: "npm install lazy-ui",
    label: "Copy",
    className: "text-sm",
  },
  mapProps: (v) => ({
    text: v.text,
    variant: (v.variant ?? "outline") as CopyButtonVariant,
    textAs: (v.textAs ?? "inline") as "inline" | "tooltip",
    revealAnimate: v.revealAnimate ?? true,
    iconAnimate: (v.iconAnimate ?? "blur") as IconAnimate,
    delay: v.delay ?? 4000,
  }),
  controls: [
    select(
      "variant",
      "Variant",
      [
        { value: "outline", label: "Outline" },
        { value: "solid", label: "Solid" },
        { value: "ghost", label: "Ghost" },
      ],
      "outline",
    ),
    toggle("text", "Text", true),
    select(
      "textAs",
      "Text As",
      [
        { value: "inline", label: "Inline" },
        { value: "tooltip", label: "Tooltip" },
      ],
      "inline",
    ),
    toggle("revealAnimate", "Reveal Animate", true),
    select(
      "iconAnimate",
      "Icon Animate",
      [
        { value: "blur", label: "Blur" },
        { value: "draw", label: "Draw" },
        { value: "reveal", label: "Reveal" },
      ],
      "blur",
    ),
    slider("delay", "Delay (ms)", {
      min: 500,
      max: 10000,
      step: 100,
      defaultValue: 4000,
      format: fmtMs,
    }),
  ],
};
