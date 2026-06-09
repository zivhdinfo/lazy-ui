"use client";

import { useEffect, useState } from "react";

import {
  Counter,
  type CounterEffect,
  type CounterEasing,
} from "@/components/lazy-ui/counter";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const [preview, setPreview] = useState({ key: 0, value: 0 });
  const target = (values.value ?? 12848) as number;
  const speed = (values.speed ?? 1000) as number;
  const effect = (values.effect ?? "3d") as CounterEffect;
  const easing = (values.easing ?? "ease-out") as CounterEasing;
  const decimals = (values.decimals ?? 0) as number;

  useEffect(() => {
    let resetFrame = 0;
    let playFrame = 0;

    resetFrame = requestAnimationFrame(() => {
      setPreview((current) => ({
        key: current.key + 1,
        value: 0,
      }));
      playFrame = requestAnimationFrame(() =>
        setPreview((current) => ({
          ...current,
          value: target,
        })),
      );
    });

    return () => {
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(playFrame);
    };
  }, [target, speed, effect, easing, decimals]);

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl px-6 py-5">
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
