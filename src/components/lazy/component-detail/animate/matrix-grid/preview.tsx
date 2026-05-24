import { useMemo } from "react";

import {
  MatrixGrid,
  type MatrixAnimateName,
  type MatrixGridTrigger,
} from "@/components/lazy-ui/matrix-grid";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const trigger = (values.trigger ?? "instant") as MatrixGridTrigger;
  const revealAngle = (values.revealAngle ?? 0) as number;
  const animateName = (values.animateName ?? "ripple") as
    | MatrixAnimateName
    | "none";
  const color1 = (values.color1 ?? "#d4d4d4") as string;
  const color2 = (values.color2 ?? "#ffffff") as string;
  const coverage = (values.coverage ?? 1) as number;
  const dotSize = (values.dotSize ?? 3) as number;
  const gap = (values.gap ?? 4) as number;
  const speed = (values.speed ?? 1) as number;
  const animateDuration = (values.animateDuration ?? 3) as number;
  const animateIntensity = (values.animateIntensity ?? 10) as number;
  const fps = (values.fps ?? 60) as number;
  const flicker = (values.flicker ?? false) as boolean;
  const animateLoop = (values.animateLoop ?? true) as boolean;

  const colors = useMemo(() => [color1, color2], [color1, color2]);
  const animate = useMemo(
    () =>
      animateName === "none"
        ? undefined
        : {
            name: animateName,
            duration: animateDuration,
            intensity: animateIntensity,
            loop: animateLoop,
          },
    [animateName, animateDuration, animateIntensity, animateLoop],
  );

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_50%_30%,#161616_0%,#050505_70%)]">
        <MatrixGrid
          colors={colors}
          dotSize={dotSize}
          gap={gap}
          coverage={coverage}
          speed={speed}
          revealAngle={revealAngle}
          trigger={trigger}
          flicker={flicker}
          animate={animate}
          fps={fps}
          className="absolute inset-0"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08), transparent 55%)",
          }}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[10px] font-medium tracking-[0.22em] text-white/70 uppercase">
            Matrix grid
          </span>
          <h3
            className="mt-3 text-6xl leading-none font-normal tracking-tight text-white"
            style={{
              fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
              textShadow: "0 2px 24px rgba(0,0,0,0.65)",
            }}
          >
            Build <span className="italic">lazily.</span>
          </h3>
          <p className="mt-4 max-w-sm text-xs font-light text-white/60">
            {trigger === "hover"
              ? "Hover the panel to sweep dots in."
              : trigger === "click"
                ? "Click to toggle the reveal."
                : animateName === "sparkle"
                  ? "Dots twinkle on their own clocks."
                  : `Reveal sweeps at ${Math.round(revealAngle)}°${animateName === "none" ? "" : `, riding a ${animateName} wave`}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
