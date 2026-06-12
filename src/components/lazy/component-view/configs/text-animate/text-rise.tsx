import { TextRise } from "@/components/lazy-ui/text-animate/text-rise";
import {
  readLetterAnim,
  replayKeyFrom,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import { fmtSec1, fmtSec2 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/text-rise"),
  export: "TextRise",
  stageMinHeight: 340,
  render: (v) => {
    const p = readLetterAnim(v, {
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
      <div className="flex min-h-40 items-center justify-center px-6 py-5">
        <TextRise
          key={key}
          text="Rise into place."
          {...p}
          className="text-5xl font-light text-[var(--text)]"
        />
      </div>
    );
  },
  controls: [
    toggle("trigger", "Trigger", true),
    slider("wordStagger", "Word stagger (s)", {
      min: 0,
      max: 0.4,
      step: 0.02,
      defaultValue: 0.12,
      format: fmtSec2,
    }),
    slider("letterStagger", "Letter stagger (s)", {
      min: 0,
      max: 0.15,
      step: 0.005,
      defaultValue: 0.035,
      format: (n) => `${n.toFixed(3)}s`,
    }),
    slider("entryDuration", "Entry duration (s)", {
      min: 0.2,
      max: 2,
      step: 0.1,
      defaultValue: 0.7,
      format: fmtSec1,
    }),
    slider("exitDuration", "Exit duration (s)", {
      min: 0.2,
      max: 2,
      step: 0.1,
      defaultValue: 0.5,
      format: fmtSec1,
    }),
  ],
};
