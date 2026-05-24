import {
  ShinyText,
  type ShinyTextVariant,
} from "@/components/lazy-ui/text-animate/shiny-text";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl px-6 py-5">
      <ShinyText
        duration={(values.duration ?? 5) as number}
        intensity={(values.intensity ?? 0.32) as number}
        variant={(values.variant ?? "beam") as ShinyTextVariant}
        disabled={(values.disabled ?? false) as boolean}
        className="text-5xl font-semibold text-neutral-100"
      >
        Shiny Text
      </ShinyText>
    </div>
  );
}
