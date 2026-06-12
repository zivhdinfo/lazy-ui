import {
  AnimateTooltip,
  AnimateTooltipGroup,
} from "@/components/lazy-ui/animate-tooltip";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import { fmtMs, fmtPx } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

type Side = "top" | "right" | "bottom" | "left" | "auto";

// Theme-aware preview surface with theme-aware trigger buttons.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/animate-tooltip"),
  export: "AnimateTooltip",
  stageMinHeight: 460,
  render: (v) => {
    const followRaw = (v.followCursor ?? "off") as string;
    const followCursor =
      followRaw === "both"
        ? true
        : followRaw === "x" || followRaw === "y"
          ? (followRaw as "x" | "y")
          : false;
    const side = (v.side ?? "top") as Side;
    const sideOffset = (v.sideOffset ?? 6) as number;
    const delayDuration = (v.delayDuration ?? 150) as number;
    const arrow = (v.arrow ?? false) as boolean;
    const sharedProps = {
      side,
      sideOffset,
      delayDuration,
      followCursor,
      arrow,
    };
    const slideBetween = (v.slideBetween ?? true) as boolean;
    const topRow: Array<{
      label: string;
      content: string;
      variant: "solid" | "outline";
    }> = [
      {
        label: "Hover me",
        content: "Hello from the tooltip!",
        variant: "solid",
      },
      {
        label: "Drag along",
        content: "Watch me drift with the cursor.",
        variant: "outline",
      },
      {
        label: "And me",
        content: "Each trigger has its own spring.",
        variant: "outline",
      },
    ];
    const bottomTrigger = {
      label: "Slide down here",
      content: "Moved between rows — vertical slide too.",
    };
    const variantClass = {
      solid:
        "rounded-md bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90",
      outline:
        "rounded-md border border-[var(--border-2)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--text-3)] hover:bg-[var(--panel-2)]",
      button:
        "rounded-md bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90",
    } as const;
    return (
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] px-8 py-10">
          <AnimateTooltipGroup
            openDelay={delayDuration}
            closeDelay={300}
            slideBetween={slideBetween}
          >
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {topRow.map((t) => (
                  <AnimateTooltip
                    key={t.label}
                    {...sharedProps}
                    content={t.content}
                  >
                    <button type="button" className={variantClass[t.variant]}>
                      {t.label}
                    </button>
                  </AnimateTooltip>
                ))}
              </div>
              <AnimateTooltip {...sharedProps} content={bottomTrigger.content}>
                <button type="button" className={variantClass.button}>
                  {bottomTrigger.label}
                </button>
              </AnimateTooltip>
            </div>
          </AnimateTooltipGroup>
        </div>
      </div>
    );
  },
  controls: [
    select(
      "side",
      "Side",
      [
        { value: "auto", label: "Auto (cursor)" },
        { value: "top", label: "Top" },
        { value: "right", label: "Right" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
      ],
      "top",
    ),
    slider("sideOffset", "Side Offset", {
      min: 0,
      max: 24,
      step: 1,
      defaultValue: 6,
      format: fmtPx,
    }),
    slider("delayDuration", "Delay (ms)", {
      min: 0,
      max: 1000,
      step: 50,
      defaultValue: 150,
      format: fmtMs,
    }),
    select(
      "followCursor",
      "Follow cursor",
      [
        { value: "off", label: "Off" },
        { value: "both", label: "Both axes" },
        { value: "x", label: "X only" },
        { value: "y", label: "Y only" },
      ],
      "off",
    ),
    toggle("arrow", "Arrow", false),
    toggle("slideBetween", "Slide between triggers", true),
  ],
};
