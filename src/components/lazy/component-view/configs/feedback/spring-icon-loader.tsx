"use client";

import { useMemo } from "react";

import { SpringIconLoader } from "@/components/lazy-ui/spring-icon-loader";
import { select, slider, text, toggle } from "@/components/lazy/component-detail/controls";
import { fmt2, fmtPx, fmtSec2 } from "@/components/lazy/component-detail/format";
import type { CustomizeValues } from "@/components/lazy/customize";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/spring-icon-loader"),
  export: "SpringIconLoader",
  stageMinHeight: 420,
  render: (v) => <SpringIconLoaderDemo values={v} />,
  controls: [
    text("image1", "Icon 1 URL", "/images/loading/1.png", "/images/loading/1.png"),
    text("image2", "Icon 2 URL", "/images/loading/2.png", "/images/loading/2.png"),
    text("image3", "Icon 3 URL", "/images/loading/3.png", "/images/loading/3.png"),
    toggle("autoPreview", "Loading", true),
    slider("size", "Size", {
      min: 32,
      max: 96,
      step: 1,
      defaultValue: 56,
      format: fmtPx,
    }),
    slider("bounceHeight", "Bounce", {
      min: 28,
      max: 120,
      step: 1,
      defaultValue: 68,
      format: fmtPx,
    }),
    slider("gravity", "Gravity", {
      min: 900,
      max: 2600,
      step: 50,
      defaultValue: 1550,
      format: (n) => `${Math.round(n)}`,
    }),
    select(
      "iconTransition",
      "Icon swap",
      [
        { value: "blur", label: "Blur fade" },
        { value: "fade", label: "Fade" },
        { value: "none", label: "None" },
      ],
      "blur",
    ),
    slider("squash", "Squash", {
      min: 0,
      max: 0.26,
      step: 0.01,
      defaultValue: 0.12,
      format: fmt2,
    }),
    slider("stretch", "Stretch", {
      min: 0,
      max: 0.18,
      step: 0.01,
      defaultValue: 0.1,
      format: fmt2,
    }),
    slider("tilt", "Tilt", {
      min: 0,
      max: 14,
      step: 1,
      defaultValue: 7,
      format: (n) => `${Math.round(n)}deg`,
    }),
    slider("impactHold", "Ground hold", {
      min: 0.03,
      max: 0.18,
      step: 0.01,
      defaultValue: 0.09,
      format: fmtSec2,
    }),
    text("shadowColor", "Shadow color", "#94a3b8", "#94a3b8"),
    slider("shadowOpacity", "Shadow opacity", {
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.46,
      format: fmt2,
    }),
  ],
};

function SpringIconLoaderDemo({ values }: { values: CustomizeValues }) {
  const image1 = (values.image1 ?? "/images/loading/1.png") as string;
  const image2 = (values.image2 ?? "/images/loading/2.png") as string;
  const image3 = (values.image3 ?? "/images/loading/3.png") as string;
  const autoPreview = (values.autoPreview ?? true) as boolean;
  const size = (values.size ?? 56) as number;
  const bounceHeight = (values.bounceHeight ?? 68) as number;
  const gravity = (values.gravity ?? 1550) as number;
  const squash = (values.squash ?? 0.12) as number;
  const stretch = (values.stretch ?? 0.1) as number;
  const tilt = (values.tilt ?? 7) as number;
  const impactHold = (values.impactHold ?? 0.09) as number;
  const shadowColor = (values.shadowColor ?? "#94a3b8") as string;
  const shadowOpacity = (values.shadowOpacity ?? 0.46) as number;
  const iconTransition = (values.iconTransition ?? "blur") as
    | "fade"
    | "blur"
    | "none";
  const icons = useMemo(
    () => [
      { src: image1, alt: "Loading icon 1" },
      { src: image2, alt: "Loading icon 2" },
      { src: image3, alt: "Loading icon 3" },
    ],
    [image1, image2, image3],
  );

  return (
    <div className="grid min-h-[360px] w-full place-items-center rounded-xl bg-[var(--preview-bg)] px-6 py-10">
      <SpringIconLoader
        icons={icons}
        loading={autoPreview}
        size={size}
        bounceHeight={bounceHeight}
        gravity={gravity}
        squash={squash}
        stretch={stretch}
        tilt={tilt}
        impactHold={impactHold}
        iconTransition={iconTransition}
        shadowColor={shadowColor}
        shadowOpacity={shadowOpacity}
        label="Loading"
      />
    </div>
  );
}
