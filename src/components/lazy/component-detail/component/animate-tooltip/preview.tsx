import {
  AnimateTooltip,
  AnimateTooltipGroup,
} from "@/components/lazy-ui/animate-tooltip";

import type { CustomizeValues } from "../../../customize";

type Side = "top" | "right" | "bottom" | "left" | "auto";

export function Preview({ values }: { values: CustomizeValues }) {
  const followRaw = (values.followCursor ?? "off") as string;
  const followCursor =
    followRaw === "both"
      ? true
      : followRaw === "x" || followRaw === "y"
        ? (followRaw as "x" | "y")
        : false;
  const side = (values.side ?? "top") as Side;
  const sideOffset = (values.sideOffset ?? 6) as number;
  const delayDuration = (values.delayDuration ?? 150) as number;
  const arrow = (values.arrow ?? false) as boolean;
  const sharedProps = {
    side,
    sideOffset,
    delayDuration,
    followCursor,
    arrow,
  };
  const slideBetween = (values.slideBetween ?? true) as boolean;
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
      "rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200",
    outline:
      "rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-white/10 hover:border-white/25",
    button:
      "rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200",
  } as const;
  return (
    <AnimateTooltipGroup
      openDelay={delayDuration}
      closeDelay={300}
      slideBetween={slideBetween}
    >
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {topRow.map((t) => (
            <AnimateTooltip key={t.label} {...sharedProps} content={t.content}>
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
  );
}
