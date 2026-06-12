import {
  MatrixGrid,
  type MatrixAnimateName,
  type MatrixGridTrigger,
} from "@/components/lazy-ui/matrix-grid";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import {
  fmtCount,
  fmtPct,
  fmtPx,
  fmtSec1,
  fmtX,
} from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

const colorOptions = [
  { value: "#d4d4d4", label: "Silver" },
  { value: "#ffffff", label: "White" },
  { value: "#a3a3a3", label: "Mid silver" },
  { value: "#525252", label: "Dim" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#a78bfa", label: "Lavender" },
  { value: "#34d399", label: "Mint" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ec4899", label: "Pink" },
  { value: "#fb923c", label: "Orange" },
];

const angleFmt = (n: number) => `${Math.round(n)}°`;

// Escape-hatch path: a sized fill frame with overlay copy. MatrixGrid reads its
// props through an internal paramsRef, so building fresh `colors`/`animate`
// objects each render is cheap and never restarts the canvas.
export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/matrix-grid"),
  export: "MatrixGrid",
  stageMinHeight: 560,
  render: (v) => {
    const trigger = (v.trigger ?? "instant") as MatrixGridTrigger;
    const revealAngle = (v.revealAngle ?? 0) as number;
    const animateName = (v.animateName ?? "ripple") as
      | MatrixAnimateName
      | "none";
    const colors = [
      (v.color1 ?? "#d4d4d4") as string,
      (v.color2 ?? "#ffffff") as string,
    ];
    const animate =
      animateName === "none"
        ? undefined
        : {
            name: animateName,
            duration: (v.animateDuration ?? 3) as number,
            intensity: (v.animateIntensity ?? 10) as number,
            loop: (v.animateLoop ?? true) as boolean,
          };

    return (
      <div className="flex w-full">
        <div className="relative min-h-[260px] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--preview-bg)]">
          <MatrixGrid
            colors={colors}
            dotSize={(v.dotSize ?? 3) as number}
            gap={(v.gap ?? 4) as number}
            coverage={(v.coverage ?? 1) as number}
            speed={(v.speed ?? 1) as number}
            revealAngle={revealAngle}
            trigger={trigger}
            flicker={(v.flicker ?? false) as boolean}
            animate={animate}
            fps={(v.fps ?? 60) as number}
            className="absolute inset-0"
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08), transparent 55%)",
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-8">
            <span className="text-[10px] font-medium tracking-[0.22em] text-[var(--text-3)] uppercase">
              Matrix grid
            </span>
            <h3
              className="mt-3 text-4xl leading-none font-normal tracking-tight text-[var(--text)] sm:text-6xl"
              style={{
                fontFamily:
                  "var(--font-instrument-serif), 'Instrument Serif', serif",
              }}
            >
              Build <span className="italic">lazily.</span>
            </h3>
            <p className="mt-4 max-w-sm text-xs font-light text-[var(--text-3)]">
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
  },
  controls: [
    select(
      "trigger",
      "Trigger",
      [
        { value: "instant", label: "Instant" },
        { value: "mount", label: "Mount" },
        { value: "hover", label: "Hover" },
        { value: "click", label: "Click" },
      ],
      "instant",
    ),
    select(
      "animateName",
      "Animate",
      [
        { value: "none", label: "None" },
        { value: "ripple", label: "Ripple" },
        { value: "diagonal", label: "Diagonal" },
        { value: "sparkle", label: "Sparkle" },
      ],
      "ripple",
    ),
    select("color1", "Color 1", colorOptions, "#d4d4d4"),
    select("color2", "Color 2", colorOptions, "#ffffff"),
    slider("revealAngle", "Reveal angle", {
      min: 0,
      max: 360,
      step: 15,
      defaultValue: 0,
      format: angleFmt,
    }),
    slider("coverage", "Coverage", {
      min: 0.1,
      max: 1,
      step: 0.05,
      defaultValue: 1,
      format: fmtPct,
    }),
    slider("dotSize", "Dot size", {
      min: 1,
      max: 8,
      step: 1,
      defaultValue: 3,
      format: fmtPx,
    }),
    slider("gap", "Gap", { min: 1, max: 12, step: 1, defaultValue: 4, format: fmtPx }),
    slider("speed", "Speed", {
      min: 0.2,
      max: 3,
      step: 0.1,
      defaultValue: 1,
      format: fmtX,
    }),
    slider("animateDuration", "Animate cycle", {
      min: 1,
      max: 8,
      step: 0.5,
      defaultValue: 3,
      format: fmtSec1,
    }),
    slider("animateIntensity", "Animate intensity", {
      min: 0,
      max: 24,
      step: 1,
      defaultValue: 10,
      format: fmtPx,
    }),
    slider("fps", "FPS cap", {
      min: 24,
      max: 60,
      step: 6,
      defaultValue: 60,
      format: fmtCount,
    }),
    toggle("flicker", "Flicker", false),
    toggle("animateLoop", "Loop animate", true),
  ],
};
