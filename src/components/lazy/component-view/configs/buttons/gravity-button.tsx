import { GravityButton } from "@/components/lazy-ui/gravity-button";
import { slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtCount, fmtPct, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// JSX path: the component wraps an arbitrary control, so the preview has to
// supply a real button rather than map props onto a bare export.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/gravity-button"),
  export: "GravityButton",
  stageMinHeight: 440,
  render: (v) => {
    const strength = (v.strength ?? 0.4) as number;
    const radius = (v.radius ?? 24) as number;
    const depth = (v.depth ?? 0.3) as number;
    const stiffness = (v.stiffness ?? 170) as number;
    const damping = (v.damping ?? 18) as number;
    const field = (v.field ?? true) as boolean;

    return (
      <div className="flex min-h-[360px] w-full items-center justify-center gap-6 p-4">
        <GravityButton
          strength={strength}
          radius={radius}
          depth={depth}
          stiffness={stiffness}
          damping={damping}
          field={field}
        >
          <button
            type="button"
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.18)] transition-shadow duration-200 hover:shadow-[inset_0_0_24px_rgba(255,255,255,0.34)] dark:bg-white dark:text-neutral-900 dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.14)] dark:hover:shadow-[inset_0_0_24px_rgba(0,0,0,0.22)]"
          >
            Hover me
          </button>
        </GravityButton>

        <GravityButton
          strength={strength}
          radius={radius}
          depth={depth}
          stiffness={stiffness}
          damping={damping}
          field={field}
        >
          <button
            type="button"
            aria-label="Star repository"
            className="grid size-11 place-items-center rounded-full border border-black/10 bg-neutral-100 text-neutral-700 transition-colors duration-200 hover:bg-neutral-200/70 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/70"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
            </svg>
          </button>
        </GravityButton>
      </div>
    );
  },
  controls: [
    slider("strength", "Strength", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.4,
      format: fmtPct,
    }),
    slider("radius", "Radius", {
      min: 4,
      max: 64,
      step: 1,
      defaultValue: 24,
      format: fmtPx,
    }),
    slider("depth", "Parallax", {
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.3,
      format: fmtPct,
    }),
    slider("stiffness", "Stiffness", {
      min: 60,
      max: 400,
      step: 10,
      defaultValue: 170,
      format: fmtCount,
    }),
    slider("damping", "Damping", {
      min: 6,
      max: 40,
      step: 1,
      defaultValue: 18,
      format: fmtCount,
    }),
    toggle("field", "Field outline", true),
  ],
};
