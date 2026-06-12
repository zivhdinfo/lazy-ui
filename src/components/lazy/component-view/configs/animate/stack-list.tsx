"use client";

import { useEffect, useState } from "react";

import {
  StackList,
  type StackListAnimation,
  type StackListClickEffect,
  type StackListEnterFrom,
  type StackListHoverEffect,
  type StackListItem,
} from "@/components/lazy-ui/stack-list";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtCount, fmtMs, fmtPx, fmtSec2 } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Shared 1 Hz clock so every Row in the preview ticks together without each
// row spinning up its own interval.
function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatElapsed(secs: number): string {
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86_400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86_400)}d ago`;
}

interface RowProps {
  title: string;
  desc: string;
}

function Row({ title, desc }: RowProps) {
  const now = useNow();
  // Captured once when the Row mounts (lazy state init keeps it stable and
  // pure). New auto-inserted cards therefore always start at "just now" and age
  // forward, so the column is always sorted newest-on-top.
  const [createdAt] = useState(() => Date.now());
  const secs = Math.max(0, Math.floor((now - createdAt) / 1000));
  const meta = formatElapsed(secs);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-b from-neutral-900 to-neutral-500 shadow-[0_0_8px_rgba(0,0,0,0.18)] dark:from-white dark:to-neutral-400 dark:shadow-[0_0_8px_rgba(255,255,255,0.35)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[13.5px] font-medium text-black/90 dark:text-white/95">
            {title}
          </span>
          <span className="font-mono text-[10.5px] text-neutral-500 tabular-nums dark:text-neutral-400">
            {meta}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-neutral-600 dark:text-neutral-400">
          {desc}
        </p>
      </div>
    </div>
  );
}

const SEED: StackListItem[] = [
  {
    id: "deploy",
    content: <Row title="Deploy passed" desc="lazy-ui · main · #4821" />,
  },
  {
    id: "review",
    content: (
      <Row title="PR ready for review" desc="Refactor stack-list animation" />
    ),
  },
  {
    id: "report",
    content: <Row title="Daily report sent" desc="3 collaborators" />,
  },
  {
    id: "build",
    content: <Row title="Build cached" desc="Edge runtime · 312 ms" />,
  },
  {
    id: "release",
    content: <Row title="Release v0.4.2" desc="Tagged on main" />,
  },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/stack-list"),
  export: "StackList",
  stageMinHeight: 560,
  render: (v) => {
    const animation = (v.animation ?? "blur") as StackListAnimation;
    const enterFrom = (v.enterFrom ?? "top") as StackListEnterFrom;
    const hoverEffect = (v.hoverEffect ?? "lift") as StackListHoverEffect;
    const clickEffect = (v.clickEffect ?? "ripple") as StackListClickEffect;
    const duration = (v.duration ?? 0.65) as number;
    const autoInsertDelay = (v.autoInsertDelay ?? 2200) as number;
    const maxItems = (v.maxItems ?? 5) as number;
    const gap = (v.gap ?? 12) as number;
    const pauseOnHover = (v.pauseOnHover ?? true) as boolean;
    const dismissOnSwipe = (v.dismissOnSwipe ?? true) as boolean;
    const stack = (v.stack ?? false) as boolean;
    const stackDepth = (v.stackDepth ?? 3) as number;

    return (
      <div className="flex min-h-[520px] w-full items-center justify-center p-4">
        <StackList
          items={SEED}
          animation={animation}
          enterFrom={enterFrom}
          duration={duration}
          autoInsertDelay={autoInsertDelay}
          maxItems={maxItems}
          gap={gap}
          hoverEffect={hoverEffect}
          clickEffect={clickEffect}
          pauseOnHover={pauseOnHover}
          dismissOnSwipe={dismissOnSwipe}
          stack={stack}
          stackDepth={stackDepth}
          height="100%"
        />
      </div>
    );
  },
  controls: [
    select(
      "animation",
      "Animation",
      [
        { value: "blur", label: "Blur" },
        { value: "scale", label: "Scale" },
        { value: "bounce", label: "Bounce" },
      ],
      "blur",
    ),
    select(
      "enterFrom",
      "Enter from",
      [
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ],
      "top",
    ),
    select(
      "hoverEffect",
      "Hover effect",
      [
        { value: "none", label: "None" },
        { value: "scale", label: "Scale" },
        { value: "lift", label: "Lift" },
      ],
      "lift",
    ),
    select(
      "clickEffect",
      "Click effect",
      [
        { value: "none", label: "None" },
        { value: "ripple", label: "Ripple" },
        { value: "press", label: "Press" },
      ],
      "ripple",
    ),
    slider("duration", "Duration", {
      min: 0.2,
      max: 1.4,
      step: 0.05,
      defaultValue: 0.65,
      format: fmtSec2,
    }),
    slider("autoInsertDelay", "Auto-insert delay", {
      min: 0,
      max: 6000,
      step: 100,
      defaultValue: 2200,
      format: fmtMs,
    }),
    slider("maxItems", "Max items", {
      min: 2,
      max: 10,
      step: 1,
      defaultValue: 5,
      format: fmtCount,
    }),
    slider("gap", "Gap", {
      min: 0,
      max: 32,
      step: 1,
      defaultValue: 12,
      format: fmtPx,
    }),
    slider("stackDepth", "Stack depth", {
      min: 2,
      max: 5,
      step: 1,
      defaultValue: 3,
      format: fmtCount,
    }),
    toggle("stack", "Stack mode", false),
    toggle("pauseOnHover", "Pause on hover", true),
    toggle("dismissOnSwipe", "Swipe to dismiss", true),
  ],
};
