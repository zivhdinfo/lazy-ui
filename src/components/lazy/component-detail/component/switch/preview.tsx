import { Switch } from "@/components/lazy-ui/switch";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const defaultChecked = (values.defaultChecked ?? false) as boolean;
  const sizeVal = (values.size ?? "md") as "sm" | "md" | "lg";
  const animation = (values.animation ?? "spring") as
    | "spring"
    | "wobble"
    | "smooth"
    | "stretch";
  const disableDrag = (values.disableDrag ?? false) as boolean;
  const flick = (values.flickVelocity ?? 0.35) as number;
  const disabled = (values.disabled ?? false) as boolean;
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 rounded-xl px-6 py-5">
      <Switch
        key={`${sizeVal}-${defaultChecked}-${disableDrag}-${disabled}`}
        id="switch-preview"
        defaultChecked={defaultChecked}
        size={sizeVal}
        animation={animation}
        disableDrag={disableDrag}
        flickVelocity={flick}
        disabled={disabled}
      />
      <label
        htmlFor="switch-preview"
        className="text-sm text-neutral-200 select-none"
      >
        Airplane mode
      </label>
    </div>
  );
}
