import { SpinningText } from "@/components/lazy-ui/text-animate/spinning-text";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const reverse = (values.reverse ?? false) as boolean;
  const radius = (values.radius ?? 5) as number;
  const duration = (values.duration ?? 14) as number;

  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl px-6 py-6">
      <SpinningText
        duration={duration}
        radius={radius}
        reverse={reverse}
        center={<span className="text-2xl text-neutral-100">★</span>}
        className="text-[12px] tracking-[0.18em] text-neutral-200"
      >
        BUILD LAZILY • BUILD LAZILY •
      </SpinningText>
    </div>
  );
}
