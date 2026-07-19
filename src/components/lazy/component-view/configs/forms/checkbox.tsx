import { Checkbox } from "@/components/lazy-ui/checkbox";
import { select, toggle } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Theme-aware preview surface; the checkbox now follows the theme (ink fill on
// light, white fill on dark).
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/checkbox"),
  export: "Checkbox",
  stageMinHeight: 320,
  render: (v) => {
    const state = (v.checked ?? "unchecked") as
      | "unchecked"
      | "checked"
      | "indeterminate";
    const defaultChecked =
      state === "indeterminate" ? "indeterminate" : state === "checked";
    const disabled = (v.disabled ?? false) as boolean;
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] px-8 py-6">
          <Checkbox
            key={state}
            id="cv-checkbox"
            defaultChecked={defaultChecked}
            disabled={disabled}
          />
          <label
            htmlFor="cv-checkbox"
            className="text-sm text-[var(--text)] select-none"
          >
            Accept terms and conditions
          </label>
        </div>
      </div>
    );
  },
  controls: [
    select(
      "checked",
      "State",
      [
        { value: "unchecked", label: "Unchecked" },
        { value: "checked", label: "Checked" },
        { value: "indeterminate", label: "Indeterminate" },
      ],
      "unchecked",
    ),
    toggle("disabled", "Disabled", false),
  ],
};
