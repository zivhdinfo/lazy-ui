export type Mode = "preview" | "code";
export type Device = "desktop" | "tablet" | "mobile";

/** Preset widths in pixels. `null` means full container width. */
export const DEVICE_WIDTHS: Record<Device, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 320,
};

export const MIN_PREVIEW_WIDTH = 280;

/** Map a viewport width (px) to the closest device preset. */
export function deviceFromViewport(viewport: number): Device {
  if (viewport < 768) return "mobile";
  if (viewport < 1024) return "tablet";
  return "desktop";
}

/** Per-slug stage min-height override. Larger mocks need more vertical room. */
export const STAGE_MIN_HEIGHT: Record<string, number> = {
  iphone: 640,
  "pricing-1": 1000,
  "pricing-2": 880,
  "pricing-3": 920,
  "pricing-4": 1100,
  "pricing-5": 880,
  "wave-cipher": 560,
  "horizon-cipher": 560,
  "orbit-cipher": 560,
  "orbit-bloom": 560,
  "orbit-mesh": 560,
  "aurora-mesh": 560,
  "shadow-mesh": 560,
  "prism-drift": 560,
  "chroma-flow": 680,
  "slime-background": 560,
  neumorphism: 560,
  "ripple-surface": 560,
  "liquid-chrome": 560,
  "bling-transition": 560,
  "particle-halo": 560,
  "liquid-reveal": 560,
  "liquid-transition": 560,
};
