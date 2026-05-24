import {
  TextFlip,
  type TextFlipDirection,
  type TextFlipStaggerFrom,
  type TextFlipTrigger,
} from "@/components/lazy-ui/text-animate/text-flip";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const trigger = (values.trigger ?? "hover") as TextFlipTrigger;
  const direction = (values.direction ?? "right") as TextFlipDirection;
  const staggerFrom = (values.staggerFrom ?? "first") as TextFlipStaggerFrom;
  const stagger = (values.stagger ?? 0.04) as number;
  const duration = (values.duration ?? 0.55) as number;
  const perspective = (values.perspective ?? 1000) as number;
  // Tuple → key so any prop change remounts the demo and replays mount/view triggers.
  const replayKey = `${trigger}|${direction}|${staggerFrom}|${stagger}|${duration}|${perspective}`;
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl px-6 py-5">
      <TextFlip
        key={replayKey}
        text="Hover to flip."
        trigger={trigger}
        direction={direction}
        staggerFrom={staggerFrom}
        stagger={stagger}
        duration={duration}
        perspective={perspective}
        className="cursor-default text-5xl font-light text-neutral-100"
      />
    </div>
  );
}
