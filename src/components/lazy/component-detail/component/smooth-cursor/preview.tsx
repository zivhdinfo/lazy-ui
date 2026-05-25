import {
  SmoothCursor,
  type SmoothCursorTrigger,
} from "@/components/lazy-ui/smooth-cursor";

import type { CustomizeValues } from "../../../customize";

const LABELS: Record<string, { text: string; label: string }> = {
  "#f97316": { text: "#fff7ed", label: "Ember" },
  "#10b981": { text: "#ecfdf5", label: "Mint" },
  "#38bdf8": { text: "#082f49", label: "Sky" },
  "#fb7185": { text: "#fff1f2", label: "Rose" },
} as const;

export function Preview({ values }: { values: CustomizeValues }) {
  const trigger = (values.trigger ?? "hover") as SmoothCursorTrigger;
  const color = (values.color ?? "#f97316") as string;
  const size = (values.size ?? 28) as number;
  const tiltStrength = (values.tiltStrength ?? 12) as number;
  const pressScale = (values.pressScale ?? 0.92) as number;
  const showLabel = (values.showLabel ?? true) as boolean;
  const theme = LABELS[color] ?? LABELS["#f97316"];

  return (
    <div className="flex min-h-[460px] w-full items-center justify-center bg-neutral-950 p-5">
      <SmoothCursor
        label={theme.label}
        color={color}
        textColor={theme.text}
        trigger={trigger}
        size={size}
        tiltStrength={tiltStrength}
        pressScale={pressScale}
        showLabel={showLabel}
        className="grid w-full max-w-[720px] gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.13),transparent_34%),linear-gradient(135deg,#101010,#050505)] p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          {["Prototype", "Motion", "Review"].map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-white/25 hover:bg-white/[0.1]"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Timeline", "Assets", "Launch"].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-black/35 p-4 text-sm text-neutral-300"
            >
              {item}
            </div>
          ))}
        </div>
      </SmoothCursor>
    </div>
  );
}
