import { Checkbox } from "@/components/lazy-ui/checkbox";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const state = (values.checked ?? "unchecked") as
    | "unchecked"
    | "checked"
    | "indeterminate";
  const defaultChecked =
    state === "indeterminate" ? "indeterminate" : state === "checked";
  const disabled = (values.disabled ?? false) as boolean;
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 rounded-xl px-6 py-5">
      <Checkbox
        key={state}
        id="checkbox-preview"
        defaultChecked={defaultChecked}
        disabled={disabled}
      />
      <label
        htmlFor="checkbox-preview"
        className="text-sm text-[var(--text)] select-none"
      >
        Accept terms and conditions
      </label>
    </div>
  );
}
