import { WaveCipher } from "@/components/lazy-ui/wave-cipher";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const columns = (values.columns ?? 3) as number;
  const invertColumns = (values.invertColumns ?? true) as boolean;
  const bandWidth = (values.bandWidth ?? 0.6) as number;
  const characters = (values.characters ?? "0123456789ABCDEF") as string;
  const color = (values.color ?? "#d4d4d4") as string;
  const speed = (values.speed ?? 0.8) as number;
  const size = (values.size ?? 16) as number;
  const noisePower = (values.noisePower ?? 2) as number;
  const glyphChurn = (values.glyphChurn ?? 0.6) as number;
  const opacity = (values.opacity ?? 1) as number;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <WaveCipher
        columns={columns}
        invertColumns={invertColumns}
        bandWidth={bandWidth}
        characters={characters}
        color={color}
        speed={speed}
        size={size}
        noisePower={noisePower}
        glyphChurn={glyphChurn}
        opacity={opacity}
      />
      <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
        <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-300 backdrop-blur-sm">
          Background
        </span>
        <h3 className="text-4xl font-light text-white">Build lazily.</h3>
        <p className="text-sm text-neutral-300">
          Drop Wave Cipher behind any hero, dashboard, or auth screen.
        </p>
      </div>
    </div>
  );
}
