import {
  FlipButton,
  type FlipButtonDirection,
  type FlipButtonPalette,
} from "@/components/lazy-ui/flip-button";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const front = (values.front ?? "Deploy") as string;
  const reveal = (values.reveal ?? "Ship it") as string;
  const from = (values.from ?? "top") as FlipButtonDirection;
  const palette = (values.palette ?? "silver") as FlipButtonPalette;
  const tapScale = (values.tapScale ?? 0.96) as number;

  return (
    <div className="flex min-h-[420px] w-full items-center justify-center bg-neutral-950 p-6">
      <FlipButton
        front={front}
        reveal={reveal}
        from={from}
        palette={palette}
        tapScale={tapScale}
        className="h-11 min-w-40"
      />
    </div>
  );
}
