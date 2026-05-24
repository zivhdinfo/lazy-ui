import {
  TextScramble,
  type TextScrambleEasing,
  type TextScrambleTrigger,
} from "@/components/lazy-ui/text-animate/text-scramble";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const trigger = (values.trigger ?? "hover") as TextScrambleTrigger;
  const easing = (values.easing ?? "linear") as TextScrambleEasing;
  const duration = (values.duration ?? 800) as number;
  const tickMs = (values.tickMs ?? 30) as number;
  const charset = (values.charset ?? "X$@aHzo0y#?*01+") as string;
  // Tuple → replayKey so any prop change auto-replays the animation.
  const replayKey = `${trigger}|${easing}|${duration}|${tickMs}|${charset}`;

  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl px-6 py-5">
      <TextScramble
        text="Decode the signal."
        trigger={trigger}
        easing={easing}
        duration={duration}
        tickMs={tickMs}
        charset={charset}
        replayKey={replayKey}
        className="cursor-default text-3xl font-mono text-neutral-100"
      />
    </div>
  );
}
