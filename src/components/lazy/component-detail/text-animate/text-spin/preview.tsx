import { TextSpin } from "@/components/lazy-ui/text-animate/text-spin";

import { readLetterAnim, replayKeyFrom } from "../../controls";
import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const p = readLetterAnim(values, {
    wordStagger: 0.14,
    letterStagger: 0.04,
    entryDuration: 0.8,
    exitDuration: 0.6,
  });
  const key = replayKeyFrom([
    p.wordStagger,
    p.letterStagger,
    p.entryDuration,
    p.exitDuration,
  ]);
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl px-6 py-5">
      <TextSpin
        key={key}
        text="Flip into view."
        {...p}
        className="text-5xl font-light text-[var(--text)]"
      />
    </div>
  );
}
