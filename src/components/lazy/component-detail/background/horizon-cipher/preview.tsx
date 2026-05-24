import { HorizonCipher } from "@/components/lazy-ui/horizon-cipher";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const columns = (values.columns ?? 32) as number;
  const depthRows = (values.depthRows ?? 22) as number;
  const fontScale = (values.fontScale ?? 0.9) as number;
  const scrollSpeed = (values.scrollSpeed ?? 1) as number;
  const waveSpeed = (values.waveSpeed ?? 1) as number;
  const wavePower = (values.wavePower ?? 6) as number;
  const waveFrequency = (values.waveFrequency ?? 3) as number;
  const waveAmplitude = (values.waveAmplitude ?? 1.4) as number;
  const baseAlpha = (values.baseAlpha ?? 0.07) as number;
  const colorSpeed = (values.colorSpeed ?? 1) as number;
  const opacity = (values.opacity ?? 1) as number;
  const color1 = (values.color1 ?? "#290596") as string;
  const color2 = (values.color2 ?? "#93229D") as string;
  const characters = (values.characters ?? "0123456789ABCDEF") as string;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <HorizonCipher
        columns={columns}
        depthRows={depthRows}
        fontScale={fontScale}
        scrollSpeed={scrollSpeed}
        waveSpeed={waveSpeed}
        wavePower={wavePower}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        baseAlpha={baseAlpha}
        colorSpeed={colorSpeed}
        opacity={opacity}
        color1={color1}
        color2={color2}
        characters={characters}
      />
      <div className="pointer-events-none relative z-10 flex max-w-md flex-col items-center gap-4 px-8 text-center">
        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-200 backdrop-blur-sm">
          Background
        </span>
        <h3 className="text-4xl font-light text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          Build lazily.
        </h3>
        <p className="text-sm text-neutral-300">
          Drop Horizon Cipher behind any hero, dashboard, or landing page.
        </p>
      </div>
    </div>
  );
}
