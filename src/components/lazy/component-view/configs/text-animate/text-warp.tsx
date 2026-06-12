import { TextWarp } from "@/components/lazy-ui/text-animate/text-warp";
import {
  readLetterAnim,
  replayKeyFrom,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import { fmtSec1, fmtSec2 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/text-animate/text-warp"),
  export: "TextWarp",
  stageMinHeight: 340,
  render: (v) => {
    const p = readLetterAnim(v, {
      wordStagger: 0.2,
      letterStagger: 0.04,
      entryDuration: 1.2,
      exitDuration: 1.6,
    });
    const key = replayKeyFrom([
      p.wordStagger,
      p.letterStagger,
      p.entryDuration,
      p.exitDuration,
    ]);
    return (
      <div className="flex min-h-40 items-center justify-center px-6 py-5">
        <TextWarp
          key={key}
          text="Build lazily."
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
      max: 0.6,
      step: 0.02,
      defaultValue: 0.2,
      format: fmtSec2,
    }),
    slider("letterStagger", "Letter stagger (s)", {
      min: 0,
      max: 0.2,
      step: 0.01,
      defaultValue: 0.04,
      format: fmtSec2,
    }),
    slider("entryDuration", "Entry duration (s)", {
      min: 0.3,
      max: 3,
      step: 0.1,
      defaultValue: 1.2,
      format: fmtSec1,
    }),
    slider("exitDuration", "Exit duration (s)", {
      min: 0.3,
      max: 3,
      step: 0.1,
      defaultValue: 1.6,
      format: fmtSec1,
    }),
  ],
};
