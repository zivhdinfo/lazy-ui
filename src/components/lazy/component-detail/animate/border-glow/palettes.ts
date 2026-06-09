// Sample palettes for the Border Glow preview. The component's `colors` prop
// takes any number of colors — these presets just demonstrate a few lengths.

export const PALETTES: Record<string, string[]> = {
  iris: ["#a78bfa", "#f0abfc", "#67e8f9"],
  aurora: ["#34d399", "#67e8f9", "#a78bfa"],
  sunset: ["#fb7185", "#f59e0b", "#f0abfc"],
  spectrum: ["#fb7185", "#f59e0b", "#34d399", "#67e8f9", "#a78bfa"],
  gold: ["#f59e0b", "#ffffff"],
  mono: ["#ffffff", "#d4d4d4", "#a3a3a3"],
};

export const PALETTE_OPTIONS = [
  { value: "iris", label: "Iris" },
  { value: "aurora", label: "Aurora" },
  { value: "sunset", label: "Sunset" },
  { value: "spectrum", label: "Spectrum" },
  { value: "gold", label: "Gold" },
  { value: "mono", label: "Mono" },
];

export const DEFAULT_PALETTE = "iris";
