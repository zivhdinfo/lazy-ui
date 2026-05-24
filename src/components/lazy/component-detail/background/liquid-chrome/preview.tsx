import {
  LiquidChrome,
  type LiquidChromePalette,
} from "@/components/lazy-ui/liquid-chrome";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const palette = (values.palette ?? "nightfire") as LiquidChromePalette;
  const speed = (values.speed ?? 0.45) as number;
  const scale = (values.scale ?? 0.8) as number;
  const warp = (values.warp ?? 0.45) as number;
  const relief = (values.relief ?? 0.85) as number;
  const tilt = (values.tilt ?? 45) as number;
  const highlight = (values.highlight ?? 1.45) as number;
  const roughness = (values.roughness ?? 0.58) as number;
  const ambient = (values.ambient ?? 0.28) as number;
  const mouseFollow = (values.mouseFollow ?? true) as boolean;
  const mouseInfluence = (values.mouseInfluence ?? 0.24) as number;
  const showContent = (values.showContent ?? true) as boolean;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <LiquidChrome
        palette={palette}
        speed={speed}
        scale={scale}
        warp={warp}
        relief={relief}
        tilt={tilt}
        highlight={highlight}
        roughness={roughness}
        ambient={ambient}
        mouseFollow={mouseFollow}
        mouseInfluence={mouseInfluence}
        className="h-[480px] w-full rounded-2xl"
      >
        {showContent && (
          <>
            <header className="relative z-10 flex items-center justify-between p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span
                  className="inline-block h-5 w-5 rounded-md"
                  style={{
                    background:
                      "linear-gradient(180deg, #fff 0%, #d4d4d4 50%, #8a8a8a 100%)",
                  }}
                />
                Lazy-ui
              </div>
            </header>

            <main className="relative z-10 max-w-md px-6 pt-12 pb-8 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-light text-white/85 backdrop-blur-md">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#ffffff" }}
                />
                Liquid Chrome
              </div>
              <h1
                className="text-4xl leading-tight tracking-tight"
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), 'Instrument Serif', serif",
                  textShadow: "0 2px 24px rgba(0,0,0,0.75)",
                }}
              >
                Build <span className="italic">fluidly.</span>
              </h1>
              <p
                className="mt-3 max-w-sm text-[11px] font-light leading-relaxed text-white/80"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.85)" }}
              >
                Two coloured studio lights reflecting across a domain-warped
                inky surface — gold from the upper-left, electric blue from
                the right, with sparkle dust catching the crests.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button className="rounded-full border border-white/25 px-5 py-2 text-[11px] font-light text-white transition-colors hover:bg-white/10">
                  Browse
                </button>
                <button className="rounded-full bg-white px-5 py-2 text-[11px] font-medium text-black transition-colors hover:bg-white/90">
                  Get started
                </button>
              </div>
            </main>
          </>
        )}
      </LiquidChrome>
    </div>
  );
}
