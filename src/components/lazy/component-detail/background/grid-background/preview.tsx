"use client";

import {
  GridBackground,
  type GridBackgroundFade,
  type GridBackgroundVariant,
} from "@/components/lazy-ui/grid-background";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const variant = (values.variant ?? "dots") as GridBackgroundVariant;
  const fade = (values.fade ?? "edges") as GridBackgroundFade;
  const color = (values.color ?? "rgba(255,255,255,0.16)") as string;
  const size = (values.size ?? 24) as number;
  const lineWidth = (values.lineWidth ?? 1) as number;
  const dotSize = (values.dotSize ?? 3) as number;
  const dashLength = (values.dashLength ?? 3) as number;
  const dashGap = (values.dashGap ?? 5) as number;
  const crossSize = (values.crossSize ?? 5) as number;
  const fadeStrength = (values.fadeStrength ?? 1) as number;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050505]">
        <GridBackground
          variant={variant}
          size={size}
          lineWidth={lineWidth}
          dotSize={dotSize}
          dashLength={dashLength}
          dashGap={dashGap}
          crossSize={crossSize}
          color={color}
          fade={fade}
          fadeStrength={fadeStrength}
        />
      </div>
    </div>
  );
}
