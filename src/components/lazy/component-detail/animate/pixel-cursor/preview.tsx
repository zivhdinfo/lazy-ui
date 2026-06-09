import { PixelCursor } from "@/components/lazy-ui/pixel-cursor";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const color = (values.color ?? "#22d3ee") as string;
  const edgeColor1 = (values.edgeColor1 ?? "#ffffff") as string;
  const edgeColor2 = (values.edgeColor2 ?? "#a78bfa") as string;
  const pixelSize = (values.pixelSize ?? 5) as number;
  const spread = (values.spread ?? 10) as number;
  const density = (values.density ?? 0.75) as number;
  const persistence = (values.persistence ?? 2.9) as number;
  const lag = (values.lag ?? 0.95) as number;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_50%_30%,#161616_0%,#050505_70%)]">
        <PixelCursor
          color={color}
          edgeColor1={edgeColor1}
          edgeColor2={edgeColor2}
          pixelSize={pixelSize}
          spread={spread}
          density={density}
          persistence={persistence}
          lag={lag}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
