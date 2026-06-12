"use client";

import { useState } from "react";

import { RevealAnimate } from "@/components/lazy-ui/reveal-animate";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmtMs } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/reveal-animate"),
  export: "RevealAnimate",
  frame: "center",
  stageMinHeight: 360,
  render: (v) => {
    const from = (v.from ?? "left") as "left" | "right";
    const duration = (v.duration ?? 450) as number;
    return <RevealAnimateDemo from={from} duration={duration} />;
  },
  controls: [
    select(
      "from",
      "From",
      [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ],
      "left",
    ),
    slider("duration", "Duration (ms)", {
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 450,
      format: fmtMs,
    }),
  ],
};

function RevealAnimateDemo({
  from,
  duration,
}: {
  from: "left" | "right";
  duration: number;
}) {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        className="rounded-lg border border-[var(--border-2)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors"
      >
        Toggle
      </button>
      <RevealAnimate trigger={shown} from={from} duration={duration}>
        <span className="text-3xl font-light text-[var(--text)]">
          Hello, world.
        </span>
      </RevealAnimate>
    </div>
  );
}
