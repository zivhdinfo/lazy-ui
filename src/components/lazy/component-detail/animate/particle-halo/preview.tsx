import { ParticleHalo } from "@/components/lazy-ui/particle-halo";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const color1 = (values.color1 ?? "#a3a3a3") as string;
  const color2 = (values.color2 ?? "#ffffff") as string;
  const colors = [color1, color2];
  const shape = (values.shape ?? "circle") as
    | "circle"
    | "square"
    | "line"
    | "spark";
  const mode = (values.mode ?? "wave") as
    | "wave"
    | "pulse"
    | "spiral"
    | "chaos";
  const particleCount = (values.particleCount ?? 1800) as number;
  const radius = (values.radius ?? 0.7) as number;
  const intensity = (values.intensity ?? 1) as number;
  const duration = (values.duration ?? 16) as number;
  const trail = (values.trail ?? 0) as number;
  const sizeMax = (values.sizeMax ?? 8) as number;
  const glow = (values.glow ?? true) as boolean;

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4">
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl bg-black">
        <ParticleHalo
          colors={colors}
          particleCount={Math.round(particleCount)}
          radius={radius}
          intensity={intensity}
          duration={duration}
          shape={shape}
          mode={mode}
          trail={trail}
          particleSize={[2, Math.round(sizeMax)]}
          glow={glow}
          glowColor={color2}
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[10px] font-medium tracking-[0.22em] text-white/70 uppercase">
            Particle halo
          </span>
          <h3 className="mt-3 text-6xl leading-none font-semibold tracking-tighter text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
            Build <span className="italic font-normal">lazily.</span>
          </h3>
          <p className="mt-4 max-w-sm text-xs font-light text-white/70">
            Move your cursor around the ring to sweep the wave.
          </p>
        </div>
      </div>
    </div>
  );
}
