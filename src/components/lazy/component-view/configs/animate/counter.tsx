"use client";

import { useEffect, useState } from "react";

import {
  Counter,
  type CounterEasing,
  type CounterEffect,
} from "@/components/lazy-ui/counter";
import { select, slider } from "@/components/lazy/component-detail/controls";
import { fmtMs } from "@/components/lazy/component-detail/format";
import type { CustomizeValues } from "@/components/lazy/customize";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/counter"),
  export: "Counter",
  stageMinHeight: 340,
  render: (v) => <CounterDemo values={v} />,
  controls: [
    slider("value", "Value", {
      min: 0,
      max: 25000,
      step: 1,
      defaultValue: 12848,
      format: (n) => Math.round(n).toLocaleString("en-US"),
    }),
    slider("speed", "Speed", {
      min: 100,
      max: 2400,
      step: 50,
      defaultValue: 1000,
      format: fmtMs,
    }),
    select(
      "effect",
      "Effect",
      [
        { value: "simple", label: "Simple" },
        { value: "wheel", label: "Wheel" },
        { value: "smooth", label: "Smooth" },
        { value: "fade", label: "Fade" },
        { value: "3d", label: "3D" },
      ],
      "3d",
    ),
    select(
      "easing",
      "Easing",
      [
        { value: "linear", label: "Linear" },
        { value: "ease-out", label: "Ease out" },
        { value: "ease-in-out", label: "Ease in-out" },
      ],
      "ease-out",
    ),
    slider("decimals", "Decimals", {
      min: 0,
      max: 2,
      step: 1,
      defaultValue: 0,
      format: (n) => `${Math.round(n)}`,
    }),
  ],
};

function CounterDemo({ values }: { values: CustomizeValues }) {
  const [preview, setPreview] = useState({ key: 0, value: 0 });
  const target = (values.value ?? 12848) as number;
  const speed = (values.speed ?? 1000) as number;
  const effect = (values.effect ?? "3d") as CounterEffect;
  const easing = (values.easing ?? "ease-out") as CounterEasing;
  const decimals = (values.decimals ?? 0) as number;

  // Snap back to 0 then count up so every knob change replays the animation.
  useEffect(() => {
    let resetFrame = 0;
    let playFrame = 0;
    resetFrame = requestAnimationFrame(() => {
      setPreview((current) => ({ key: current.key + 1, value: 0 }));
      playFrame = requestAnimationFrame(() =>
        setPreview((current) => ({ ...current, value: target })),
      );
    });
    return () => {
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(playFrame);
    };
  }, [target, speed, effect, easing, decimals]);

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 py-5">
      <Counter
        key={preview.key}
        value={preview.value}
        speed={speed}
        effect={effect}
        easing={easing}
        decimals={decimals}
        separator=","
        className="text-5xl font-semibold tracking-normal text-[var(--text)]"
      />
      <span className="text-xs uppercase text-[var(--text-3)]">active users</span>
    </div>
  );
}
