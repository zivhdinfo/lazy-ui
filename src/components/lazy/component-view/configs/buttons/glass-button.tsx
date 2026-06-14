import { GlassButton } from "@/components/lazy-ui/glass-button";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt3 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// A layered mesh gradient — several radial color pools over a diagonal base.
// The glass refracts whatever is painted behind it, so the busier and more
// colorful the field, the more obvious the liquid distortion through the pill.
const BG_MESH = [
  "radial-gradient(at 18% 22%, #ff6ec7 0%, transparent 55%)",
  "radial-gradient(at 82% 14%, #36d1dc 0%, transparent 50%)",
  "radial-gradient(at 72% 82%, #ffd166 0%, transparent 52%)",
  "radial-gradient(at 26% 78%, #7b5cff 0%, transparent 55%)",
  "radial-gradient(at 50% 50%, #ff8a5c 0%, transparent 60%)",
  "linear-gradient(135deg, #f7b2ff 0%, #93a5ff 100%)",
].join(", ");
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/glass-button"),
  export: "GlassButton",
  stageMinHeight: 460,
  render: (v) => {
    const label = (v.label ?? "Hover me") as string;
    const size = (v.size ?? "md") as "sm" | "md" | "lg";
    const tint = (v.tint ?? "neutral") as "neutral" | "cool" | "warm";
    const roll = (v.roll ?? true) as boolean;
    const distortion = (v.distortion ?? 14) as number;
    const frequency = (v.frequency ?? 0.009) as number;
    return (
      <div className="flex w-full">
        <div
          className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl"
          style={{ background: BG_MESH }}
        >
          <div className="relative z-10">
            <GlassButton
              size={size}
              tint={tint}
              roll={roll}
              distortion={distortion}
              frequency={frequency}
            >
              {label}
            </GlassButton>
          </div>
        </div>
      </div>
    );
  },
  controls: [
    select(
      "label",
      "Label",
      [
        { value: "Hover me", label: "Hover me" },
        { value: "Get started", label: "Get started" },
        { value: "Download file", label: "Download file" },
        { value: "Sign in", label: "Sign in" },
      ],
      "Hover me",
    ),
    select(
      "size",
      "Size",
      [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      "md",
    ),
    select(
      "tint",
      "Tint",
      [
        { value: "neutral", label: "Neutral" },
        { value: "cool", label: "Cool" },
        { value: "warm", label: "Warm" },
      ],
      "neutral",
    ),
    slider("distortion", "Distortion", {
      min: 0,
      max: 30,
      step: 0.5,
      defaultValue: 14,
      format: (n: number) => `${n.toFixed(1)}px`,
    }),
    slider("frequency", "Frequency", {
      min: 0.004,
      max: 0.04,
      step: 0.001,
      defaultValue: 0.009,
      format: fmt3,
    }),
    toggle("roll", "Text roll", true),
  ],
};
