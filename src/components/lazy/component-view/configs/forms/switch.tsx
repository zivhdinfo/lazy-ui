import { Switch } from "@/components/lazy-ui/switch";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Theme-aware preview surface; the switch now follows the theme (ink track on
// light, white track on dark).
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/switch"),
  export: "Switch",
  stageMinHeight: 320,
  render: (v) => {
    const defaultChecked = (v.defaultChecked ?? false) as boolean;
    const size = (v.size ?? "md") as "sm" | "md" | "lg";
    const animation = (v.animation ?? "spring") as
      | "spring"
      | "wobble"
      | "smooth"
      | "stretch";
    const disableDrag = (v.disableDrag ?? false) as boolean;
    const flick = (v.flickVelocity ?? 0.35) as number;
    const disabled = (v.disabled ?? false) as boolean;
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] px-8 py-6">
          <Switch
            key={`${size}-${defaultChecked}-${disableDrag}-${disabled}`}
            id="cv-switch"
            defaultChecked={defaultChecked}
            size={size}
            animation={animation}
            disableDrag={disableDrag}
            flickVelocity={flick}
            disabled={disabled}
          />
          <label
            htmlFor="cv-switch"
            className="text-sm text-[var(--text)] select-none"
          >
            Airplane mode
          </label>
        </div>
      </div>
    );
  },
  controls: [
    toggle("defaultChecked", "Default checked", false),
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
      "animation",
      "Animation",
      [
        { value: "spring", label: "Spring" },
        { value: "wobble", label: "Wobble" },
        { value: "smooth", label: "Smooth" },
        { value: "stretch", label: "Stretch" },
      ],
      "spring",
    ),
    toggle("disableDrag", "Disable drag", false),
    slider("flickVelocity", "Flick velocity", {
      min: 0.05,
      max: 1,
      step: 0.05,
      defaultValue: 0.35,
      format: (n: number) => `${n.toFixed(2)} px/ms`,
    }),
    toggle("disabled", "Disabled", false),
  ],
};
