"use client";

import { useMemo, type ReactNode } from "react";

import { BorderGlow, type BorderGlowMode } from "@/components/lazy-ui/border-glow";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmt1, fmtCount, fmtPx } from "@/components/lazy/component-detail/format";
import type { CustomizeValues } from "@/components/lazy/customize";
import type { ComponentView } from "@/components/lazy/component-view/types";

const PALETTES: Record<string, string[]> = {
  iris: ["#a78bfa", "#f0abfc", "#67e8f9"],
  aurora: ["#34d399", "#67e8f9", "#a78bfa"],
  sunset: ["#fb7185", "#f59e0b", "#f0abfc"],
  spectrum: ["#fb7185", "#f59e0b", "#34d399", "#67e8f9", "#a78bfa"],
  gold: ["#f59e0b", "#ffffff"],
  mono: ["#ffffff", "#d4d4d4", "#a3a3a3"],
};

const PALETTE_OPTIONS = [
  { value: "iris", label: "Iris" },
  { value: "aurora", label: "Aurora" },
  { value: "sunset", label: "Sunset" },
  { value: "spectrum", label: "Spectrum" },
  { value: "gold", label: "Gold" },
  { value: "mono", label: "Mono" },
];

const DEFAULT_PALETTE = "iris";

const degFmt = (n: number) => `${Math.round(n)}°`;

type Tile = {
  span: string;
  eyebrow: string;
  title: string;
  body?: string;
  extra?: ReactNode;
};

// Mirrors the home "Why" bento — anchor claim, two companions, three capsules.
const TILES: Tile[] = [
  {
    span: "col-span-6 sm:col-span-3 sm:row-span-2",
    eyebrow: "Source",
    title: "Own every line.",
    body: "Each component installs as a shadcn registry file — the source lands in your repo, fully editable, with no package wrapping it.",
    extra: (
      <div className="mt-auto flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white/75">
        <span className="text-white/40">$</span>
        npx shadcn add <span className="text-white">button</span>
      </div>
    ),
  },
  {
    span: "col-span-6 sm:col-span-3",
    eyebrow: "Registry",
    title: "Install via URL.",
    body: "Not on npm. Point npx shadcn add at a registry URL and the files land where they belong.",
  },
  {
    span: "col-span-6 sm:col-span-3",
    eyebrow: "Motion",
    title: "Animated by default.",
    body: "Motion-forward out of the box, and reduced-motion aware so it never fights the user.",
    extra: (
      <div className="mt-auto flex items-end gap-1.5">
        {[10, 18, 26, 16, 22].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-white/30"
            style={{ height: h, animation: `pulse 2.4s ${i * 0.18}s ease-in-out infinite` }}
          />
        ))}
      </div>
    ),
  },
  {
    span: "col-span-3 sm:col-span-2",
    eyebrow: "Components",
    title: "40+",
  },
  {
    span: "col-span-3 sm:col-span-2",
    eyebrow: "Quality",
    title: "Typed & accessible.",
  },
  {
    span: "col-span-6 sm:col-span-2",
    eyebrow: "Open license",
    title: "MIT",
  },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/border-glow"),
  export: "BorderGlow",
  stageMinHeight: 680,
  record: true,
  render: (v) => <BorderGlowDemo values={v} />,
  controls: [
    select(
      "mode",
      "Mode",
      [
        { value: "auto", label: "Auto sweep" },
        { value: "cursor", label: "Cursor proximity" },
        { value: "hover", label: "Hover only" },
      ],
      "cursor",
    ),
    select("palette", "Palette", PALETTE_OPTIONS, DEFAULT_PALETTE),
    slider("thickness", "Thickness", {
      min: 1,
      max: 6,
      step: 0.5,
      defaultValue: 2,
      format: fmtPx,
    }),
    slider("radius", "Radius", {
      min: 0,
      max: 40,
      step: 1,
      defaultValue: 20,
      format: fmtPx,
    }),
    slider("coneSpread", "Arc width", {
      min: 16,
      max: 140,
      step: 2,
      defaultValue: 20,
      format: degFmt,
    }),
    slider("glowSize", "Glow", {
      min: 0,
      max: 60,
      step: 2,
      defaultValue: 22,
      format: fmtPx,
    }),
    slider("intensity", "Intensity", {
      min: 0.2,
      max: 1.5,
      step: 0.1,
      defaultValue: 1,
      format: fmt1,
    }),
    slider("speed", "Sweep speed", {
      min: 0.2,
      max: 3,
      step: 0.1,
      defaultValue: 1,
      format: fmt1,
    }),
    slider("cursorRadius", "Cursor radius", {
      min: 80,
      max: 400,
      step: 10,
      defaultValue: 100,
      format: fmtPx,
    }),
    slider("sparkleCount", "Sparkles", {
      min: 0,
      max: 16,
      step: 1,
      defaultValue: 15,
      format: fmtCount,
    }),
    toggle("bling", "Bling", true),
  ],
};

function BorderGlowDemo({ values }: { values: CustomizeValues }) {
  const mode = (values.mode ?? "cursor") as BorderGlowMode;
  const palette = (values.palette ?? DEFAULT_PALETTE) as string;
  const thickness = (values.thickness ?? 2) as number;
  const radius = (values.radius ?? 20) as number;
  const coneSpread = (values.coneSpread ?? 20) as number;
  const glowSize = (values.glowSize ?? 22) as number;
  const intensity = (values.intensity ?? 1) as number;
  const speed = (values.speed ?? 1) as number;
  const cursorRadius = (values.cursorRadius ?? 100) as number;
  const sparkleCount = (values.sparkleCount ?? 15) as number;
  const bling = (values.bling ?? true) as boolean;

  const colors = useMemo(
    () => PALETTES[palette] ?? PALETTES[DEFAULT_PALETTE],
    [palette],
  );

  return (
    <div className="flex min-h-[640px] w-full items-center justify-center rounded-xl bg-[var(--preview-bg)] p-6">
      <div className="w-full max-w-3xl">
        <p className="mb-4 text-center text-xs text-[var(--text-3)]">
          {mode === "cursor"
            ? "Move the cursor around the grid — the arc points toward it across every card at once. Hover a card for bling."
            : mode === "hover"
              ? "Hover a card — the arc points at your cursor, with bling at the edge."
              : "Each card sweeps a soft gradient arc around its border on its own."}
        </p>
        <div className="grid grid-cols-6 auto-rows-[minmax(132px,auto)] gap-3">
          {TILES.map((tile, i) => (
            <BorderGlow
              key={i}
              mode={mode}
              colors={colors}
              thickness={thickness}
              radius={radius}
              coneSpread={coneSpread}
              glowSize={glowSize}
              intensity={intensity}
              speed={speed}
              cursorRadius={cursorRadius}
              sparkleCount={sparkleCount}
              bling={bling}
              seed={i + 1}
              className={tile.span}
            >
              <div className="flex h-full flex-col gap-2 p-5">
                <span className="text-[10px] font-medium tracking-[0.18em] text-white/45 uppercase">
                  {tile.eyebrow}
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {tile.title}
                </h3>
                {tile.body && (
                  <p className="text-xs leading-relaxed text-white/55">{tile.body}</p>
                )}
                {tile.extra}
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </div>
  );
}
