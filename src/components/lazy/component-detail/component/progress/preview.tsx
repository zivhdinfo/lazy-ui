import { Progress } from "@/components/lazy-ui/progress";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const value = (values.value ?? 60) as number;
  const indeterminate = (values.indeterminate ?? false) as boolean;
  const sizeVal = (values.size ?? "md") as "sm" | "md" | "lg";
  const animation = (values.animation ?? "spring") as
    | "spring"
    | "smooth"
    | "wobble";
  const effect = (values.effect ?? "glow") as
    | "none"
    | "stripes"
    | "glow"
    | "pulse";
  const glowPalette = (values.glowPalette ?? "default") as
    | "default"
    | "rainbow"
    | "warm"
    | "cool";
  const valuePosition = (values.valuePosition ?? "end") as
    | "hidden"
    | "end"
    | "above-leading"
    | "inside-leading"
    | "edge-leading";
  return (
    <div className="flex min-h-32 w-full items-center justify-center rounded-xl px-6 py-6">
      <Progress
        value={indeterminate ? null : value}
        size={sizeVal}
        animation={animation}
        effect={effect}
        glowPalette={glowPalette}
        valuePosition={valuePosition}
        className="max-w-sm"
      />
    </div>
  );
}
