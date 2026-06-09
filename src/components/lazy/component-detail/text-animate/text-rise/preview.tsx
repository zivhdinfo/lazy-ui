import { TextRise } from "@/components/lazy-ui/text-animate/text-rise";

import { readLetterAnim, replayKeyFrom } from "../../controls";
import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const p = readLetterAnim(values, {
    wordStagger: 0.12,
    letterStagger: 0.035,
    entryDuration: 0.7,
    exitDuration: 0.5,
  });
  const key = replayKeyFrom([
    p.wordStagger,
    p.letterStagger,
    p.entryDuration,
    p.exitDuration,
  ]);
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl px-6 py-5">
      <TextRise
        key={key}
        text="Rise into place."
        {...p}
        className="text-5xl font-light text-[var(--text)]"
      />
    </div>
  );
}
